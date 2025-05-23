import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import { useSnackbar } from '../../context/SnackbarContext';

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

  // ✅ New states for multi-subcategory input
  const [newSubInput, setNewSubInput] = useState('');
  const [newSubs, setNewSubs] = useState([]);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (!open) return;

    if (mode === 'create') {
      fetchCategories();
    } else {
      setSelectedCategory({ _id: categoryId, categoryName: 'Selected Category' });
    }

    setOldSub('');
    setNewSubInput('');
    setNewSubs([]);
  }, [open]);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/subCategories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleAddSub = () => {
    const trimmed = newSubInput.trim();
    if (trimmed && !newSubs.includes(trimmed)) {
      setNewSubs([...newSubs, trimmed]);
      setNewSubInput('');
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        if (!selectedCategory || newSubs.length === 0) return;
        await axiosClient.patch(`/createSubCategory/${selectedCategory._id}`, {
          subCategoriesName: newSubs,
        });
        showSnackbar('Subcategories added successfully!', 'success');
      } else {
        if (!oldSub.trim() || !newSubInput.trim()) return;
        await axiosClient.patch(`/updateSubCategory/${categoryId}`, {
          oldSubCategoryName: oldSub,
          newSubCategoryName: newSubInput.trim(),
        });
        showSnackbar('Subcategory updated successfully!', 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit subcategory:', err.message);
      showSnackbar(err?.response?.data?.message || 'Operation failed', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Add Subcategories' : 'Edit Subcategory'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Category dropdown in create mode */}
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

          {/* Edit mode: choose subcategory to rename */}
          {mode === 'edit' && (
            <Autocomplete
              options={existingSubCategories}
              getOptionLabel={(opt) => opt}
              value={oldSub}
              onChange={(_, val) => setOldSub(val)}
              renderInput={(params) => <TextField {...params} label="Old Subcategory" />}
            />
          )}

          {/* Create mode: add multiple subcategories */}
          {mode === 'create' ? (
            <>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="New Subcategory"
                  fullWidth
                  value={newSubInput}
                  onChange={(e) => setNewSubInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSub();
                    }
                  }}
                />
                <Button onClick={handleAddSub} variant="contained" disabled={!newSubInput.trim()}>
                  Add
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {newSubs.map((sub, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    variant="outlined"
                    onClick={() => setNewSubs(newSubs.filter((s) => s !== sub))}
                  >
                    {sub} ×
                  </Button>
                ))}
              </Stack>
            </>
          ) : (
            <TextField
              label="New Subcategory Name"
              fullWidth
              value={newSubInput}
              onChange={(e) => setNewSubInput(e.target.value)}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={mode === 'create' ? newSubs.length === 0 : !newSubInput.trim()}
        >
          {mode === 'create' ? 'Add' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryForm;
  