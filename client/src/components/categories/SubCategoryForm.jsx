import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Stack,
    IconButton,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';

const SubCategoryForm = ({ open,
    onClose,
    onSuccess,
    mode = 'create',
    categoryId = null,
    existingSubCategories = [], }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [oldSub, setOldSub] = useState('');
    const [newSub, setNewSub] = useState('');
    const [subCategoryName, setSubCategoryName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/categories');
            setCategories(res.data.categories);
        } catch (err) {
            console.error('Error loading categories:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) return;

        if (mode === 'create') {
            fetchCategories();
        } else {
            // In edit mode, we already know category
            const match = { _id: categoryId, categoryName: 'Selected Category' };
            setSelectedCategory(match);
        }
    }, [open]);


    const handleSubmit = async () => {
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
    };


    const handleClose = () => {
        setSelectedCategory(null);
        setSubCategoryName('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Add Subcategory
                <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {mode === 'create' ? (
                        <Autocomplete
                            options={categories}
                            getOptionLabel={(opt) => opt.categoryName}
                            value={selectedCategory}
                            onChange={(_, val) => setSelectedCategory(val)}
                            renderInput={(params) => <TextField {...params} label="Select Category" />}
                        />
                    ) : (
                        <TextField disabled fullWidth label="Selected Category" value="Selected Category" />
                    )}

                    {mode === 'edit' && (
                        <Autocomplete
                            options={existingSubCategories}
                            getOptionLabel={(opt) => opt}
                            value={oldSub}
                            onChange={(_, val) => setOldSub(val)}
                            renderInput={(params) => <TextField {...params} label="Old Subcategory" />}
                        />
                    )}

                    <TextField
                        label="New Subcategory Name"
                        value={newSub}
                        onChange={(e) => setNewSub(e.target.value)}
                        fullWidth
                    />
                </Stack>

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!selectedCategory || !subCategoryName.trim()}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubCategoryForm;
