import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { ScatterChart, Scatter, CartesianGrid, Tooltip, Legend,
    XAxis, YAxis } from 'recharts';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import Card, { CardContent } from 'material-ui/Card';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import * as actions from '../../common/CheckIn/actions';
import * as registrationActions from '../../common/Registration/actions';

const styles = theme => ({

});

class StatsPage extends Component {

  componentDidMount() {
    const {
      activeConferenceId,
      fetchAttendanceIfNeeded,
      fetchAttendeesIfNeeded,
      subscribeAttendanceIfNeeded,
      fetchCompaniesIfNeeded,
      fetchActivitiesIfNeeded,
      fetchRoomsIfNeeded,
    } = this.props;

    if(activeConferenceId) {
      fetchAttendanceIfNeeded(activeConferenceId);
      fetchAttendeesIfNeeded(activeConferenceId);
      subscribeAttendanceIfNeeded(activeConferenceId);
      fetchCompaniesIfNeeded(activeConferenceId);
      fetchActivitiesIfNeeded(activeConferenceId);
      fetchRoomsIfNeeded(activeConferenceId);
    }
  }

  render() {
    const {
      attendance,
      attendees,
      rooms,
      companies,
      activities,
    } = this.props;

    if (!attendance.size || !activities.size || !companies.size || !rooms.size) {
        return null;
    }

    let attendanceData = attendance.filter(record => record).valueSeq().map((record, index) => {
        return new Map({
            x: parse(record, 'YYYY-MM-DD HH:mm:ss').getTime(),
        });
    }).sort((a, b) => a.get('x') - b.get('x')).map((record, index) => record.set('y', index + 1));

    const filteredActivities = activities.filter(activity => {
        switch (activity.get('type')) {
            case 'WORKSHOP':
            case 'WORKSHOP_XL':
            case 'SPEED_DATING': {
                return true;
            }

            default: {
                return false;
            }
        }
    });

    return (
        <div>
            <Card>
                <CardContent>
                    <h3>{attendanceData.size} / {attendees.size}</h3>
                    <ScatterChart
                        style={{ margin: 'auto' }}
                        width={730}
                        height={300}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            domain = {['auto', 'auto']}
                            name = 'Time'
                            tickFormatter = {(unixTime) => format(parse(unixTime), 'HH:mm:ss')}
                            type = 'number'
                            dataKey="x"
                        />
                        <YAxis domain={[0,attendees.size + 100]} dataKey="y" name="# of attendees" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} labelString="" />
                        <Legend />
                        <Scatter name="Number of attendees" data={attendanceData.toJS()} fill="#8884d8" />
                    </ScatterChart>
                </CardContent>
            </Card>

            <Card style={{ marginTop: '2em' }}>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Activity name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Company</TableCell>
                                <TableCell>Room</TableCell>
                                <TableCell>Checked in</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredActivities.keySeq().map((key) => {
                                const activity = activities.get(key);
                                let checkedInCount = activity.get('attendees').filter((value, key) =>
                                    attendance.has(key) && attendance.get(key)
                                ).size;

                                return (
                                    <TableRow key={key}>
                                        <TableCell>{activity.get('title')}</TableCell>
                                        <TableCell>{activity.get('type')}</TableCell>
                                        <TableCell>{companies.getIn([activities.getIn([key, 'company_id']), 'name'])}</TableCell>
                                        <TableCell>{rooms.getIn([activities.getIn([key, 'room_id']), 'name'])}</TableCell>
                                        <TableCell>
                                            {checkedInCount} / {activity.get('attendees').size}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
    );
  }
}

StatsPage = withStyles(styles)(StatsPage);

export default connect(state => ({
  attendance: state.checkin.attendance,
  attendees: state.checkin.attendees,
  companies: state.checkin.companies,
  rooms: state.checkin.rooms,
  activities: state.checkin.activities,
  activeConferenceId: state.app.activeConferenceId,
}), { ...actions, ...registrationActions})(StatsPage);
