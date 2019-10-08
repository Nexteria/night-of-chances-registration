import toastr from 'toastr';
import { Record } from '../transit';
import { Map } from 'immutable';
import parse from 'date-fns/parse';

import * as actions from './actions';
import * as checkinActions from '../CheckIn/actions';

const InitialState = Record(
  {
      user: null,
      loadingCount: 0,
      activeConferenceId: null,
      conferences: new Map(),
      restartNeeded: null,
      isConferenceChangeDialogOpen: false,
  },
  'app'
);

export default function appReducer(state = new InitialState(), action) {
  switch (action.type) {

    case checkinActions.FETCH_ATTENDEES_START:
    case actions.USER_LOGIN_START:
    case actions.UPDATE_CONFERENCES_START:
    case actions.FETCH_CONFERENCES_START:
    case actions.SET_ACTIVE_CONFERENCE_START:
    case actions.UPDATE_CONFERENCE_DATA_START:
    case actions.FETCH_USER_DATA_START: {
      return state.update('loadingCount', count => count + 1);
    }

    case actions.USER_LOGIN_SUCCESS: {
      return state.set('user', new Map({ uid: action.payload.uid }))
                  .update('loadingCount', count => count - 1);
    }

    case actions.FETCH_USER_DATA_SUCCESS: {
      return state.setIn(['user', 'isAdmin'], action.payload.isAdmin)
                  .setIn(['user', 'isBuddy'], action.payload.isBuddy)
                  .update('loadingCount', count => count - 1);
    }

    case actions.FETCH_CONFERENCES_SUCCESS: {
      if (!action.payload) {
        return state.update('loadingCount', count => count - 1);
      }

      return state.set('conferences', new Map(Object.keys(action.payload).map(key =>
        [key, new Map({
          ...action.payload[key].info,
          date: parse(action.payload[key].info.date, 'YYYY-MM-DD'),
          lastTimeUpdate: action.payload[key].lastTimeUpdate ? parse(action.payload[key].lastTimeUpdate) : null,
          uploadTime: action.payload[key].uploadTime ? parse(action.payload[key].uploadTime) : null,
          activitiesCount: action.payload[key].activitiesCount,
          attendeesCount: action.payload[key].attendeesCount,
        })])
      )).update('loadingCount', count => count - 1);
    }

    case actions.TOGGLE_CONFERENCE_CHANGE_DIALOG: {
      return state.update('isConferenceChangeDialogOpen', isOpen => !isOpen);
    }

    case actions.SET_ACTIVE_CONFERENCE_SUCCESS: {
      return state.update('isConferenceChangeDialogOpen', isOpen => !isOpen)
                  .update('loadingCount', count => count - 1)
                  .set('activeConferenceId', action.payload);
    }

    case actions.FETCH_ACTIVE_CONFERENCE_ID_SUCCESS: {
      return state.set('activeConferenceId', action.payload);
    }

    case actions.UPLOAD_CONFERENCE_DATA_START: {
      const { conferenceId } = action.meta;
      return state.setIn(['conferences', `conference_${conferenceId}`, 'uploadTime'], 'UPLOADING')
        .update('loadingCount', count => count + 1);
    }

    case actions.UPLOAD_CONFERENCE_DATA_ERROR: {
      toastr.options.closeButton = true;
      toastr.options.timeOut = 5000;
      toastr.error('Uploading data to troll failed');
      return state.update('loadingCount', count => count - 1);
    }

    case actions.UPLOAD_CONFERENCE_DATA_SUCCESS: {
      const { conferenceId } = action.meta;
      toastr.options.closeButton = true;
      toastr.options.timeOut = 3000;
      toastr.success('Uploading data to troll was successfull');
      return state.update('loadingCount', count => count - 1).setIn(['conferences', `conference_${conferenceId}`, 'uploadTime'], new Date());
    }

    case actions.ACTIVE_CONFERENCE_CHANGE: {
      return state.set('restartNeeded', true)
    }

    case actions.CLOSE_RESTART_DIALOG: {
      return state.set('restartNeeded', false)
    }

    case actions.USER_LOGIN_ERROR:
    case actions.UPDATE_CONFERENCES_ERROR:
    case actions.UPDATE_CONFERENCES_SUCCESS:
    case actions.FETCH_CONFERENCES_ERROR:
    case actions.UPDATE_CONFERENCE_DATA_ERROR:
    case actions.UPDATE_CONFERENCE_DATA_SUCCESS:
    case actions.SET_ACTIVE_CONFERENCE_ERROR:
    case checkinActions.FETCH_ATTENDEES_SUCCESS:
    case checkinActions.FETCH_ATTENDEES_ERROR:
    case actions.FETCH_USER_DATA_ERROR: {
      return state.update('loadingCount', count => count - 1);
    }

    default:
      return state;
  }
}
