import format from 'date-fns/format';

export const SELECT_COMPANY = 'SELECT_COMPANY';
export const SELECT_ACTIVITY = 'SELECT_ACTIVITY';
export const CHANGE_SEARCH_FILTER = 'CHANGE_SEARCH_FILTER';
export const UPDATE_ACTIVITY_ATTENDANCE = 'UPDATE_ACTIVITY_ATTENDANCE';

export const FETCH_ACTIVITIES_ATTENDANCE = 'FETCH_ACTIVITIES_ATTENDANCE';
export const FETCH_ACTIVITIES_ATTENDANCE_START = 'FETCH_ACTIVITIES_ATTENDANCE_START';
export const FETCH_ACTIVITIES_ATTENDANCE_SUCCESS = 'FETCH_ACTIVITIES_ATTENDANCE_SUCCESS';
export const FETCH_ACTIVITIES_ATTENDANCE_ERROR = 'FETCH_ACTIVITIES_ATTENDANCE_ERROR';

export const SET_ACTIVITY_ATTENDEE_ATTENDANCE = 'SET_ACTIVITY_ATTENDEE_ATTENDANCE';
export const SET_ACTIVITY_ATTENDEE_ATTENDANCE_START = 'SET_ACTIVITY_ATTENDEE_ATTENDANCE_START';
export const SET_ACTIVITY_ATTENDEE_ATTENDANCE_SUCCESS = 'SET_ACTIVITY_ATTENDEE_ATTENDANCE_SUCCESS';
export const SET_ACTIVITY_ATTENDEE_ATTENDANCE_ERROR = 'SET_ACTIVITY_ATTENDEE_ATTENDANCE_ERROR';

export const ACTIVITIES_ATTENDANCE_SUBSCRIBED = 'ACTIVITIES_ATTENDANCE_SUBSCRIBED';
export const ACTIVITIES_ATTENDANCE_SUBSCRIBED_START = 'ACTIVITIES_ATTENDANCE_SUBSCRIBED_START';
export const ACTIVITIES_ATTENDANCE_SUBSCRIBED_SUCCESS = 'ACTIVITIES_ATTENDANCE_SUBSCRIBED_SUCCESS';
export const ACTIVITIES_ATTENDANCE_SUBSCRIBED_ERROR = 'ACTIVITIES_ATTENDANCE_SUBSCRIBED_ERROR';

export function selectCompany(id) {
    return {
        type: SELECT_COMPANY,
        payload: id,
    };
}

export function selectActivity(id) {
    return {
        type: SELECT_ACTIVITY,
        payload: id,
    };
}

export function changeSearchFilter(searchTerm) {
    return {
        type: CHANGE_SEARCH_FILTER,
        payload: searchTerm,
    }
}

export function fetchActivitiesAttendanceIfNeeded(conferenceId) {
    return ({ firebase, getState }) => {
      if (getState().activities.attendance.size && !getState().activities.attendanceIsSubscribed) {
        return { type: 'OPERATION_NOT_NEEDED' };
      }
  
      return {
        type: FETCH_ACTIVITIES_ATTENDANCE,
        payload: {
          promise: firebase.database().ref(`/attendance/conference_${conferenceId}/activities`).once('value')
            .then(snapshot => snapshot.val()),
        }
      }
    };
}

export function setActivityAttendance(isCheckedIn, attendeeId, conferenceId, activityId) {
    let checkin = null;

    if (isCheckedIn) {
      checkin = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    }
  
    return ({ firebase }) => ({
      type: SET_ACTIVITY_ATTENDEE_ATTENDANCE,
      payload: {
        promise: firebase.database().ref(`/attendance/conference_${conferenceId}/activities/${activityId}/${attendeeId}/check_in`).set(checkin)
      }
    });
}

export function subscribeActivitiesAttendanceIfNeeded(conferenceId) {
    return ({ firebase, getState, dispatch }) => {
      if (getState().activities.attendanceIsSubscribed) {
        return { type: 'OPERATION_NOT_NEEDED' };
      }

      const activities = getState().checkin.activities;
      const state = getState();
  
      return {
        type: ACTIVITIES_ATTENDANCE_SUBSCRIBED,
        payload: {
          promise: Promise.all(
            activities.keySeq().map(key =>
              firebase.database().ref(`/attendance/conference_${conferenceId}/activities/${key}`)
                .on('child_changed', snapshot => dispatch(updateActivityAttendance(snapshot.key, snapshot.val(), key, 'change')))
            ).concat(activities.keySeq().map(key =>
              firebase.database().ref(`/attendance/conference_${conferenceId}/activities/${key}`)
                .on('child_removed', snapshot => dispatch(updateActivityAttendance(snapshot.key, snapshot.val(), key, 'delete')))
            ).concat(activities.keySeq().map(key =>
              firebase.database().ref(`/attendance/conference_${conferenceId}/activities/${key}`)
                .on('child_added', snapshot => {
                  if (!state.activities.hasIn(['attendance', key, snapshot.key])) {
                    dispatch(updateActivityAttendance(snapshot.key, snapshot.val(), key, 'add'));
                  }
                })
              ))
            )
          )
        }
      }
    };
}

export function updateActivityAttendance(attendeeId, data, activityId, operation) {
  return {
    type: UPDATE_ACTIVITY_ATTENDANCE,
    payload: {
      attendeeId,
      data,
      activityId,
      operation
    }
  }
}
