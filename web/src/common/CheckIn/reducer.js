import { Record } from '../transit';
import { Map } from 'immutable';
import diacritics from 'diacritics'

import * as actions from './actions';
import * as registrationActions from '../Registration/actions';

const InitialState = Record(
  {
      attendees: new Map(),
      searchFilter: '',
      attendance: new Map(),
      attendanceIsSubscribed: false,
      activities: new Map(),
      companies: new Map(),
      rooms: new Map(),
      attendeeDetailsId: null,
  },
  'checkin'
);

export default function checkinReducer(state = new InitialState(), action) {
  switch (action.type) {
    case actions.FETCH_ATTENDEES_SUCCESS: {
        const data = action.payload;

        let attendees = { ...data[0], ...(data[1] || []) };
        attendees = Object.keys(attendees).map(key => attendees[key]);

        return state.set('attendees', new Map(attendees.map(attendee =>
          [attendee.id, new Map({
            ...attendee,
            searchString: `${attendee.name} ${attendee.surname} ${attendee.email} ${diacritics.remove(attendee.name).toLowerCase()} ${diacritics.remove(attendee.surname).toLowerCase()}`,
            assignments: attendee.assignments ?
              new Map(attendee.assignments.filter(assignment =>
                assignment.assigned && assignment.confirmed).map(assignment => {
                  let key = assignment.type;
                  if (assignment.type === 'WORKSHOP' || assignment.type === 'WORKSHOP_XL') {
                    key = `${key}_${assignment.workshop_id}`;
                  } else if (assignment.type === 'SPEED_DATING') {
                    key = `${key}_${assignment.speed_dating_id}`;
                  } else if (assignment.type === 'ROUND_TABLE') {
                    key = `${key}_${assignment.round_table_id}`;
                  } else {
                    throw new Error('Unsupported assignment type: ' + assignment.type);
                  }

                  return [key, true];
                }
              ))
              : new Map()
          })]
        )).sort((a, b) =>
          `${a.get('name')} ${a.get('surname')}`.localeCompare(`${b.get('name')} ${b.get('surname')}`)
        ));
    }

    case actions.FETCH_ATTENDANCE_SUCCESS: {
      const data = action.payload || {};

      let newState = state;
      Object.keys(data).forEach(key => {
        newState = newState.setIn(['attendance', key], data[key].check_in);
      })

      return newState;
    }

    case actions.CHANGE_ATTENDEE_SEARCH: {
      return state.set('searchFilter', action.payload);
    }

    case actions.ATTENDANCE_SUBSCRIBED_SUCCEED: {
      return state.set('attendanceIsSubscribed', true);
    }

    case actions.ATTENDANCE_UPDATE: {
      const { key, data, operation } = action.payload;

      if (operation === 'delete') {
        return state.deleteIn(['attendance', key]);
      }

      return state.setIn(['attendance', key], data.check_in);
    }

    case actions.FETCH_COMPANIES_SUCCESS: {
      const companies = action.payload;
      return state.set('companies', new Map(Object.keys(companies).map(key =>
        [companies[key].id, new Map(companies[key])]))
      );
    }

    case actions.FETCH_ACTIVITIES_SUCCESS: {
      const activities = action.payload;
      return state.set('activities', new Map(Object.keys(activities).map(key =>
        [key, new Map({
          ...activities[key],
          attendees: new Map(activities[key].attendees),
        })]))
      );
    }

    case actions.FETCH_ROOMS_SUCCESS: {
      const rooms = action.payload;

      return state.set('rooms', new Map(Object.keys(rooms).map(key =>
        [rooms[key].id, new Map(rooms[key])]))
      );
    }

    case registrationActions.NEW_ATTENDEE_REGISTERED: {
      const { key, data } = action.payload;

      return state.setIn(['attendees', key], new Map({
        id: key,
        searchString: `${data.name} ${data.surname} ${data.email} ${diacritics.remove(data.name).toLowerCase()} ${diacritics.remove(data.surname).toLowerCase()}`,
        ...data,
      }));
    }

    case actions.TOGGLE_ATTEDNEE_DETAILS: {
      return state.set('attendeeDetailsId', action.payload);
    }

    default:
      return state;
  }
}
