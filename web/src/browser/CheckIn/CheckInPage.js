import React, { useCallback, useEffect, useState } from 'react'
import { List } from 'react-virtualized'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

import * as checkinActions from '../../common/CheckIn/actions'
import * as registrationActions from '../../common/Registration/actions'
import { AttendeeDetailsDialog } from './AttendeeDetailsDialog'
import { useDispatch } from 'react-redux'

const settings = {
  rowHeight: 50,
}

export const CheckInPage = () => {
  const dispatch = useDispatch()

  const attendees = useState((state) => state.checkin.attendees)
  const activities = useState((state) => state.checkin.activities)
  const companies = useState((state) => state.checkin.companies)
  const activeConferenceId = useState((state) => state.app.activeConferenceId)
  const searchFilter = useState((state) => state.checkin.searchFilter)
  const attendance = useState((state) => state.checkin.attendance)
  const rooms = useState((state) => state.checkin.rooms)
  const attendeeDetailsId = useState((state) => state.checkin.attendeeDetailsId)

  useEffect(() => {
    if(activeConferenceId) {
      dispatch(checkinActions.fetchAttendeesIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchAttendanceIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchCompaniesIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchActivitiesIfNeeded(activeConferenceId))
      dispatch(checkinActions.fetchRoomsIfNeeded(activeConferenceId))
      dispatch(checkinActions.subscribeAttendanceIfNeeded(activeConferenceId))
      dispatch(registrationActions.subscribeRegistrations(activeConferenceId))
    }
  }, [])

  const _noRowsRenderer = useCallback(() => {
    return <div className={{ height: settings.rowHeight }}>No attendees</div>;
  }, [])

  const _rowRenderer = useCallback(({index, isScrolling, key, style}, attendees) => {
    const attendee = attendees.get(index);

    const isCheckedIn = attendance.has(`${attendee.get('id')}`) && attendance.get(`${attendee.get('id')}`);

    return (
      <div key={key} style={style}>
        <ListItem
          key={key}
          dense
          button
          sx={{
            height: '100%',
          }}
          ContainerProps={{ sx: {
            listStyle: 'none',
            backgroundColor: '#fff',
            height: '100%',
          } }}
          onClick={() => dispatch(checkinActions.toggleAttendeeDetailsDialog(attendee.get('id')))}
        >
          <ListItemText primary={`${attendee.get('name')} ${attendee.get('surname')} (${attendee.get('email')})`} />
          <ListItemSecondaryAction>
            <Checkbox
              onChange={() => dispatch(checkinActions.setAttendeeAttendance(!isCheckedIn, attendee.get('id'), activeConferenceId))
                .then(() => {
                  if (!isCheckedIn) {
                    dispatch(checkinActions.toggleAttendeeDetailsDialog(attendee.get('id')))
                  }
                })
              }
              checked={isCheckedIn}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    )
  }, [attendance, activeConferenceId, dispatch])

  const sortedAttendees = attendees.filter(attendee =>
      attendee.get('searchString').includes(searchFilter)
    ).toList();

  return (
    <div>
      <TextField
        label="Search"
        onChange={(e) => dispatch(checkinActions.changeAttendeeSearch(e.target.value))}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
      />

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
        rowRenderer={(data) => _rowRenderer(data, sortedAttendees)}
        width={500}
      />

      {attendees.has(attendeeDetailsId) ?
        <AttendeeDetailsDialog
          attendee={attendees.get(attendeeDetailsId)}
          isOpen={true}
          activities={activities}
          companies={companies}
          rooms={rooms}
          toggleAttendeeDetailsDialog={(attendeeId) => dispatch(checkinActions.toggleAttendeeDetailsDialog(attendeeId))}
        />
        : null
      }
    </div>
  )
}
