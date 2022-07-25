import * as functions from "firebase-functions";
import * as express from 'express'
require('isomorphic-fetch')

import * as admin from 'firebase-admin'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


admin.initializeApp(functions.config().firebase);

const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();



const validateFirebaseIdToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !req.cookies.__session) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
          'Make sure you authorize your request by providing the following HTTP header:',
          'Authorization: Bearer <Firebase ID Token>',
          'or by passing a "__session" cookie.');
      res.status(403).send('Unauthorized');
      return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
        (req as any).user = decodedIdToken;
        return next();
    }).catch((error) => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
    });
};

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);


app.get('/conferences/update', async (req, res) => {
    await fetch(functions.config().troll.api_url + '/api/events?token=' + functions.config().troll.api_key)
        .then(async (response) => {
            if (response.status >= 400) {
                const body = await response.text()
                throw new Error(body);
            }

            return response.json();
        }).then(async (conferences) => {
            await Promise.all(conferences.events.map((conference: any) =>
                admin.database().ref(`/conferences/conference_${conference.id}/info`)
                                .set(conference)
            ));

            await Promise.all(conferences.events.map((conference: any) =>
                admin.database().ref(`/conferences/conference_${conference.id}/id`)
                                .set(conference.id)
            ));
        }).catch((err) => res.status(500).send(err.message));

    res.send('Update was successfull');
});

app.get('/conferences/:conferenceId/update', async (req, res) => {
    const conferenceId = req.params.conferenceId;

    await Promise.all([
        fetchAndUpdateActivities(conferenceId),
        fetchAndUpdateCompanies(conferenceId),
        fetchAndUpdateRooms(conferenceId),
        fetchAndUpdateAttendees(conferenceId)
    ]);

    await admin.database().ref(`/conferences/conference_${conferenceId}/lastTimeUpdate`)
            .set((new Date()).toISOString());

    res.send('Update successful');
});

app.get('/conferences/:conferenceId/upload', async (req, res) => {
    const conferenceId = req.params.conferenceId;

    await fetchAttendanceAndUpdate(conferenceId);

    await admin.database().ref(`/conferences/conference_${conferenceId}/uploadTime`)
            .set((new Date()).toISOString());

    res.send('Update successful');
});

exports.app = functions.https.onRequest(app);

async function fetchAttendanceAndUpdate(conferenceId: string) {
    await admin.database().ref(`/attendance/conference_${conferenceId}`).once('value')
        .then(async snapshot => {
            const data = snapshot.val();

            const lastTimeUpload = await admin.database().ref(`/conferences/conference_${conferenceId}/uploadTime`).once('value');

            if (data.onspot && !lastTimeUpload) {
                let attendees: any[] = [];
                Object.keys(data.onspot).map(key => {
                    let checked_in = null
                    let checked_out = null

                    if (data.checkin[key]) {
                      checked_in = data.checkin[key].check_in || null;
                      checked_out = data.checkin[key].check_out || null;
                    }

                    if (!data.onspot[key].uploaded) {
                        attendees.push({
                            checked_in,
                            checked_out,
                            email: data.onspot[key].email,
                            first_name: data.onspot[key].name,
                            last_name: data.onspot[key].surname,
                            phone: data.onspot[key].phone,
                            school: data.onspot[key].school,
                            students_year: data.onspot[key].school,
                            ticket_class_name: "ON_SPOT"
                        });
                    }
                });

                console.log('Creating new attendees!');
                console.log(attendees);
                await fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/attendees?token=${functions.config().troll.api_key}`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'post',
                        body: JSON.stringify({ attendees })
                    }
                ).then(async (response) => {
                    if (response.status >= 400) {
                      const body = await response.text()
                        console.log(response.status);
                        console.log(body);
                        console.log(response);
                        throw new Error(body);
                    }
    
                    return response.json();
                }).then(async data => {
                    await Promise.all(Object.keys(data.onspot).map(key =>
                        admin.database().ref(`/attendance/conference_${conferenceId}/onspot/${key}/uploaded`)
                        .set(true)
                    ));

                    return data;
                });
            }

            if (data.checkin) {
                let attendees: any[] = [];

                Object.keys(data.checkin).forEach(key => {
                    if (!data.onspot || !data.onspot[key]) {
                        attendees.push({
                            checked_in: data.checkin[key].check_in || null,
                            checked_out: data.checkin[key].check_out || null,
                            id: parseInt(key, 10),
                        });
                    }
                });

                console.log('Updating conference checkin times!');
                console.log(attendees);
                await fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/attendees?token=${functions.config().troll.api_key}`,
                    {
                        method: 'patch',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attendees })
                    }
                ).then(async (response) => {
                    if (response.status >= 400) {
                        const body = await response.text()
                        throw new Error(body);
                    }
    
                    return response.json();
                }).then(data => console.log(data));
            }

            if (data.activities) {
                Object.keys(data.activities).forEach(async key => {
                    let keyParts = key.split('_');
                    const activityId = keyParts[keyParts.length - 1];

                    keyParts.pop();
                    const activityType = keyParts.join('_');

                    if (activityType !== 'WORKSHOP' && activityType !== 'WORKSHOP_XL' && activityType !== 'SPEED_DATING') {
                        return true;
                    }

                    let attendees: any[] = [];
                    Object.keys(data.activities[key]).forEach(attendeeKey => {
                        if (!data.onspot || !data.onspot[attendeeKey]) {
                            attendees.push({
                                id: parseInt(attendeeKey, 10),
                                attended: data.activities[key][attendeeKey].check_in ? true : false
                            });
                        } else {
                            console.log(`New attendee is on workshop!: ${attendeeKey} ${key}`);
                        }
                    });

                    console.log('Updating activities checkin times!');
                    console.log(attendees);
                    await fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/activities/${activityId}/attendees/attendance?token=${functions.config().troll.api_key}`,
                        {
                            headers: { 'Content-Type': 'application/json' },
                            method: 'post',
                            body: JSON.stringify({ attendees, type: activityType })
                        }
                    ).then(async (response) => {
                        if (response.status >= 400) {
                            const body = await response.text()
                            console.log(response.status);
                            console.log(body);
                            console.log(response);
                            throw new Error(body);
                        }
        
                        return response.json();
                    }).then(data => console.log(data));
                });
            }
        });
}

async function fetchAndUpdateAttendees(conferenceId: string) {
    let totalAttendees = 0;
    let nextPage = functions.config().troll.api_url + `/api/attendees/${conferenceId}/paginated/500/with-assignments?token=${functions.config().troll.api_key}`;
    do {
        const attendees = await fetch(nextPage)
            .then(async (response) => {
                if (response.status >= 400) {
                    const body = await response.text()
                    throw new Error(body);
                }

                return response.json();
            });
        
        totalAttendees = attendees.attendees.total;

        await Promise.all(attendees.attendees.data.map((attendee: any) => {
            const promiseArray = [];

            // create attendee node
            promiseArray.push(
                admin.database().ref(`/attendees/conference_${conferenceId}/${attendee.id}`)
                .set(attendee)
            );

            // create list of assigned students in activities
            if (attendee.assignments) {
                attendee.assignments.forEach((assignment: any) => {
                    let activityKey = ''
                    if (assignment.type === 'WORKSHOP' || assignment.type === 'WORKSHOP_XL'){
                        activityKey = `${assignment.type}_${assignment.workshop_id}`;
                    }

                    if (assignment.type === 'SPEED_DATING'){
                        activityKey = `${assignment.type}_${assignment.speed_dating_id}`;
                    }

                    if (assignment.assigned) {
                        promiseArray.push(
                            admin.database().ref(`/activities/conference_${conferenceId}/${activityKey}/attendees/${attendee.id}`)
                            .set(true)
                        );
                    }
                })
            }
            return Promise.all(promiseArray);
        }));

        nextPage = attendees.attendees.next_page_url;
        if (nextPage !== null) {
            nextPage = nextPage + `&token=${functions.config().troll.api_key}`;
        }
    } while (nextPage !== null);
    
    return admin.database().ref(`/conferences/conference_${conferenceId}/attendeesCount`)
        .set(totalAttendees);
}

function fetchAndUpdateCompanies(conferenceId: string) {
    return fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/companies?token=${functions.config().troll.api_key}`)
        .then(async (response) => {
            if (response.status >= 400) {
                const body = await response.text()
                throw new Error(body);
            }

            return response.json();
        }).then(async (companies) => {
            await Promise.all(companies.companies.map((company: any) =>
                admin.database().ref(`/companies/conference_${conferenceId}/${company.id}`)
                    .set(company)
            ));
        })
}

function fetchAndUpdateRooms(conferenceId: string) {
    return fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/rooms?token=${functions.config().troll.api_key}`)
        .then(async (response) => {
            if (response.status >= 400) {
                const body = await response.text()
                throw new Error(body);
            }

            return response.json();
        }).then(async (rooms) => {
            await Promise.all(rooms.rooms.map((room: any) =>
                admin.database().ref(`/rooms/conference_${conferenceId}/${room.id}`)
                    .set(room)
            ));
        })
}

function fetchAndUpdateActivities(conferenceId: string) {
    return fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/activities?token=${functions.config().troll.api_key}`)
        .then(async (response) => {
            if (response.status >= 400) {
                const body = await response.text()
                throw new Error(body);
            }

            return response.json();
        }).then(async (activities) => {
            await Promise.all(activities.activities.map((activity: any) =>
                admin.database().ref(`/activities/conference_${conferenceId}/${activity.type}_${activity.id}`)
                                .set(activity)
            ));
            await admin.database().ref(`/conferences/conference_${conferenceId}/activitiesCount`)
            .set(activities.activities.length)
        })
}