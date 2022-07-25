import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from 'immutable';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

import * as actions from '../../common/CheckIn/actions';
import * as registrationActions from '../../common/Registration/actions';
import * as activitiesActions from '../../common/Activities/actions';
import { Box } from '@mui/material';

export const ActivitiesPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const activities = useSelector((state) => state.checkin.activities)
  const companies = useSelector((state) => state.checkin.companies)
  const activeConferenceId = useSelector((state) => state.app.activeConferenceId)
  const selectedCompanyId = useSelector((state) => state.activities.selectedCompanyId)
  const selectedActivityId = useSelector((state) => state.activities.selectedActivityId)

  useEffect(() => {
    if(activeConferenceId) {
      dispatch(actions.fetchAttendeesIfNeeded(activeConferenceId))
      dispatch(actions.fetchAttendanceIfNeeded(activeConferenceId))
      dispatch(actions.fetchCompaniesIfNeeded(activeConferenceId))
      dispatch(actions.fetchActivitiesIfNeeded(activeConferenceId))
      dispatch(actions.fetchRoomsIfNeeded(activeConferenceId))
      dispatch(actions.subscribeAttendanceIfNeeded(activeConferenceId))
      dispatch(registrationActions.subscribeRegistrations(activeConferenceId))
    }
  }, [])

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
          <Box sx={{
            width: '100%',
            margin: 'auto',
            maxWidth: 360,
            backgroundColor: 'background.paper',
          }}>
            <h2>Select company</h2>
            <List>
              {companiesIds.keySeq().map(id =>
                <ListItem key={id} divider button onClick={() => dispatch(activitiesActions.selectCompany(id))}>
                  <ListItemText
                    primary={companies.getIn([id, 'name'])}
                    secondary={`${companiesIds.get(id).length} activities`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
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
            <Box sx={{
              width: '100%',
              margin: 'auto',
              maxWidth: 360,
              backgroundColor: 'background.paper',
            }}>
              <h2>Select activities</h2>
              <List>
                {companiesIds.get(selectedCompanyId).map(id =>
                  <ListItem
                    key={id}
                    divider
                    button
                    onClick={() => {
                      dispatch(activitiesActions.selectActivity(id))
                      navigate(`/activities/${id}`);
                    }}
                  >
                    <ListItemText
                      primary={activities.getIn([id, 'title'])}
                      secondary={activities.getIn([id, 'type'])}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </div>
          : null
        }
      </div>
    );
}
