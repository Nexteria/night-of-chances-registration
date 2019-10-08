import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';


import logo from '../../logo.png';
import Input from './Input';
import * as actions from '../../common/App/actions';

const styles = theme => ({
  button: {
    marginTop: '2em',
  }
});

class LoginForm extends Component {
  render() {
    const { classes, handleSubmit, loginUser, user } = this.props;

    return (
      <form onSubmit={handleSubmit(data => loginUser(data.email, data.password, this.props.history))}>
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
          <Button type="submit" variant="raised" color="primary" className={classes.button}>
            Login
          </Button>
        </div>

        {user ?
          <Redirect
            from="*"
            to="/"
          />
          : null
        }
      </form>
    );
  }
}

LoginForm = reduxForm({
  form: 'login'
})(LoginForm);

LoginForm = withStyles(styles)(LoginForm);

export default connect(state => ({
  user: state.app.user,
}), actions)(LoginForm);
