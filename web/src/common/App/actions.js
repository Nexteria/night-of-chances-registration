import { SubmissionError } from 'redux-form';
import toastr from 'toastr';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_START = 'USER_LOGIN_START';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';

export const FETCH_USER_DATA = 'FETCH_USER_DATA';
export const FETCH_USER_DATA_START = 'FETCH_USER_DATA_START';
export const FETCH_USER_DATA_SUCCESS = 'FETCH_USER_DATA_SUCCESS';
export const FETCH_USER_DATA_ERROR = 'FETCH_USER_DATA_ERROR';

export const UPDATE_CONFERENCES = 'UPDATE_CONFERENCES';
export const UPDATE_CONFERENCES_START = 'UPDATE_CONFERENCES_START';
export const UPDATE_CONFERENCES_ERROR = 'UPDATE_CONFERENCES_ERROR';
export const UPDATE_CONFERENCES_SUCCESS = 'UPDATE_CONFERENCES_SUCCESS';

export const FETCH_CONFERENCES = 'FETCH_CONFERENCES';
export const FETCH_CONFERENCES_START = 'FETCH_CONFERENCES_START';
export const FETCH_CONFERENCES_SUCCESS = 'FETCH_CONFERENCES_SUCCESS';
export const FETCH_CONFERENCES_ERROR = 'FETCH_CONFERENCES_ERROR';

export const UPDATE_CONFERENCE_DATA = 'UPDATE_CONFERENCE_DATA';
export const UPDATE_CONFERENCE_DATA_START = 'UPDATE_CONFERENCE_DATA_START';
export const UPDATE_CONFERENCE_DATA_SUCCESS = 'UPDATE_CONFERENCE_DATA_SUCCESS';
export const UPDATE_CONFERENCE_DATA_ERROR = 'UPDATE_CONFERENCE_DATA_ERROR';

export const SET_ACTIVE_CONFERENCE = 'SET_ACTIVE_CONFERENCE';
export const SET_ACTIVE_CONFERENCE_START = 'SET_ACTIVE_CONFERENCE_START';
export const SET_ACTIVE_CONFERENCE_SUCCESS = 'SET_ACTIVE_CONFERENCE_SUCCESS';
export const SET_ACTIVE_CONFERENCE_ERROR = 'SET_ACTIVE_CONFERENCE_ERROR';

export const FETCH_ACTIVE_CONFERENCE_ID = 'FETCH_ACTIVE_CONFERENCE_ID';
export const FETCH_ACTIVE_CONFERENCE_ID_START = 'FETCH_ACTIVE_CONFERENCE_ID_START';
export const FETCH_ACTIVE_CONFERENCE_ID_SUCCESS = 'FETCH_ACTIVE_CONFERENCE_ID_SUCCESS';
export const FETCH_ACTIVE_CONFERENCE_ID_ERROR = 'FETCH_ACTIVE_CONFERENCE_ID_ERROR';

export const UPLOAD_CONFERENCE_DATA = 'UPLOAD_CONFERENCE_DATA';
export const UPLOAD_CONFERENCE_DATA_START = 'UPLOAD_CONFERENCE_DATA_START';
export const UPLOAD_CONFERENCE_DATA_SUCCESS = 'UPLOAD_CONFERENCE_DATA_SUCCESS';
export const UPLOAD_CONFERENCE_DATA_ERROR = 'UPLOAD_CONFERENCE_DATA_ERROR';

export const ACTIVE_CONFERENCE_CHANGE = 'ACTIVE_CONFERENCE_CHANGE';

export const TOGGLE_CONFERENCE_CHANGE_DIALOG = 'TOGGLE_CONFERENCE_CHANGE_DIALOG';
export const CLOSE_RESTART_DIALOG = 'CLOSE_RESTART_DIALOG';

export function fetchUserData(uid, history) {
  return ({ firebase }) => ({
    type: FETCH_USER_DATA,
    payload: {
      promise: firebase.database().ref(`/users/${uid}`).once('value').then(snapshot => snapshot.val()).then(data => {
        if (data.isBuddy) {
          history.push('/activities');
        }
        return data;
      })
    },
  });
}

export function fetchConferences() {
  return ({ firebase }) => ({
    type: FETCH_CONFERENCES,
    payload: {
      promise: firebase.database().ref('/conferences').once('value').then(snapshot => snapshot.val())
    },
  });
}

export function monitorConferenceChange() {
  return ({ firebase, dispatch, getState }) => ({
    type: 'MONITORING_CONFERENCE_CHANGE',
    payload: {
      promise: firebase.database().ref('/activeConferenceId').on('value', snapshot => {
        if (snapshot) {
          if (getState().app.restartNeeded === null) {
            dispatch(closeRestartDialog());
          } else {
            dispatch({ type: ACTIVE_CONFERENCE_CHANGE });
          }
        }
      }),
    },
  });
}

export function closeRestartDialog() {
  return {
    type: CLOSE_RESTART_DIALOG,
  };
}

export function loginUser(email, password, history) {
  return ({ firebase, dispatch }) => ({
    type: USER_LOGIN,
    payload: {
      promise: firebase.auth().signInWithEmailAndPassword(email, password)
        .then(
            data => {
              dispatch(fetchConferences());
              dispatch(fetchActiveConferenceId()).then(confData => {
                dispatch(fetchUserData(data.uid, history));
                return confData;
              });
              toastr.options.timeOut = 5000;
              toastr.success('Login was successful');

              dispatch(monitorConferenceChange());
              return data;
            },
            () => {
              toastr.options.closeButton = true;
              toastr.options.timeOut = 5000;
              toastr.error('Invalid email or password');
              throw new SubmissionError({ email: true, password: true });
            })
    },
  });
}

export function updateConferences() {
  return ({ fetch, firebase, dispatch }) => ({
    type: UPDATE_CONFERENCES,
    payload: {
      promise: firebase.auth().currentUser.getIdToken(true).then(token => fetch(`/app/conferences/update`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        api: 'cloud'
      })).then(() => dispatch(fetchConferences()))
    },
  });
}

export function updateConferenceData(conferenceId) {
  return ({ fetch, firebase, dispatch }) => ({
    type: UPDATE_CONFERENCE_DATA,
    payload: {
      promise: firebase.auth().currentUser.getIdToken(true).then(token => fetch(`/app/conferences/${conferenceId}/update`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        api: 'cloud'
      })).then(() => dispatch(fetchConferences()))
    },
  });
}

export function uploadConferenceData(conferenceId) {
  return ({ fetch, firebase, dispatch }) => ({
    type: UPLOAD_CONFERENCE_DATA,
    meta: {
      conferenceId
    },
    payload: {
      promise: firebase.auth().currentUser.getIdToken(true).then(token => fetch(`/app/conferences/${conferenceId}/upload`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        api: 'cloud'
      }))
    },
  });
}

export function toggleConferenceChangeDialog() {
  return ({ fetch, firebase, dispatch }) => ({
    type: TOGGLE_CONFERENCE_CHANGE_DIALOG,
  });
}

export function fetchActiveConferenceId() {
  return ({ firebase }) => ({
    type: FETCH_ACTIVE_CONFERENCE_ID,
    payload: {
      promise: firebase.database().ref('/activeConferenceId').once('value').then(snapshot => snapshot.val())
    }
  });
}

export function setActiveConference(conferenceId) {
  return ({ fetch, firebase, dispatch }) => ({
    type: SET_ACTIVE_CONFERENCE,
    payload: {
      promise: firebase.database().ref('/activeConferenceId').set(conferenceId ? conferenceId : null).then(() => conferenceId)
    }
  });
}
