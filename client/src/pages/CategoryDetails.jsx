import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Stack,
    Button,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import CategoryUpdateForm from '../components/categories/CategoryUpdateForm';
import SubCategoryUpdateForm from '../components/categories/SubCategoryUpdateForm';
import { useSnackbar } from '../context/SnackbarContext'

const CategoryDetails = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [openEdit, setOpenEdit] = useState(false);
    const [openEditSub, setOpenEditSub] = useState(false);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSubEdit, setOpenSubEdit] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { showSnackbar } = useSnackbar();

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/category/${categoryId}`);
            setCategory(res.data.category);
        } catch (err) {
            console.error('Error loading category:', err.message);
            showSnackbar(err?.response?.data?.message || 'Error Fetching Data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleDelete = async () => {
        try {
            await axiosClient.delete(`/deleteCategory/${categoryId}`);
            showSnackbar('Category Deleted successfully!', 'success');
            navigate('/categories');
        } catch (err) {
            console.error('Error deleting category:', err.message);
            showSnackbar(err?.response?.data?.message || 'Error Deleting Category', 'error');
        }
    };

    if (!category) return <Typography>Loading...</Typography>;

    return (
        <Container sx={{ mt: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Category Details</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={() => setOpenEdit(true)}>Edit Category</Button>
                    <Button variant="outlined" onClick={() => setOpenEditSub(true)}>Edit Subcategory</Button>

                    <Button color="error" variant="contained" onClick={() => setConfirmDelete(true)}>Delete</Button>
                </Stack>
            </Stack>

            <Paper sx={{ display: 'flex', gap: 4, p: 3 }}>
                <Box flex={2}>
                    <Typography variant="subtitle1"><strong>Category Name:</strong> {category.categoryName}</Typography>
                    <Typography variant="subtitle1"><strong>Slug:</strong> {category.slug}</Typography>
                    <Typography variant="subtitle1"><strong>Description:</strong></Typography>
                    <Box dangerouslySetInnerHTML={{ __html: category.categoryDescription }} />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1"><strong>Subcategories:</strong></Typography>
                    <ol >
                        {category.subCategoriesName?.map((sub, idx) => (
                            <li key={idx}>{sub}</li>
                        ))}
                    </ol>
                </Box>
                <Box flex={1}>
                    {category.categoryImage && (
                        <img
                            src={category.categoryImage}
                            alt="Category"
                            style={{ width: '100%', maxHeight: 'auto', objectFit: 'cover', borderRadius: 8 }}
                        />
                    )}
                </Box>
            </Paper>

            <CategoryUpdateForm
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                initialData={category}
                onSuccess={fetchCategory}
            />

            <SubCategoryUpdateForm
                open={openEditSub}
                onClose={() => setOpenEditSub(false)}
                categoryId={category._id}
                subCategories={category.subCategoriesName}
                onSuccess={fetchCategory}
            />

            {/* Delete Confirmation */}
            <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{category.categoryName}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CategoryDetails;
