import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { Avatar } from '@mui/material';

const columns = [
  {
    field: 'serialNo',
    headerName: 'S.No',
    width: 70,
    valueGetter: (params) => params.api.getRowIndex(params.id) + 1,
    sortable: false,
  },
  {
    field: 'categoryName',
    headerName: 'Category Name',
    width: 180,
  },
  {
    field: 'categoryDescription',
    headerName: 'Description',
    width: 250,
  },
  {
    field: 'categoryImage',
    headerName: 'Image',
    width: 120,
    renderCell: (params) => (
      <Avatar alt="Category" src={params.value} variant="rounded" />
    ),
    sortable: false,
    filterable: false,
  },
  {
    field: 'subCategoriesName',
    headerName: 'Sub-Categories',
    width: 250,
    renderCell: (params) => params.value.join(', '),
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    width: 180,
    valueGetter: (params) =>
      new Date(params.row.createdAt).toLocaleDateString(),
  },
];

export default function CategoryTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/categories') // Replace with your actual API
      .then((response) => {
        const formatted = response.data.map((item, index) => ({
          id: item._id, // required for DataGrid
          categoryName: item.categoryName,
          categoryDescription: item.categoryDescription,
          categoryImage: item.categoryImage,
          subCategoriesName: item.subCategoriesName,
          createdAt: item.createdAt,
        }));
        setRows(formatted);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  return (
    <Paper sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
        pageSizeOptions={[5, 10, 20]}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
