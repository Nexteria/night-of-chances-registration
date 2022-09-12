import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { InputAdornment } from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';

import * as actions from '../../common/CheckIn/actions';
import * as registrationActions from '../../common/Registration/actions';
import AttendeeDetailsDialog from './AttendeeDetailsDialog';

const styles = theme => ({
  list: {
    margin: 'auto',
    marginTop: '2em',
  },
  listItem: {
    listStyle: 'none',
    backgroundColor: '#fff',
    height: '100%',
  },
  listItemInner: {
    height: '100%',
  }
});

const settings = {
  rowHeight: 50,
}

class CheckInPage extends Component {
  constructor(props) {
    super(props);

    this._rowRenderer = this._rowRenderer.bind(this);
  }

  componentDidMount() {
    const {
      activeConferenceId,
      fetchAttendeesIfNeeded,
      fetchAttendanceIfNeeded,
      subscribeAttendanceIfNeeded,
      subscribeRegistrations,
      fetchCompaniesIfNeeded,
      fetchActivitiesIfNeeded,
      fetchRoomsIfNeeded,
    } = this.props;

    if(activeConferenceId) {
      fetchAttendeesIfNeeded(activeConferenceId);
      fetchAttendanceIfNeeded(activeConferenceId);
      fetchCompaniesIfNeeded(activeConferenceId);
      fetchActivitiesIfNeeded(activeConferenceId);
      fetchRoomsIfNeeded(activeConferenceId);
      subscribeAttendanceIfNeeded(activeConferenceId);
      subscribeRegistrations(activeConferenceId);
    }
  }

  _noRowsRenderer() {
    return <div className={{ height: settings.rowHeight }}>No attendees</div>;
  }

  _rowRenderer({index, isScrolling, key, style}, attendees, classes) {
    const { attendance, activeConferenceId, setAttendeeAttendance, toggleAttendeeDetailsDialog } = this.props;
    const attendee = attendees.get(index);

    const isCheckedIn = attendance.has(`${attendee.get('id')}`) && attendance.get(`${attendee.get('id')}`);

    return (
      <div key={key} style={style}>
        <ListItem
          key={key}
          dense
          button
          className={classes.listItemInner}
          ContainerProps={{ className: classes.listItem }}
          onClick={() => toggleAttendeeDetailsDialog(attendee.get('id'))}
        >
          <ListItemText primary={`${attendee.get('name')} ${attendee.get('surname')} (${attendee.get('email')})`} />
          <ListItemSecondaryAction>
            <Checkbox
              onChange={() => setAttendeeAttendance(!isCheckedIn, attendee.get('id'), activeConferenceId)
                .then(() => {
                  if (!isCheckedIn) {
                    toggleAttendeeDetailsDialog(attendee.get('id'));
                  }
                })
              }
              checked={isCheckedIn}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    );
  }

  render() {
    const {
      classes,
      attendees,
      changeAttendeeSearch,
      searchFilter,
      companies,
      rooms,
      activities,
      toggleAttendeeDetailsDialog,
      attendeeDetailsId,
    } = this.props;

    const sortedAttendees = attendees.filter(attendee =>
        attendee.get('searchString').includes(searchFilter.toLowerCase())
      ).toList();

    return (
      <div>
        <TextField
          label="Search"
          onChange={(e) => changeAttendeeSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />

        <List
          ref="List"
          className={classes.list}
          height={450}
          overscanRowCount={15}
          noRowsRenderer={this._noRowsRenderer}
          rowCount={sortedAttendees.size}
          rowHeight={settings.rowHeight}
          rowRenderer={(data) => this._rowRenderer(data, sortedAttendees, classes)}
          width={500}
        />

        {attendees.has(attendeeDetailsId) ?
          <AttendeeDetailsDialog
            attendee={attendees.get(attendeeDetailsId)}
            isOpen={true}
            activities={activities}
            companies={companies}
            rooms={rooms}
            toggleAttendeeDetailsDialog={toggleAttendeeDetailsDialog}
          />
          : null
        }
      </div>
    );
  }
}

CheckInPage = withStyles(styles)(CheckInPage);

export default connect(state => ({
  attendees: state.checkin.attendees,
  activities: state.checkin.activities,
  companies: state.checkin.companies,
  activeConferenceId: state.app.activeConferenceId,
  searchFilter: state.checkin.searchFilter,
  attendance: state.checkin.attendance,
  rooms: state.checkin.rooms,
  attendeeDetailsId: state.checkin.attendeeDetailsId,
}), { ...actions, ...registrationActions})(CheckInPage);
