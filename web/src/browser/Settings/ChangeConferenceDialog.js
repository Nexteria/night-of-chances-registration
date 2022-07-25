import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import format from 'date-fns/format'
import { Field, Form } from 'react-final-form'

const renderSelector = (field, conferences) => {
    return (
        <FormControl style={{ margin: 'auto', marginTop: '2em' }}>
            <InputLabel htmlFor="active-conference">Active conference:</InputLabel>
            <Select
                native
                value={field.input.value}
                onChange={field.input.onChange}
                inputProps={{
                    id: 'active-conference',
                }}
            >
                <option value={null} />
                {conferences.valueSeq().map((conference, key) =>
                    <option key={key} value={conference.get('id')}>{conference.get('event_specialization').name} ({format(conference.get('date'), 'DD.MM.YYYY')})</option>
                )}
            </Select>
        </FormControl>
    );
};

export const FormDialog = ({
  conferences,
  toggleConferenceChangeDialog,
  isOpen,
  setActiveConference,
}) => {
  return (
    <Dialog
      open={isOpen}
      aria-labelledby="form-dialog-title"
      PaperProps={{ sx: {
        color: '#fff',
        backgroundColor: '#fb8c00',
    }}}
    >
      <DialogTitle id="form-dialog-title">Change active conference</DialogTitle>
      <Form
        onSubmit={(data) => setActiveConference(data.conferenceId)}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
              <DialogContent>
                  <DialogContentText>
                      This action should be done before conference.
                      If you change active conference,
                      all instances of the app in will be forced to reload.
                  </DialogContentText>
                  
                  <div style={{ width: '100%', textAlign: 'center' }}>
                      <Field
                          name="conferenceId"
                          component={(field) => renderSelector(field, conferences)}
                          normalize={value => parseInt(value, 10)}
                      />
                  </div>
              </DialogContent>
              <DialogActions>
                  <Button onClick={toggleConferenceChangeDialog} color="primary">
                  Cancel
                  </Button>
                  <Button type="submit" color="primary">
                      Set active conference
                  </Button>
              </DialogActions>
          </form>
        )}
      />
    </Dialog>
  )
}
