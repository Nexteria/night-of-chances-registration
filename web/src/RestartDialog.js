import React, { Component } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button';
import { withStyles } from '@mui/material/styles';

const styles = theme => ({
    paper: {
        color: '#fff',
        backgroundColor: '#fb8c00',
    },
});

export class RestartDialog extends Component {
    render() {
        const {
            isOpen,
            closeAction,
            classes
        } = this.props;

        return (
            <Dialog
                open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={classes}
            >
                <DialogTitle id="form-dialog-title">Active conferece was changed</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The active conference was changed and refresh of applications is needed.
                        Please refresh this page.
                        If you will continue of using this app, all data will be write to conference,
                        which is not active at this time.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" color="primary" onClick={() => closeAction()}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(RestartDialog);