import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, IconButton, DialogContentText, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import { useSnackbar } from '../../context/SnackbarContext';

const SubCategoryUpdateForm = ({ open, onClose, onSuccess, categoryId, subCategories }) => {
  const [oldSub, setOldSub] = useState('');
  const [newSub, setNewSub] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setOldSub('');
      setNewSub('');
      setConfirmDeleteOpen(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmedNewSub = newSub.trim();
    if (!oldSub || !trimmedNewSub || oldSub === trimmedNewSub) return;

    try {
      setLoading(true);
      await axiosClient.patch(`/category/updateSubCategory/${categoryId}`, {
        oldSubCategoryName: oldSub,
        newSubCategoryName: trimmedNewSub,
      });
      showSnackbar('Subcategory updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating subcategory:', err.message);
      showSnackbar(err?.response?.data?.message || 'Error updating data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axiosClient.delete(`/category/deleteSubCategory/${categoryId}`, {
        data: { oldSubCategoryName: oldSub },
      });
      showSnackbar('Subcategory deleted successfully!', 'success');
      onSuccess();
      setConfirmDeleteOpen(false);
      onClose();
    } catch (err) {
      console.error('Error deleting subcategory:', err.message);
      showSnackbar(err?.response?.data?.message || 'Error deleting data', 'error');
    } finally {
      setLoading(false);
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
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button color="error" onClick={() => setConfirmDeleteOpen(true)} disabled={!oldSub || loading}>
            Delete
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!oldSub || !newSub.trim() || loading}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the subcategory{' '}
            <Typography component="span" fontWeight="bold" color="error.main">
              {oldSub}
            </Typography>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubCategoryUpdateForm;
