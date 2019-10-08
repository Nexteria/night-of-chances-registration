import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { InputAdornment } from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import { withRouter } from 'react-router-dom';
import CheckIcon from 'material-ui-icons/CheckCircle';

import * as actions from '../../common/Activities/actions';
import * as checkinActions from '../../common/CheckIn/actions';
import * as registrationActions from '../../common/Registration/actions';
import Button from 'material-ui/Button';

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
  },
  checkIcon: {
    top: '2px',
    left: '10px',
    fill: '#64cc64',
    position: 'absolute',
    width: '15px',
  }
});

const settings = {
  rowHeight: 50,
}

class ActivityAttendance extends Component {
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
      fetchActivitiesAttendanceIfNeeded,
    } = this.props;

    if(activeConferenceId) {
      fetchAttendeesIfNeeded(activeConferenceId);
      fetchAttendanceIfNeeded(activeConferenceId);
      fetchCompaniesIfNeeded(activeConferenceId);
      fetchActivitiesIfNeeded(activeConferenceId);
      fetchRoomsIfNeeded(activeConferenceId);
      subscribeAttendanceIfNeeded(activeConferenceId);
      subscribeRegistrations(activeConferenceId);
      fetchActivitiesAttendanceIfNeeded(activeConferenceId);
    }
  }

  componentWillReceiveProps(nexProps) {
    const {
      activeConferenceId,
      activities,
      subscribeActivitiesAttendanceIfNeeded,
    } = nexProps;

    if (activities.size) {
      subscribeActivitiesAttendanceIfNeeded(activeConferenceId);
    }
  }

  _noRowsRenderer() {
    return <div className={{ height: settings.rowHeight }}>No attendees</div>;
  }

  _rowRenderer({index, isScrolling, key, style}, attendees, classes, activity) {
    const { attendance, activeConferenceId, setActivityAttendance } = this.props;
    const attendee = attendees.get(index);
    const activityId = `${activity.get('type')}_${activity.get('id')}`;

    const isCheckedIn = attendance.hasIn([activityId, `${attendee.get('id')}`]) &&
      attendance.getIn([activityId, `${attendee.get('id')}`, 'check_in']);

    return (
      <div key={key} style={style}>
        {activity.get('attendees').has(`${attendee.get('id')}`) ?
          <CheckIcon className={classes.checkIcon} />
          : null
        }
        <ListItem
          key={key}
          dense
          button
          className={classes.listItemInner}
          ContainerProps={{ className: classes.listItem }}
        >
          <ListItemText primary={`${attendee.get('name')} ${attendee.get('surname')} (${attendee.get('email')})`} />
          <ListItemSecondaryAction>
            <Checkbox
              onChange={() => setActivityAttendance(!isCheckedIn, attendee.get('id'), activeConferenceId, `${activity.get('type')}_${activity.get('id')}`)}
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
      changeSearchFilter,
      searchFilter,
      companies,
      activities,
      selectedActivityId,
      attendance,
    } = this.props;

    if (!activities.size || !attendees.size || !companies.size) {
      return null;
    }

    const sortedAttendees = attendees.filter(attendee =>
        attendee.get('searchString').includes(searchFilter)
    ).toList();

    let activityAttendance = new Map();
    if (attendance.size && attendance.get(selectedActivityId)) {
      activityAttendance = attendance.get(selectedActivityId).filter(attendee => {
          return attendee.get('check_in');
      });
    }

    const activity = activities.get(selectedActivityId);

    return (
      <div>
        <Button
          variant="raised"
          onClick={() => {
            this.props.selectActivity(null);
            this.props.history.push(`/activities`);
          }}
        >
        Back
        </Button>
        <h3>{activity.get('title')}</h3>
        <h4>{activityAttendance.size} / {activity.get('attendees').size}</h4>
        <TextField
          label="Search"
          onChange={(e) => changeSearchFilter(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />

        <div style={{ height: '100%' }}>
          <AutoSizer disableHeight>
            {({width}) => (
              <List
                ref="List"
                className={classes.list}
                height={450}
                overscanRowCount={15}
                noRowsRenderer={this._noRowsRenderer}
                rowCount={sortedAttendees.size}
                rowHeight={settings.rowHeight}
                rowRenderer={(data) => this._rowRenderer(data, sortedAttendees, classes, activity)}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

ActivityAttendance = withStyles(styles)(ActivityAttendance);
ActivityAttendance = withRouter(ActivityAttendance);

export default connect(state => ({
  attendees: state.checkin.attendees,
  activities: state.checkin.activities,
  companies: state.checkin.companies,
  activeConferenceId: state.app.activeConferenceId,
  searchFilter: state.activities.searchFilter,
  attendance: state.activities.attendance,
  selectedActivityId: state.activities.selectedActivityId,
}), { ...checkinActions, ...actions, ...registrationActions})(ActivityAttendance);
