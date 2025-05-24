import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, IconButton, DialogContentText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import { useSnackbar } from '../../context/SnackbarContext'

const SubCategoryUpdateForm = ({ open, onClose, onSuccess, categoryId, subCategories }) => {
  const [oldSub, setOldSub] = useState('');
  const [newSub, setNewSub] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    try {
      await axiosClient.patch(`/updateSubCategory/${categoryId}`, {
        oldSubCategoryName: oldSub,
        newSubCategoryName: newSub,
      });
      onSuccess();
      showSnackbar('Subcategory updated successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Error updating subcategory:', err.message);
      showSnackbar(err?.response?.data?.message || 'Error updating data', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/deleteSubCategory/${categoryId}`, {
        data: { oldSubCategoryName: oldSub },
      });
      showSnackbar('Subcategory deleted successfully!', 'success');
      onSuccess();
      setConfirmDeleteOpen(false);
      onClose();
    } catch (err) {
      console.error('Error deleting subcategory:', err.message);
      showSnackbar(err?.response?.data?.message || 'Error deleting data', 'error');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Subcategory
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Autocomplete
              options={subCategories}
              getOptionLabel={(opt) => opt}
              value={oldSub}
              onChange={(_, val) => setOldSub(val)}
              renderInput={(params) => <TextField {...params} label="Old Subcategory" />}
            />
            <TextField
              label="New Subcategory Name"
              fullWidth
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="error" onClick={() => setConfirmDeleteOpen(true)} disabled={!oldSub}>
            Delete
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!oldSub || !newSub}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the subcategory <strong>{oldSub}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubCategoryUpdateForm;
