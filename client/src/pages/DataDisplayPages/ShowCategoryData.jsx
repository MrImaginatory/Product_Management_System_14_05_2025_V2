import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { Button } from '@mui/material';


export default function CategoryTable() {
  const [rows, setRows] = useState([]);

  const columns = [
    {field: 'id',headerName:'Id',width:100},
    {field: 'categoryName',headerName:'CategoryName',width:250},
    {field: 'subCategoryName',headerName:'SubCategoryName',width:250, renderCell: (params) => params.value?.join(', ') || ''},
    {field: 'image',headerName:'Image',width:250,  renderCell: (params) => (
        <Avatar 
          alt="Category Image" 
          src={params.value} 
          variant="rounded"
          sx={{ width: 100, height: 100 }}
        />
      ),},
    {field: 'description',headerName:'Description',width:650},
    {field: 'actions',headerName:'Actions',width:250, renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleEdit(params.row.actions)}
        >
          View
        </Button>
      ),},
  ]

    const handleEdit = (row) => {
    console.log('Edit clicked for:', row);
    window.location.href = `/category/${row}`;
    // You can open a dialog or redirect here
  };

useEffect(() => {
  axios
    .get('http://localhost:3001/api/v2/categories')
    .then((response) => {
      const data = response.data.categories;
      const formattedData = data.map((item, index) => ({
        id: index + 1,
        categoryName:item.categoryName,
        subCategoryName:item.subCategoriesName,
        image: item.categoryImage,
        description:item.categoryDescription,
        actions: item._id,
      }));
      setRows(formattedData);
    })
    .catch((error) => {
      console.error('Error fetching categories:', error);
    });
}, []);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination:{
          page: 0,
          pageSizeOptions: [5, 10, 20],
          pageSize: 10,
          pageCount: 1,
            
        },
        sorting: {
          columnSorting: 'asc',
          sortModel: [{
            field: 'serialNo',
            sortDirection: 'asc',
          }],
        },
      }}
    >
      
    </DataGrid>
  );
}
