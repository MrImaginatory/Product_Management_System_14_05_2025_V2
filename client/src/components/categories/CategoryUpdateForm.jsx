// src/components/categories/CategoryUpdateForm.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import CKEditorComponent from '../common/RichTextEditor';
import ImagePreview from '../common/FileUpload';

const CategoryUpdateForm = ({ open, onClose, initialData, onSuccess }) => {
  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (open && initialData) {
      setCategoryName(initialData.categoryName);
      setSlug(initialData.slug);
      setDescription(initialData.categoryDescription);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('slug', slug);
    formData.append('categoryDescription', description);
    if (image) formData.append('categoryImage', image);

    try {
      await axiosClient.patch(`/updateCategory/${initialData._id}`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating category:', err.message);
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
          <TextField label="Category Name" fullWidth value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          <TextField label="Slug" fullWidth value={slug} onChange={(e) => setSlug(e.target.value)} />
          <CKEditorComponent label="Description" value={description} onChange={setDescription} />
          <ImagePreview file={image} onFileChange={setImage} label="Change Image (optional)" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryUpdateForm;
