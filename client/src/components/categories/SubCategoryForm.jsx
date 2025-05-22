import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';

const SubCategoryForm = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  categoryId = null,
  existingSubCategories = [],
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [oldSub, setOldSub] = useState('');
  const [newSub, setNewSub] = useState('');

  useEffect(() => {
    if (!open) return;

    if (mode === 'create') {
      fetchCategories();
    } else {
      // Lock selected category in edit mode
      setSelectedCategory({ _id: categoryId, categoryName: 'Selected Category' });
    }

    setOldSub('');
    setNewSub('');
  }, [open]);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        if (!selectedCategory || !newSub.trim()) return;
        await axiosClient.patch(`/createSubCategory/${selectedCategory._id}`, {
          subCategoriesName: newSub,
        });
      } else {
        if (!oldSub.trim() || !newSub.trim()) return;
        await axiosClient.patch(`/updateSubCategory/${categoryId}`, {
          oldSubCategoryName: oldSub,
          newSubCategoryName: newSub,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit subcategory:', err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Add Subcategory' : 'Edit Subcategory'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* CREATE MODE CATEGORY DROPDOWN */}
          {mode === 'create' ? (
            <Autocomplete
              options={categories}
              getOptionLabel={(opt) => opt.categoryName}
              value={selectedCategory}
              onChange={(_, val) => setSelectedCategory(val)}
              renderInput={(params) => <TextField {...params} label="Select Category" />}
            />
          ) : (
            <TextField
              disabled
              label="Category"
              fullWidth
              value={selectedCategory?.categoryName || ''}
            />
          )}

          {/* OLD SUBCATEGORY (ONLY IN EDIT) */}
          {mode === 'edit' && (
            <Autocomplete
              options={existingSubCategories}
              getOptionLabel={(opt) => opt}
              value={oldSub}
              onChange={(_, val) => setOldSub(val)}
              renderInput={(params) => <TextField {...params} label="Old Subcategory" />}
            />
          )}

          {/* NEW SUBCATEGORY */}
          <TextField
            label="New Subcategory"
            fullWidth
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!newSub.trim()}>
          {mode === 'create' ? 'Add' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryForm;
