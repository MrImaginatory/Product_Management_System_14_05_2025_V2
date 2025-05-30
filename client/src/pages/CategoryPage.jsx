import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Select,
  MenuItem
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash/debounce';

import axiosClient from '../services/axiosClient';
import CategoryForm from '../components/categories/CategoryForm';
import SubCategoryForm from '../components/categories/SubCategoryForm';
import { useSnackbar } from '../context/SnackbarContext';
import CustomPagination from '../components/common/CustomPagination';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { exportToCSV } from '../utils/exportCSV';  // <-- import export utility

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);  // <-- make sure initialized
  const [openAdd, setOpenAdd] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [exporting, setExporting] = useState(false);

  const { showSnackbar } = useSnackbar();

  // Fetch categories with pagination and search
  const fetchCategories = useCallback(
    async (searchValue = searchTerm, pageValue = page, limitValue = limit) => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/category/categories', {
          params: { search: searchValue, page: pageValue, limit: limitValue },
        });
        setCategories(res.data.categories);
        setTotalPages(Math.ceil(res.data.matchingCount / res.data.limit));
      } catch (err) {
        console.error('Error fetching categories:', err.message);
        showSnackbar(err?.response?.data?.message || 'Fetching Data failed', 'error');
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, page, limit, showSnackbar]
  );

  const debouncedFetch = useMemo(
    () =>
      debounce((searchValue) => {
        setPage(1);
        fetchCategories(searchValue, 1, limit);
      }, 800),
    [fetchCategories, limit]
  );

  useEffect(() => {
    fetchCategories(searchTerm, page, limit);
  }, [page, fetchCategories, searchTerm, limit]);

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    fetchCategories('', 1, limit);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetch(value);
  };

  const handleCheckboxChange = (id) => {
    setSelectedCategoryIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const exportCSV = async () => {
    try {
      setExporting(true);
      let dataToExport = [];

      if (selectedCategoryIds.length > 0) {
        dataToExport = categories.filter((cat) => selectedCategoryIds.includes(cat._id));
      } else {
        const res = await axiosClient.get('/category/categoryCSV');
        dataToExport = res.data.categoryData || [];
      }

      if (dataToExport.length === 0) {
        showSnackbar('No data available to export', 'warning');
        return;
      }

      const csvData = dataToExport.map(
        ({ categoryName, categoryDescription, categoryImage, subCategoriesName, slug }, index) => ({
          Sno: index + 1,
          Name: categoryName,
          Description: categoryDescription ? categoryDescription.replace(/<\/?[^>]+(>|$)/g, '') : '',
          ImageURL: categoryImage || '',
          Subcategories: subCategoriesName ? subCategoriesName.join(', ') : '',
          Slug: slug || '',
        })
      );

      exportToCSV(csvData, 'categories_export.csv');
    } catch (error) {
      console.error('Export CSV failed:', error);
      showSnackbar('Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Container sx={{ mt: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Categories</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)} startIcon={<AddIcon />}>
              Category
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setOpenSub(true)} startIcon={<AddIcon />}>
              Subcategory
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={exportCSV}
              disabled={exporting}
              startIcon={<DownloadIcon />}
            >
              {selectedCategoryIds && selectedCategoryIds.length > 0 ? 'Save Selected' : 'Save'}
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} mb={3} alignItems="center">
          <Select
            // size="small"
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setLimit(newLimit);
              setPage(1);
              fetchCategories(searchTerm, 1, newLimit);
            }}
            sx={{ width: 140, height:40}}
          >
            {[5, 10, 15, 20, 50].map((option) => (
              <MenuItem key={option} value={option}>
                Show {option} data
              </MenuItem>
            ))}
          </Select>


          <TextField
            label="Search Categories or Subcategories"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                debouncedFetch.cancel();
                setPage(1);
                fetchCategories(searchTerm, 1, limit);
              }
            }}
            InputProps={{
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} aria-label="clear search">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              debouncedFetch.cancel();
              setPage(1);
              fetchCategories(searchTerm, 1, limit);
            }}
          >
            Search
          </Button>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Subcategories</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCategoryIds.includes(cat._id)}
                        onChange={() => handleCheckboxChange(cat._id)}
                      />
                    </TableCell>
                    <TableCell>
                      {cat.categoryImage && (
                        <Box
                          component="img"
                          src={cat.categoryImage}
                          alt={cat.categoryName}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">{cat.categoryName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(cat.categoryDescription?.slice(0, 100) || '') + '...',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {cat.subCategoriesName?.slice(0, 3).map((sub, i) => (
                          <Chip key={i} label={sub.replace(/_/g, ' ')} size="small" />
                        ))}
                        {cat.subCategoriesName?.length > 3 && (
                          <Chip label={`+${cat.subCategoriesName.length - 3}`} size="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" href={`category/${cat._id}`}>
                        View..
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box mt={4} display="flex" justifyContent="center">
          <CustomPagination page={page} totalPages={totalPages} onChange={(val) => setPage(val)} />
        </Box>
      </Container>

      <CategoryForm
        open={openAdd}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') setOpenAdd(false);
        }}
        onSuccess={() => fetchCategories(searchTerm, page, limit)}
      />
      <SubCategoryForm
        open={openSub}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') setOpenSub(false);
        }}
        onSuccess={() => fetchCategories(searchTerm, page, limit)}
      />
    </>
  );
};

export default CategoryPage;
