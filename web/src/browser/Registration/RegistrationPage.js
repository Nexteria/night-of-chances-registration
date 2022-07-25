import React from 'react'
import Button from '@mui/material/Button'
import { Field, Form } from 'react-final-form'
import { useDispatch, useSelector } from 'react-redux'


import { Input } from '../Login/Input'
import * as registrationActions from '../../common/Registration/actions'


export const RegistrationPage = () => {
  const dispatch = useDispatch()
  const activeConferenceId = useSelector((state) => state.app.activeConferenceId)

  return (
    <div>
      {activeConferenceId ?
        <Form
          onSubmit={(data) => dispatch(registrationActions.registerAttendee(data, activeConferenceId))}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="col-md-12">
                <Field
                  name="firstName"
                  label="First Name"
                  type="text"
                  component={Input}
                />
              </div>
              <div className="col-md-12">
                <Field
                  name="lastName"
                  label="Last Name"
                  type="text"
                  component={Input}
                />
              </div>
              <div className="col-md-12">
                <Field
                  name="email"
                  label="Email"
                  type="email"
                  component={Input}
                />
              </div>
              <div className="col-md-12">
                <Field
                  name="phone"
                  label="Phone"
                  type="text"
                  component={Input}
                />
              </div>
              <div className="col-md-12">
                <Field
                  name="school"
                  label="School"
                  type="text"
                  component={Input}
                />
              </div>
              <div className="col-md-12">
                <Field
                  name="schoolYear"
                  label="Year in school"
                  type="text"
                  component={Input}
                />
              </div>
              <div className="col-md-12">
                <Button type="submit" variant="raised" color="primary" sx={{ marginTop: '2em' }}>
                  Add
                </Button>
              </div>
            </form>
          )}
        />
        :
        <div>There is no active conference</div>
      }
    </div>
  )
}
