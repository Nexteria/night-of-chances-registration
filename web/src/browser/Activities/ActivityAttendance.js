import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check'

import * as actions from '../../common/Activities/actions';
import * as checkinActions from '../../common/CheckIn/actions';
import * as registrationActions from '../../common/Registration/actions';
import Button from '@mui/material/Button';


const settings = {
  rowHeight: 50,
}

export const ActivityAttendance = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const activities = useSelector((state) => state.checkin.activities)
  const attendance = useSelector((state) => state.checkin.attendance)
  const companies = useSelector((state) => state.checkin.companies)
  const activeConferenceId = useSelector((state) => state.app.activeConferenceId)
  const selectedActivityId = useSelector((state) => state.activities.selectedActivityId)
  const attendees = useSelector((state) => state.checkin.attendees)
  const searchFilter = useSelector((state) => state.activities.searchFilter)

  useEffect(() => {
    if(activeConferenceId) {
      dispatch(checkinActions.fetchAttendeesIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchAttendanceIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchCompaniesIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchActivitiesIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchRoomsIfNeeded(activeConferenceId))
      dispatch(checkinActions.subscribeAttendanceIfNeeded(activeConferenceId))
      dispatch(registrationActions.subscribeRegistrations(activeConferenceId))
      dispatch(actions.fetchActivitiesAttendanceIfNeeded(activeConferenceId))
    }
  }, [])

  useEffect(() => {
    dispatch(actions.subscribeActivitiesAttendanceIfNeeded(activeConferenceId))
  }, [activities.size, activeConferenceId, dispatch])

  const _noRowsRenderer = useCallback(() => {
    return <div className={{ height: settings.rowHeight }}>No attendees</div>;
  }, [])

  const _rowRenderer = useCallback(({index, isScrolling, key, style}, attendees, activity) => {
    const attendee = attendees.get(index);
    const activityId = `${activity.get('type')}_${activity.get('id')}`;

    const isCheckedIn = attendance.hasIn([activityId, `${attendee.get('id')}`]) &&
      attendance.getIn([activityId, `${attendee.get('id')}`, 'check_in']);

    return (
      <div key={key} style={style}>
        {activity.get('attendees').has(`${attendee.get('id')}`) ?
          <CheckIcon sx={{
            top: '2px',
            left: '10px',
            fill: '#64cc64',
            position: 'absolute',
            width: '15px',
          }} />
          : null
        }
        <ListItem
          key={key}
          dense
          button
          sx={{
            height: '100%',
          }}
          conta
          ContainerProps={{ sx: {
            listStyle: 'none',
            backgroundColor: '#fff',
            height: '100%',
          } }}
        >
          <ListItemText primary={`${attendee.get('name')} ${attendee.get('surname')} (${attendee.get('email')})`} />
          <ListItemSecondaryAction>
            <Checkbox
              onChange={() => dispatch(actions.setActivityAttendance(!isCheckedIn, attendee.get('id'), activeConferenceId, `${activity.get('type')}_${activity.get('id')}`))}
              checked={isCheckedIn}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    );
  }, [attendance, activeConferenceId, dispatch])

  const sortedAttendees = useMemo(() => {
    if (!attendees) return []
    return attendees.filter(attendee =>
        attendee.get('searchString').includes(searchFilter)
    ).toList()
  }, [attendees, searchFilter])

  const activityAttendance = useMemo(() => {
    let records = new Map()
    if (attendance.size && attendance.get(selectedActivityId)) {
      records = attendance.get(selectedActivityId).filter(attendee => {
          return attendee.get('check_in');
      });
    }

    return records
  }, [attendance, selectedActivityId])

  if (!activities.size || !attendees.size || !companies.size) {
    return null;
  }

  const activity = activities.get(selectedActivityId);

  return (
    <div>
      <Button
        variant="raised"
        onClick={() => {
          dispatch(actions.selectActivity(null))
          navigate(`/activities`)
        }}
      >
      Back
      </Button>
      <h3>{activity.get('title')}</h3>
      <h4>{activityAttendance.size} / {activity.get('attendees').size}</h4>
      <TextField
        label="Search"
        onChange={(e) => dispatch(actions.changeSearchFilter(e.target.value))}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
      />

      <div style={{ height: '100%' }}>
        <AutoSizer disableHeight>
          {({width}) => (
            <List
              ref="List"
              sx={{
                margin: 'auto',
                marginTop: '2em',
              }}
              height={450}
              overscanRowCount={15}
              noRowsRenderer={_noRowsRenderer}
              rowCount={sortedAttendees.size}
              rowHeight={settings.rowHeight}
              rowRenderer={(data) => _rowRenderer(data, sortedAttendees, activity)}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
}
