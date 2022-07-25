import React from 'react'
import Button from '@mui/material/Button'
import { Form, Field } from 'react-final-form'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router'


import logo from '../../logo.png';
import { Input } from './Input';
import * as appActions from '../../common/App/actions';


export const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state) => state.app.user)

  return (
    <Form
      onSubmit={(data) => dispatch(appActions.loginUser(data.email, data.password, navigate))}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="col-md-12">
            <img src={logo} className="App-logo" alt="logo" />
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
              name="password"
              label="Password"
              type="password"
              component={Input}
            />
          </div>
          <div className="col-md-12">
            <Button type="submit" variant="raised" color="primary" sx={{ marginTop: '2em' }}>
              Login
            </Button>
          </div>

          {user ?
            <Navigate to="/" />
            : null
          }
        </form>
      )}
    />
  )
}
