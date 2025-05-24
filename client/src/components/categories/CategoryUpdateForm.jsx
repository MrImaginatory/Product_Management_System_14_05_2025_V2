import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, IconButton, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import CKEditorComponent from '../common/RichTextEditor';
import ImagePreview from '../common/FileUpload';
import { useSnackbar } from '../../context/SnackbarContext';

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const CategoryUpdateForm = ({ open, onClose, initialData, onSuccess }) => {
  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSlugEditedManually, setIsSlugEditedManually] = useState(false);

  const [errors, setErrors] = useState({});
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && initialData) {
      setCategoryName(initialData.categoryName || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.categoryDescription || '');
      setImage(null);
      setErrors({});
      setIsSlugEditedManually(false);
    }
  }, [open, initialData]);

  // 🧠 Auto-generate slug only if user hasn't manually edited it
  useEffect(() => {
    if (!isSlugEditedManually) {
      const newSlug = generateSlug(categoryName);
      setSlug(newSlug);
    }
  }, [categoryName, isSlugEditedManually]);

  const validate = () => {
    const newErrors = {};
    if (!categoryName.trim()) newErrors.categoryName = 'Category name is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('slug', slug);
    formData.append('categoryDescription', description);
    if (image) formData.append('categoryImage', image);

    setLoading(true);
    try {
      await axiosClient.patch(`/updateCategory/${initialData._id}`, formData);
      onSuccess();
      showSnackbar('Category updated successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Error updating category:', err.message);
      showSnackbar(err?.response?.data?.message || 'Error updating data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Category
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Category Name"
            fullWidth
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
            }}
            error={!!errors.categoryName}
            helperText={errors.categoryName}
          />
          <TextField
            label="Slug"
            fullWidth
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugEditedManually(true); // Track manual edits
            }}
            error={!!errors.slug}
            helperText={errors.slug}
          />
          <CKEditorComponent
            label="Description"
            value={description}
            onChange={setDescription}
            error={!!errors.description}
          />
          <ImagePreview file={image} onFileChange={setImage} label="Change Image (optional)" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryUpdateForm;
