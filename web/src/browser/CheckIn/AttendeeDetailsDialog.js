import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'


export const AttendeeDetailsDialog = ({
  attendee,
  toggleAttendeeDetailsDialog,
  isOpen,
  classes,
  activities,
  companies,
  rooms,
}) => {
  if (!activities.size || !companies.size || !rooms.size ) {
      return null;
  }

  return (
      <Dialog
          open={isOpen}
          aria-labelledby="form-dialog-title"
          maxWidth="md"
      >
          <DialogTitle id="form-dialog-title">{attendee.get('name')} {attendee.get('surname')}</DialogTitle>
          <DialogContent>
              <Table className={classes.table}>
                  <TableHead>
                      <TableRow>
                          <TableCell>Activity name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Company</TableCell>
                          <TableCell>Room</TableCell>
                          <TableCell>Time</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {attendee.has('assignments') ?
                          attendee.get('assignments').keySeq().map((key) => {
                              const activity = activities.get(key);
                              return (
                                  <TableRow key={key}>
                                      <TableCell>{activity.get('title')}</TableCell>
                                      <TableCell>{activity.get('type')}</TableCell>
                                      <TableCell>{companies.getIn([activities.getIn([key, 'company_id']), 'name'])}</TableCell>
                                      <TableCell>{rooms.getIn([activities.getIn([key, 'room_id']), 'name'])}</TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {activity.get('time_from').substring(0, 5)} - {activity.get('time_to').substring(0, 5)}
                                      </TableCell>
                                  </TableRow>
                              );
                          })
                          :
                              <TableRow>
                                  <TableCell colSpan={5} className="text-center">No activities was assigned</TableCell>
                              </TableRow>
                      }
                  </TableBody>
              </Table>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => toggleAttendeeDetailsDialog(null)} color="primary">
              close
              </Button>
          </DialogActions>
      </Dialog>
  )
}
