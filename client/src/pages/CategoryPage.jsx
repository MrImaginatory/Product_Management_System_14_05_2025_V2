import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Stack,
    Pagination,
    CircularProgress,
} from '@mui/material';
import axiosClient from '../services/axiosClient';
import CategoryForm from '../components/categories/CategoryForm';
import SubCategoryForm from '../components/categories/SubCategoryForm';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [searchCategory, setSearchCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openAdd, setOpenAdd] = useState(false);
    const [openSub, setOpenSub] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/categories?page=${page}&searchCategory=${searchCategory}`);
            setCategories(res.data.categories);
            setTotalPages(Math.ceil(res.data.matchingCount / res.data.limit));
        } catch (err) {
            console.error('Error fetching categories:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [page])

    const handleSearch = () => {
        setPage(1);
        fetchCategories();
    };

    return (
        <>
            <Container sx={{ mt: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">Categories</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)}>
                            Add Category
                        </Button>

                        <Button variant="contained" color="secondary" onClick={() => setOpenSub(true)}>
                            Add Subcategory
                        </Button>

                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2} mb={2}>
                    <TextField
                        label="Search Category"
                        variant="outlined"
                        size="small"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)
                        }
                    />
                    <Button variant="outlined" onClick={handleSearch}>Search</Button>
                </Stack>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <Box>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Category Name</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Subcategories</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((cat, index) => (
                                    <TableRow key={cat._id}>
                                        <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                                        <TableCell>{cat.categoryName}</TableCell>
                                        <TableCell>{cat.slug}</TableCell>
                                        <TableCell>{cat.subCategoriesName?.map(sub => sub.replace(/_/g, ' ')).join(', ')}</TableCell>
                                        <TableCell>
                                            {cat.categoryDescription.length > 100 ? (
                                                <>
                                                    {cat.categoryDescription.slice(0, 100)}...
                                                    <Button
                                                        size="small"
                                                        variant="text"
                                                        onClick={() => window.location.href = `/category/${cat._id}`}
                                                    >
                                                        Read More
                                                    </Button>
                                                </>
                                            ) : (
                                                cat.categoryDescription
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {cat.categoryImage && (
                                                <img src={cat.categoryImage} alt="thumb" width={50} height={50} />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" variant="outlined" href={`/category/${cat._id}`}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box mt={3} display="flex" justifyContent="center">
                            <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} />
                        </Box>
                    </Box>
                )}
            </Container>
            <CategoryForm
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchCategories}
            />
            <SubCategoryForm
                open={openSub}
                onClose={() => setOpenSub(false)}
                onSuccess={fetchCategories}
            />

        </>
    );

};

export default CategoryPage;
