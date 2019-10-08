import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Map } from 'immutable';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText } from 'material-ui/List';

import * as actions from '../../common/CheckIn/actions';
import * as registrationActions from '../../common/Registration/actions';
import * as activitiesActions from '../../common/Activities/actions';

const styles = theme => ({
  root: {
    width: '100%',
    margin: 'auto',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});

class ActivitiesPage extends Component {

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

  render() {
    const {
      classes,
      companies,
      activities,
      selectCompany,
      selectActivity,
      selectedCompanyId,
      selectedActivityId,
      history,
    } = this.props;

    const filteredActivities = activities.filter(activity =>
      activity.get('state') === 'submitted' && (
      activity.get('type') === 'WORKSHOP' ||
      activity.get('type') === 'WORKSHOP_XL' ||
      activity.get('type') === 'SPEED_DATING' )
    );
    let companiesIds = new Map();
    filteredActivities.forEach(activity => {
      const companyId = activity.get('company_id');
      if (companiesIds.has(companyId)) {
        companiesIds = companiesIds.update(companyId, activities => {
          activities.push(`${activity.get('type')}_${activity.get('id')}`);
          return activities;
        });
      } else {
        companiesIds = companiesIds.set(companyId, [`${activity.get('type')}_${activity.get('id')}`]);
      }
    });

    return (
      <div>
        {!selectedCompanyId ?
          <div className={classes.root}>
            <h2>Select company</h2>
            <List>
              {companiesIds.keySeq().map(id =>
                <ListItem key={id} divider button onClick={() => selectCompany(id)}>
                  <ListItemText
                    primary={companies.getIn([id, 'name'])}
                    secondary={`${companiesIds.get(id).length} activities`}
                  />
                </ListItem>
              )}
            </List>
          </div>
          : null
        }

        {!selectedActivityId && selectedCompanyId ?
          <div>
            <Button
              variant="raised"
              onClick={() => {
                this.props.selectCompany(null);
              }}
            >
            Back
            </Button>
            <div className={classes.root}>
              <h2>Select activities</h2>
              <List>
                {companiesIds.get(selectedCompanyId).map(id =>
                  <ListItem
                    key={id}
                    divider
                    button
                    onClick={() => {
                      selectActivity(id);
                      history.push(`/activities/${id}`);
                    }}
                  >
                    <ListItemText
                      primary={activities.getIn([id, 'title'])}
                      secondary={activities.getIn([id, 'type'])}
                    />
                  </ListItem>
                )}
              </List>
            </div>
          </div>
          : null
        }
      </div>
    );
  }
}

ActivitiesPage = withStyles(styles)(ActivitiesPage);
ActivitiesPage = withRouter(ActivitiesPage);


export default connect(state => ({
  activities: state.checkin.activities,
  companies: state.checkin.companies,
  activeConferenceId: state.app.activeConferenceId,
  attendance: state.checkin.attendance,
  selectedCompanyId: state.activities.selectedCompanyId,
  selectedActivityId: state.activities.selectedActivityId,
}), { ...actions, ...registrationActions, ...activitiesActions})(ActivitiesPage);
