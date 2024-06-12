import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function FormDialog({open, setOpen, setName}) {

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
    open={open}
    onClose={handleClose}
    PaperProps={{
        component: 'form',
        onSubmit: (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const name = formJson.name;
        setName(name);
        handleClose();
        },
    }}
    >
    <DialogTitle>Enter User Name</DialogTitle>
    <DialogContent>
        <DialogContentText>
        Please enter user name
        </DialogContentText>
        <TextField
        autoFocus
        required
        margin="dense"
        id="name"
        name="name"
        label="Name"
        fullWidth
        variant="standard"
        />
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Accept</Button>
    </DialogActions>
    </Dialog>
  );
}