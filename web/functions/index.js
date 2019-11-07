'use strict';var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);let fetchAttendanceAndUpdate = (() => {var _ref5 = (0, _asyncToGenerator3.default)(


































































































    function* (conferenceId) {
        yield admin.database().ref(`/attendance/conference_${conferenceId}`).once('value').
        then((() => {var _ref6 = (0, _asyncToGenerator3.default)(function* (snapshot) {
                const data = snapshot.val();

                const lastTimeUpload = yield admin.database().ref(`/conferences/conference_${conferenceId}/uploadTime`).once('value');

                if (data.onspot && !lastTimeUpload) {
                    let attendees = [];
                    Object.keys(data.onspot).map(function (key) {
                        let checked_in = null;
                        let checked_out = null;

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
                                ticket_class_name: "ON_SPOT" });

                        }
                    });

                    console.log('Creating new attendees!');
                    console.log(attendees);
                    yield fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/attendees?token=${functions.config().troll.api_key}`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'post',
                        body: JSON.stringify({ attendees }) }).

                    then(function (response) {
                        if (response.status >= 400) {
                            console.log(response.status);
                            console.log(response.message);
                            console.log(response);
                            throw new Error(response);
                        }

                        return response.json();
                    }).then((() => {var _ref7 = (0, _asyncToGenerator3.default)(function* (data) {
                            yield Promise.all(Object.keys(data.onspot).map(function (key) {return (
                                    admin.database().ref(`/attendance/conference_${conferenceId}/onspot/${key}/uploaded`).
                                    set(true));}));


                            return data;
                        });return function (_x10) {return _ref7.apply(this, arguments);};})());
                }

                if (data.checkin) {
                    let attendees = [];

                    Object.keys(data.checkin).forEach(function (key) {
                        if (!data.onspot || !data.onspot[key]) {
                            attendees.push({
                                checked_in: data.checkin[key].check_in || null,
                                checked_out: data.checkin[key].check_out || null,
                                id: parseInt(key, 10) });

                        }
                    });

                    console.log('Updating conference checkin times!');
                    console.log(attendees);
                    yield fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/attendees?token=${functions.config().troll.api_key}`,
                    {
                        method: 'patch',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attendees }) }).

                    then(function (response) {
                        if (response.status >= 400) {
                            throw new Error(response);
                        }

                        return response.json();
                    }).then(function (data) {return console.log(data);});
                }

                if (data.activities) {
                    Object.keys(data.activities).forEach((() => {var _ref8 = (0, _asyncToGenerator3.default)(function* (key) {
                            let keyParts = key.split('_');
                            const activityId = keyParts[keyParts.length - 1];

                            keyParts.pop();
                            const activityType = keyParts.join('_');

                            if (activityType !== 'WORKSHOP' && activityType !== 'WORKSHOP_XL' && activityType !== 'SPEED_DATING') {
                                return true;
                            }

                            let attendees = [];
                            Object.keys(data.activities[key]).forEach(function (attendeeKey) {
                                if (!data.onspot || !data.onspot[attendeeKey]) {
                                    attendees.push({
                                        id: parseInt(attendeeKey, 10),
                                        attended: data.activities[key][attendeeKey].check_in ? true : false });

                                } else {
                                    console.log(`New attendee is on workshop!: ${attendeeKey} ${key}`);
                                }
                            });

                            console.log('Updating activities checkin times!');
                            console.log(attendees);
                            yield fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/activities/${activityId}/attendees/attendance?token=${functions.config().troll.api_key}`,
                            {
                                headers: { 'Content-Type': 'application/json' },
                                method: 'post',
                                body: JSON.stringify({ attendees, type: activityType }) }).

                            then(function (response) {
                                if (response.status >= 400) {
                                    console.log(response.status);
                                    console.log(response.message);
                                    console.log(response);
                                    throw new Error(response);
                                }

                                return response.json();
                            }).then(function (data) {return console.log(data);});
                        });return function (_x11) {return _ref8.apply(this, arguments);};})());
                }
            });return function (_x9) {return _ref6.apply(this, arguments);};})());
    });return function fetchAttendanceAndUpdate(_x8) {return _ref5.apply(this, arguments);};})();let fetchAndUpdateAttendees = (() => {var _ref9 = (0, _asyncToGenerator3.default)(

    function* (conferenceId) {
        let totalAttendees = 0;
        let nextPage = functions.config().troll.api_url + `/api/attendees/${conferenceId}/paginated/500/with-assignments?token=${functions.config().troll.api_key}`;
        do {
            const attendees = yield fetch(nextPage).
            then(function (response) {
                if (response.status >= 400) {
                    throw new Error(response);
                }

                return response.json();
            });

            totalAttendees = attendees.attendees.total;

            yield Promise.all(attendees.attendees.data.map(function (attendee) {
                const promiseArray = [];

                // create attendee node
                promiseArray.push(
                admin.database().ref(`/attendees/conference_${conferenceId}/${attendee.id}`).
                set(attendee));


                // create list of assigned students in activities
                if (attendee.assignments) {
                    attendee.assignments.forEach(function (assignment) {
                        let activityKey = '';
                        if (assignment.type === 'WORKSHOP' || assignment.type === 'WORKSHOP_XL') {
                            activityKey = `${assignment.type}_${assignment.workshop_id}`;
                        }

                        if (assignment.type === 'SPEED_DATING') {
                            activityKey = `${assignment.type}_${assignment.speed_dating_id}`;
                        }

                        if (assignment.assigned) {
                            promiseArray.push(
                            admin.database().ref(`/activities/conference_${conferenceId}/${activityKey}/attendees/${attendee.id}`).
                            set(true));

                        }
                    });
                }
                return Promise.all(promiseArray);
            }));

            nextPage = attendees.attendees.next_page_url;
            if (nextPage !== null) {
                nextPage = nextPage + `&token=${functions.config().troll.api_key}`;
            }
        } while (nextPage !== null);

        return admin.database().ref(`/conferences/conference_${conferenceId}/attendeesCount`).
        set(totalAttendees);
    });return function fetchAndUpdateAttendees(_x12) {return _ref9.apply(this, arguments);};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const functions = require('firebase-functions');require('es6-promise').polyfill();require('isomorphic-fetch');const admin = require('firebase-admin');admin.initializeApp(functions.config().firebase);const express = require('express');const cookieParser = require('cookie-parser')();const cors = require('cors')({ origin: true });const app = express();const validateFirebaseIdToken = (req, res, next) => {if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !req.cookies.__session) {console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');res.status(403).send('Unauthorized');return;}let idToken;if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {// Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];} else {// Read the ID Token from cookie.
        idToken = req.cookies.__session;}admin.auth().verifyIdToken(idToken).then(decodedIdToken => {req.user = decodedIdToken;return next();}).catch(error => {console.error('Error while verifying Firebase ID token:', error);res.status(403).send('Unauthorized');});};app.use(cors);app.use(cookieParser);app.use(validateFirebaseIdToken);app.get('/conferences/update', (() => {var _ref = (0, _asyncToGenerator3.default)(function* (req, res) {const conferences = yield fetch(functions.config().troll.api_url + '/api/events?token=' + functions.config().troll.api_key).then(function (response) {if (response.status >= 400) {throw new Error(response);}return response.json();}).then((() => {var _ref2 = (0, _asyncToGenerator3.default)(function* (conferences) {yield Promise.all(conferences.events.map(function (conference) {return admin.database().ref(`/conferences/conference_${conference.id}/info`).set(conference);}));yield Promise.all(conferences.events.map(function (conference) {return admin.database().ref(`/conferences/conference_${conference.id}/id`).set(conference.id);}));});return function (_x3) {return _ref2.apply(this, arguments);};})()).catch(function (err) {return res.status(500).send(err.message);});res.send('Update was successfull');});return function (_x, _x2) {return _ref.apply(this, arguments);};})());app.get('/conferences/:conferenceId/update', (() => {var _ref3 = (0, _asyncToGenerator3.default)(function* (req, res) {const conferenceId = req.params.conferenceId;yield Promise.all([fetchAndUpdateActivities(conferenceId), fetchAndUpdateCompanies(conferenceId), fetchAndUpdateRooms(conferenceId), fetchAndUpdateAttendees(conferenceId)]);yield admin.database().ref(`/conferences/conference_${conferenceId}/lastTimeUpdate`).set(new Date().toISOString());res.send('Update successful');});return function (_x4, _x5) {return _ref3.apply(this, arguments);};})());app.get('/conferences/:conferenceId/upload', (() => {var _ref4 = (0, _asyncToGenerator3.default)(function* (req, res) {const conferenceId = req.params.conferenceId;yield fetchAttendanceAndUpdate(conferenceId);yield admin.database().ref(`/conferences/conference_${conferenceId}/uploadTime`).set(new Date().toISOString());res.send('Update successful');});return function (_x6, _x7) {return _ref4.apply(this, arguments);};})());exports.app = functions.https.onRequest(app);function fetchAndUpdateCompanies(conferenceId) {
    return fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/companies?token=${functions.config().troll.api_key}`).
    then(response => {
        if (response.status >= 400) {
            throw new Error(response);
        }

        return response.json();
    }).then((() => {var _ref10 = (0, _asyncToGenerator3.default)(function* (companies) {
            yield Promise.all(companies.companies.map(function (company) {return (
                    admin.database().ref(`/companies/conference_${conferenceId}/${company.id}`).
                    set(company));}));

        });return function (_x13) {return _ref10.apply(this, arguments);};})());
}

function fetchAndUpdateRooms(conferenceId) {
    return fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/rooms?token=${functions.config().troll.api_key}`).
    then(response => {
        if (response.status >= 400) {
            throw new Error(response);
        }

        return response.json();
    }).then((() => {var _ref11 = (0, _asyncToGenerator3.default)(function* (rooms) {
            yield Promise.all(rooms.rooms.map(function (room) {return (
                    admin.database().ref(`/rooms/conference_${conferenceId}/${room.id}`).
                    set(room));}));

        });return function (_x14) {return _ref11.apply(this, arguments);};})());
}

function fetchAndUpdateActivities(conferenceId) {
    return fetch(functions.config().troll.api_url + `/api/events/${conferenceId}/activities?token=${functions.config().troll.api_key}`).
    then(response => {
        if (response.status >= 400) {
            throw new Error(response);
        }

        return response.json();
    }).then((() => {var _ref12 = (0, _asyncToGenerator3.default)(function* (activities) {
            yield Promise.all(activities.activities.map(function (activity) {return (
                    admin.database().ref(`/activities/conference_${conferenceId}/${activity.type}_${activity.id}`).
                    set(activity));}));

            yield admin.database().ref(`/conferences/conference_${conferenceId}/activitiesCount`).
            set(activities.activities.length);
        });return function (_x15) {return _ref12.apply(this, arguments);};})());
}