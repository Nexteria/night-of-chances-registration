import format from 'date-fns/format';

export const FETCH_ATTENDEES = 'FETCH_ATTENDEES';
export const FETCH_ATTENDEES_START = 'FETCH_ATTENDEES_START';
export const FETCH_ATTENDEES_SUCCESS = 'FETCH_ATTENDEES_SUCCESS';
export const FETCH_ATTENDEES_ERROR = 'FETCH_ATTENDEES_ERROR';

export const SET_ATTENDEE_ATTENDANCE = 'SET_ATTENDEE_ATTENDANCE';
export const SET_ATTENDEE_ATTENDANCE_START = 'SET_ATTENDEE_ATTENDANCE_START';
export const SET_ATTENDEE_ATTENDANCE_SUCCESS = 'SET_ATTENDEE_ATTENDANCE_SUCCESS';
export const SET_ATTENDEE_ATTENDANCE_ERROR = 'SET_ATTENDEE_ATTENDANCE_ERROR';

export const FETCH_ATTENDANCE = 'FETCH_ATTENDANCE';
export const FETCH_ATTENDANCE_START = 'FETCH_ATTENDANCE_START';
export const FETCH_ATTENDANCE_SUCCESS = 'FETCH_ATTENDANCE_SUCCESS';
export const FETCH_ATTENDANCE_ERROR = 'FETCH_ATTENDANCE_ERROR';

export const ATTENDANCE_SUBSCRIBED = 'ATTENDANCE_SUBSCRIBED';
export const ATTENDANCE_SUBSCRIBED_START = 'ATTENDANCE_SUBSCRIBED_START';
export const ATTENDANCE_SUBSCRIBED_SUCCEED = 'ATTENDANCE_SUBSCRIBED_SUCCEED';
export const ATTENDANCE_SUBSCRIBED_ERROR = 'ATTENDANCE_SUBSCRIBED_ERROR';

export const FETCH_ROOMS = 'FETCH_ROOMS';
export const FETCH_ROOMS_START = 'FETCH_ROOMS_START';
export const FETCH_ROOMS_SUCCESS = 'FETCH_ROOMS_SUCCESS';
export const FETCH_ROOMS_ERROR = 'FETCH_ROOMS_ERROR';

export const FETCH_COMPANIES = 'FETCH_COMPANIES';
export const FETCH_COMPANIES_START = 'FETCH_COMPANIES_START';
export const FETCH_COMPANIES_SUCCESS = 'FETCH_COMPANIES_SUCCESS';
export const FETCH_COMPANIES_ERROR = 'FETCH_COMPANIES_ERROR';

export const FETCH_ACTIVITIES = 'FETCH_ACTIVITIES';
export const FETCH_ACTIVITIES_START = 'FETCH_ACTIVITIES_START';
export const FETCH_ACTIVITIES_SUCCESS = 'FETCH_ACTIVITIES_SUCCESS';
export const FETCH_ACTIVITIES_ERROR = 'FETCH_ACTIVITIES_ERROR';


export const CHANGE_ATTENDEE_SEARCH = 'CHANGE_ATTENDEE_SEARCH';
export const ATTENDANCE_UPDATE = 'ATTENDANCE_UPDATE';
export const TOGGLE_ATTEDNEE_DETAILS = 'TOGGLE_ATTEDNEE_DETAILS';

export function fetchAttendeesIfNeeded(conferenceId) {
  return ({ firebase, getState }) => {
    if (getState().checkin.attendees.size) {
      return { type: 'OPERATION_NOT_NEEDED' };
    }

    return {
      type: FETCH_ATTENDEES,
      payload: {
        promise: Promise.all([
          firebase.database().ref(`/attendees/conference_${conferenceId}`).once('value')
            .then(snapshot => snapshot.val()),
          firebase.database().ref(`/attendance/conference_${conferenceId}/onspot`).once('value')
            .then(snapshot => snapshot.val()),
        ])
      }
    }
  };
}

export function updateAttendance(key, data, operation) {
  return {
    type: ATTENDANCE_UPDATE,
    payload: {
      key,
      data,
      operation,
    }
  };
}

export function subscribeAttendanceIfNeeded(conferenceId) {
  return ({ firebase, getState, dispatch }) => {
    if (getState().checkin.attendanceIsSubscribed) {
      return { type: 'OPERATION_NOT_NEEDED' };
    }

    const state = getState();

    return {
      type: ATTENDANCE_SUBSCRIBED,
      payload: {
        promise: Promise.all([
          firebase.database().ref(`/attendance/conference_${conferenceId}/checkin`)
            .on('child_changed', snapshot => dispatch(updateAttendance(snapshot.key, snapshot.val(), 'change'))),
          firebase.database().ref(`/attendance/conference_${conferenceId}/checkin`)
            .on('child_removed', snapshot => dispatch(updateAttendance(snapshot.key, snapshot.val(), 'delete'))),
          firebase.database().ref(`/attendance/conference_${conferenceId}/checkin`)
            .on('child_added', snapshot => {
              if (state.checkin.hasIn(['attendance', snapshot.key])) {
                dispatch(updateAttendance(snapshot.key, snapshot.val(), 'add'));
              }
            })
        ]),
      }
    }
  };
}

export function fetchAttendanceIfNeeded(conferenceId) {
  return ({ firebase, getState }) => {
    if (getState().checkin.attendance.size && !getState().checkin.attendanceIsSubscribed) {
      return { type: 'OPERATION_NOT_NEEDED' };
    }

    return {
      type: FETCH_ATTENDANCE,
      payload: {
        promise: firebase.database().ref(`/attendance/conference_${conferenceId}/checkin`).once('value')
          .then(snapshot => snapshot.val()),
      }
    }
  };
}

export function fetchCompaniesIfNeeded(conferenceId) {
  return ({ firebase, getState }) => {
    if (getState().checkin.companies.size) {
      return { type: 'OPERATION_NOT_NEEDED' };
    }

    return {
      type: FETCH_COMPANIES,
      payload: {
        promise: firebase.database().ref(`/companies/conference_${conferenceId}`).once('value')
          .then(snapshot => snapshot.val()),
      }
    }
  };
}

export function fetchActivitiesIfNeeded(conferenceId) {
  return ({ firebase, getState }) => {
    if (getState().checkin.activities.size) {
      return { type: 'OPERATION_NOT_NEEDED' };
    }

    return {
      type: FETCH_ACTIVITIES,
      payload: {
        promise: firebase.database().ref(`/activities/conference_${conferenceId}`).once('value')
          .then(snapshot => snapshot.val()),
      }
    }
  };
}

export function toggleAttendeeDetailsDialog(attendeeId) {
  return {
    type: TOGGLE_ATTEDNEE_DETAILS,
    payload: attendeeId,
  };
}

export function fetchRoomsIfNeeded(conferenceId) {
  return ({ firebase, getState }) => {
    if (getState().checkin.rooms.size) {
      return { type: 'OPERATION_NOT_NEEDED' };
    }

    return {
      type: FETCH_ROOMS,
      payload: {
        promise: firebase.database().ref(`/rooms/conference_${conferenceId}`).once('value')
          .then(snapshot => snapshot.val()),
      }
    }
  };
}


export function changeAttendeeSearch(searchString) {
  return {
    type: CHANGE_ATTENDEE_SEARCH,
    payload: searchString,
  }
}

export function setAttendeeAttendance(isCheckedIn, attendeeId, conferenceId) {
  let checkin = null;
  if (isCheckedIn) {
    checkin = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
  }

  return ({ firebase }) => ({
    type: SET_ATTENDEE_ATTENDANCE,
    payload: {
      promise: firebase.database().ref(`/attendance/conference_${conferenceId}/checkin/${attendeeId}/check_in`).set(checkin)
    }
  });
}
