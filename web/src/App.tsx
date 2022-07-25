import React from 'react'
import { Route, Navigate, PathMatch } from 'react-router'
import { connect } from 'react-redux'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import SettingsIcon from '@mui/icons-material/Settings'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import DashboardIcon from '@mui/icons-material/Dashboard'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { withStyles } from '@mui/material/styles'
import format from 'date-fns/format'
import { createStyles, Theme } from '@mui/material'


import { LoginForm } from './browser/Login/LoginForm'
import SettingsPage from './browser/Settings/SettingsPage'
import { CheckInPage } from './browser/CheckIn/CheckInPage'
import { RegistrationPage } from './browser/Registration/RegistrationPage'
import StatsPage from './browser/Stats/StatsPage'
import { ActivitiesPage } from './browser/Activities/ActivitiesPage'
import { ActivityAttendance } from './browser/Activities/ActivityAttendance'
import RestartDialog from './RestartDialog'
import './App.css'
import logo from './logo.png'

import * as activityActions from './common/Activities/actions'
import * as actions from './common/App/actions'
import { History } from 'history'

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
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
    padding: 10 * 3,
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

interface Props {
  user: Object
  classes: any
  loadingCount: number
  match: PathMatch
  conferences: Object
  activeConferenceId: string
  selectCompany: Function
  restartNeeded: boolean
  selectActivity: Function
  closeRestartDialog: Function
  history: History
}

const App: React.FC<Props> = ({
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
  history,
}) => {
  const section = match.params.section;

  const conference = conferences.get(`conference_${activeConferenceId}`);

  return (
    <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <img src={logo} className="title-bar-logo" alt="logo" />
            <Typography variant="h6" color="inherit" noWrap>
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
                button onClick={() => history.push('/checkin')}
              >
                <ListItemIcon>
                  <PlaylistAddCheckIcon />
                </ListItemIcon>
                <ListItemText primary="Checkin" />
              </ListItem>
              <ListItem
                className={ section === 'registration' ? classes.container : '' }
                button onClick={() => history.push('/registration')}
              >
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <ListItemText primary="Registration" />
              </ListItem>
              <ListItem
                className={ section === 'stats' ? classes.container : '' }
                button onClick={() => history.push('/stats')}
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
                    history.push('/activities');
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
                    button onClick={() => history.push('/settings')}
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
                  <Navigate
                    replace
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

                {/*<Loader
                  fullPage
                  className={classes.drawerContainer}
                  loading={loadingCount > 0}
                  containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.61)', zIndex: 2222 }}
                  textStyle={{ color: '#fff' }}
                /> */}
              </div>
            </div>
        </main>
    </div>
  );
}

App = withStyles(styles)(App);

export default connect(state => ({
  user: state.app.user,
  loadingCount: state.app.loadingCount,
  activeConferenceId: state.app.activeConferenceId,
  restartNeeded: state.app.restartNeeded,
  conferences: state.app.conferences,
}), { ...activityActions, ...actions })(App);
