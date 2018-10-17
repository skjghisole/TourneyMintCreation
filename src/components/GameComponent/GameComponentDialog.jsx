import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { Slide } from '@material-ui/core';

const Transition = (props) =>  {
    return <Slide direction="up" {...props} />;
}


const GameComponentDialog = ({ uiStore: { dialogState, closeDialog, dialogContent, dialogTitle } }) => (
    <Dialog
        open={dialogState}
        keepMounted
        TransitionComponent={Transition}
        onClose={closeDialog}
    >
        <DialogTitle>
            {dialogTitle}
        </DialogTitle>
        <DialogContent>
            {dialogContent}
        </DialogContent>
    </Dialog>
)

export default inject('uiStore')(observer(GameComponentDialog))
