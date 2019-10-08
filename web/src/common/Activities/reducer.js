import { Record } from '../transit';
import { Map } from 'immutable';

import * as actions from './actions';

const InitialState = Record(
  {
      selectedCompanyId: null,
      selectedActivityId: null,
      searchFilter: '',
      attendanceIsSubscribed: false,
      attendance: new Map(),
  },
  'activities'
);

export default function activitiesReducer(state = new InitialState(), action) {
  switch (action.type) {

    case actions.CHANGE_SEARCH_FILTER: {
        return state.set('searchFilter', action.payload);
    }

    case actions.SELECT_COMPANY: {
        return state.set('selectedCompanyId', action.payload);
    }

    case actions.SELECT_ACTIVITY: {
        return state.set('selectedActivityId', action.payload);
    }

    case actions.FETCH_ACTIVITIES_ATTENDANCE_SUCCESS: {
        const activities = action.payload;
        let newState = state;

        if (!activities) {
            return state;
        }

        Object.keys(activities).forEach(key => {
            newState = newState.setIn(
                ['attendance', key], new Map(
                    Object.keys(activities[key]).map(attendeeKey =>
                        [attendeeKey, new Map(activities[key][attendeeKey])]
                    )
                )
            )
        });

        return newState;
    }

    case actions.ACTIVITIES_ATTENDANCE_SUBSCRIBED_START: {
        return state.set('attendanceIsSubscribed', true);
    }

    case actions.ACTIVITIES_ATTENDANCE_SUBSCRIBED_ERROR: {
        return state.set('attendanceIsSubscribed', false);
    }

    case actions.UPDATE_ACTIVITY_ATTENDANCE: {
        const { attendeeId, data, activityId, operation } = action.payload;

        if (operation === 'delete') {
            return state.deleteIn(['attendance', activityId, attendeeId]);
        }
    
        return state.setIn(['attendance', activityId, attendeeId], new Map({
            check_in: data.check_in
        }));
    }

    default:
      return state;
  }
}
