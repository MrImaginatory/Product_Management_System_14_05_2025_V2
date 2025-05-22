import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button
} from '@mui/material';

const ProductTable = ({ products, page }) => {

  if(!products || products.length === 0) return (
    <div className="no-products">
      <h2>No products found</h2>
    </div>
    );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>S.No</TableCell>
          <TableCell>Product Name</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Stock</TableCell>
          <TableCell>Sale Price</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product, index) => (
          <TableRow key={product._id}>
            <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
            <TableCell>{product.productName}</TableCell>
            <TableCell>{product.categoryName}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>₹{product.productSalePrice}</TableCell>
            <TableCell>₹{product.productPrice}</TableCell>
            <TableCell>
              <Button
                size="small"
                variant="outlined"
                href={`/product/${product._id}`}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
