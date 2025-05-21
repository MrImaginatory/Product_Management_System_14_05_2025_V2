import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosClient from '../../services/axiosClient';
import ImagePreview from '../common/FileUpload';
import CKEditorComponent from '../common/RichtextEditor';

const schema = yup.object().shape({
    categoryName: yup.string().min(3).max(50).required(),
    slug: yup.string().min(3).required(),
    categoryDescription: yup.string().min(10).max(999).required(),
});

const CategoryForm = ({ open, onClose, onSuccess, initialData = {}, isEdit = false }) => {
    const [imageFile, setImageFile] = useState(null);

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            categoryName: '',
            slug: '',
            categoryDescription: '',
        },
    });

    useEffect(() => {
        if (isEdit && initialData) {
            setValue('categoryName', initialData.categoryName || '');
            setValue('slug', initialData.slug || '');
            setValue('categoryDescription', initialData.categoryDescription || '');
            if (initialData.categoryImage) {
                setImageFile(null); // Don’t preload URL to avoid preview issues
            }
        }
    }, [initialData, isEdit, setValue]);

    const handleImageSelect = (file) => {
        setImageFile(file);
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append('categoryName', data.categoryName);
            formData.append('slug', data.slug);
            formData.append('categoryDescription', data.categoryDescription);
            if (imageFile) {
                formData.append('categoryImage', imageFile);
            }

            if (isEdit && initialData._id) {
                await axiosClient.patch(`/updateCategory/${initialData._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axiosClient.post('/createCategory', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            reset();
            setImageFile(null);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error submitting category:', err.message);
        }
    };


    const handleClose = () => {
        reset();
        setImageFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Add Category
                <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Controller
                        name="categoryName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="Category Name"
                                fullWidth
                                error={!!errors.categoryName}
                                helperText={errors.categoryName?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="slug"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="Slug"
                                fullWidth
                                error={!!errors.slug}
                                helperText={errors.slug?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="categoryDescription"
                        control={control}
                        render={({ field }) => (
                            <CKEditorComponent
                                label="Description"
                                value={field.value}
                                onChange={field.onChange}
                                error={!!errors.categoryDescription}
                            />
                        )}
                    />
                    <ImagePreview file={imageFile} onFileChange={handleImageSelect} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined">Cancel</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained">Add</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryForm;
