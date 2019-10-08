import React, { Component } from 'react';
import { Route, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { Loader } from 'react-overlay-loader';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import SettingsIcon from 'material-ui-icons/Settings';
import PlaylistAddCheckIcon from 'material-ui-icons/PlaylistAddCheck';
import PlaylistAddIcon from 'material-ui-icons/PlaylistAdd';
import DashboardIcon from 'material-ui-icons/Dashboard';
import TrendingUpIcon from 'material-ui-icons/TrendingUp';
import { withStyles } from 'material-ui/styles';
import format from 'date-fns/format';


import LoginForm from './browser/Login/LoginForm';
import SettingsPage from './browser/Settings/SettingsPage';
import CheckInPage from './browser/CheckIn/CheckInPage';
import RegistrationPage from './browser/Registration/RegistrationPage';
import StatsPage from './browser/Stats/StatsPage';
import ActivitiesPage from './browser/Activities/ActivitiesPage';
import ActivityAttendance from './browser/Activities/ActivityAttendance';
import RestartDialog from './RestartDialog';
import './App.css';
import logo from './logo.png';

import * as activityActions from './common/Activities/actions';
import * as actions from './common/App/actions';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 2,
  },
  drawerPaper: {
    position: 'fixed',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  contentWithDrawer: {
    paddingLeft: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  container: {
    backgroundColor: '#ff57226e',
  },
  drawerContainer: {
    zIndex: theme.zIndex.drawer + 1
  }
});

class App extends Component {
  render() {
    const {
      user,
      loadingCount,
      classes,
      match,
      conferences,
      activeConferenceId,
      selectCompany,
      restartNeeded,
      selectActivity,
      closeRestartDialog,
    } = this.props;

    const section = match.params.section;

    const conference = conferences.get(`conference_${activeConferenceId}`);

    return (
      <div className={classes.root}>
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
              <img src={logo} className="title-bar-logo" alt="logo" />
              <Typography variant="title" color="inherit" noWrap>
                <span>Night of Chances</span>
                {conference ?
                  <span> - {conference.get('event_specialization').name} ({format(conference.get('date'), 'DD.MM.YYYY')})</span>
                  : null
                }
              </Typography>
            </Toolbar>
          </AppBar>

          {user && !user.get('isBuddy') ?
            <Drawer
              variant="permanent"
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <div className={classes.toolbar} />
              <List>
                <ListItem
                  className={ section === 'checkin' ? classes.container : '' }
                  button onClick={() => this.props.history.push('/checkin')}
                >
                  <ListItemIcon>
                    <PlaylistAddCheckIcon />
                  </ListItemIcon>
                  <ListItemText primary="Checkin" />
                </ListItem>
                <ListItem
                  className={ section === 'registration' ? classes.container : '' }
                  button onClick={() => this.props.history.push('/registration')}
                >
                  <ListItemIcon>
                    <PlaylistAddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Registration" />
                </ListItem>
                <ListItem
                  className={ section === 'stats' ? classes.container : '' }
                  button onClick={() => this.props.history.push('/stats')}
                >
                  <ListItemIcon>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText primary="Statistics" />
                </ListItem>
                {user.get('isAdmin') ?
                  <ListItem
                    className={ section === 'activities' ? classes.container : '' }
                    button onClick={() => {
                      this.props.history.push('/activities');
                      selectCompany(null);
                      selectActivity(null);
                    }}
                  >
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Activities" />
                  </ListItem>
                  : null
                }
              </List>
              {user.get('isAdmin') ?
                <div>
                  <Divider />
                  <List>
                    <ListItem
                      className={ section === 'settings' ? classes.container : '' }
                      button onClick={() => this.props.history.push('/settings')}
                    >
                      <ListItemIcon>
                        <SettingsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Settings" />
                    </ListItem>
                  </List>
                </div>
                : null
              }
            </Drawer>
            : null
          }

          <main className={`${classes.content} ${user && !user.get('isBuddy') ? classes.contentWithDrawer : ''}`}>
            <div className={classes.toolbar} />
              <div className="container text-center">
                <div className="content">
                  <RestartDialog isOpen={restartNeeded} closeAction={closeRestartDialog} />

                  {!user ?
                    <Redirect
                      from="*"
                      to="/login"
                    />
                    : null
                  }

                  <Route path="/login" component={LoginForm} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/checkin" component={CheckInPage} />
                  <Route path="/registration" component={RegistrationPage} />
                  <Route path="/stats" component={StatsPage} />
                  <Route path="/activities" component={ActivitiesPage} />
                  <Route path="/activities/:activityId" component={ActivityAttendance} />

                  <Loader
                    fullPage
                    className={classes.drawerContainer}
                    loading={loadingCount > 0}
                    containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.61)', zIndex: 2222 }}
                    textStyle={{ color: '#fff' }}
                  />
                </div>
              </div>
          </main>
      </div>
    );
  }
}

App = withStyles(styles)(App);

export default connect(state => ({
  user: state.app.user,
  loadingCount: state.app.loadingCount,
  activeConferenceId: state.app.activeConferenceId,
  restartNeeded: state.app.restartNeeded,
  conferences: state.app.conferences,
}), { ...activityActions, ...actions })(App);
