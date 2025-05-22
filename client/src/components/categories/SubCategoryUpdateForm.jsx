// src/components/categories/SubCategoryUpdateForm.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';

const SubCategoryUpdateForm = ({ open, onClose, onSuccess, categoryId, subCategories }) => {
  const [oldSub, setOldSub] = useState('');
  const [newSub, setNewSub] = useState('');

  const handleSubmit = async () => {
    try {
      await axiosClient.patch(`/updateSubCategory/${categoryId}`, {
        oldSubCategoryName: oldSub,
        newSubCategoryName: newSub,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating subcategory:', err.message);
    }
  };

  return (
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
          <TextField label="New Subcategory Name" fullWidth value={newSub} onChange={(e) => setNewSub(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!oldSub || !newSub}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryUpdateForm;
