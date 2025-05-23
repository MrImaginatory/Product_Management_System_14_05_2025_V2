// src/components/products/ProductUpdateForm.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack,
  FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, IconButton, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import CKEditorComponent from '../common/RichTextEditor';
import ImagePreview from '../common/FileUpload';
import { useParams } from 'react-router-dom';
import SubCategoryForm from '../categories/SubCategoryForm';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from '../../context/SnackbarContext'

const ProductUpdateForm = ({ open, onClose, onSuccess, initialData }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [displayImage, setDisplayImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [existingDisplayImage, setExistingDisplayImage] = useState(null);
  const [existingProductImages, setExistingProductImages] = useState([]);
  const [openSubForm, setOpenSubForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    productName: '',
    productPrice: '',
    productSalePrice: '',
    stock: '',
    weight: '',
    availability: '',
    productType: [],
    productDescription: '',
  });

  const productId = initialData._id || useParams();

  useEffect(() => {
    if (open && initialData) {
      setForm({
        productName: initialData.productName || '',
        productPrice: initialData.productPrice || '',
        productSalePrice: initialData.productSalePrice || '',
        stock: initialData.stock || '',
        weight: initialData.weight || '',
        availability: initialData.availability || '',
        productType: initialData.productType || [],
        productDescription: initialData.productDescription || '',
      });

      setSelectedCategory({
        _id: initialData.categoryId || '',
        categoryName: initialData.categoryName.categoryName,
      });

      setSelectedSubcategories(initialData.subCategoryName || []);

      setExistingDisplayImage(initialData.productDisplayImage || null);
      setExistingProductImages(initialData.productImages || []);
    }
  }, [open, initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.categories);
    };
    if (open) fetchCategories();
  }, [open]);

  useEffect(() => {
    if (selectedCategory) {
      const matched = categories.find((c) => c._id === selectedCategory._id);
      setSubcategories(matched?.subCategoriesName || []);
    }
  }, [selectedCategory, categories]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', form.productName);
      formData.append('productPrice', form.productPrice);
      formData.append('productSalePrice', form.productSalePrice);
      formData.append('stock', form.stock);
      formData.append('weight', form.weight);
      formData.append('availability', form.availability);
      form.productType.forEach((type) => formData.append('productType', type));
      formData.append('productDescription', form.productDescription);
      formData.append('categoryName', selectedCategory._id);
      selectedSubcategories.forEach((sub) => formData.append('subCategoryName', sub));

      if (displayImage) formData.append('productDisplayImage', displayImage);
      productImages.forEach((img) => formData.append('productImages', img));

      await axiosClient.patch(`/updateProduct/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
        showSnackbar('Product updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Update failed', 'error');
      console.error('Error updating product:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
      <DialogTitle>
        Update Product
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Product Name"
            fullWidth
            value={form.productName}
            onChange={(e) => handleChange('productName', e.target.value)}
          />

          <Autocomplete
            options={categories}
            getOptionLabel={(opt) => opt.categoryName}
            value={selectedCategory}
            onChange={(_, val) => setSelectedCategory(val)}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Autocomplete
              multiple
              options={subcategories}
              getOptionLabel={(opt) => opt}
              value={selectedSubcategories}
              onChange={(_, val) => setSelectedSubcategories(val)}
              renderInput={(params) => <TextField {...params} label="Subcategories" />}
              fullWidth
            />
            {selectedCategory && (
              <IconButton onClick={() => setOpenSubForm(true)} color="primary">
                <AddIcon />
              </IconButton>
            )}
          </Stack>

          {/* Show existing display image */}
          {existingDisplayImage && (
            <div>
              <label>Existing Display Image:</label> <br/>
              <img
                src={existingDisplayImage}
                alt="Display"
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
              />
            </div>
          )}

          <ImagePreview
            label="Upload New Display Image (optional)"
            file={displayImage}
            onFileChange={setDisplayImage}
          />

          {/* Show existing product images */}
          {existingProductImages.length > 0 && (
            <div>
              <label>Existing Additional Images:</label><br/>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {existingProductImages.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`Additional ${idx}`}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                  />
                ))}
              </Stack>
            </div>
          )}

          <ImagePreview
            label="Upload New Additional Images"
            fileList={productImages}
            onFileListChange={setProductImages}
            multiple
            max={50}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={form.productPrice}
              onChange={(e) => handleChange('productPrice', e.target.value)}
            />
            <TextField
              label="Sale Price"
              type="number"
              fullWidth
              value={form.productSalePrice}
              onChange={(e) => handleChange('productSalePrice', e.target.value)}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Stock"
              type="number"
              fullWidth
              value={form.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
            />
            <TextField
              label="Weight (kg)"
              type="number"
              fullWidth
              value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
            />
          </Stack>

          <RadioGroup
            row
            value={form.availability}
            onChange={(e) => handleChange('availability', e.target.value)}
          >
            <FormControlLabel value="Ready_To_Ship" control={<Radio />} label="Ready To Ship" />
            <FormControlLabel value="On_Booking" control={<Radio />} label="On Booking" />
          </RadioGroup>

          <FormGroup row>
            {['Hot_product', 'Best_Seller', "Today's_deal"].map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={form.productType.includes(type)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...form.productType, type]
                        : form.productType.filter((t) => t !== type);
                      handleChange('productType', updated);
                    }}
                  />
                }
                label={type.replace('_', ' ')}
              />
            ))}
          </FormGroup>

          <CKEditorComponent
            label="Description"
            value={form.productDescription}
            onChange={(val) => handleChange('productDescription', val)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Submitting...' : 'Update Product'}
        </Button>
      </DialogActions>

      <SubCategoryForm
        open={openSubForm}
        onClose={() => setOpenSubForm(false)}
        onSuccess={async () => {
          setOpenSubForm(false);
          try {
            const res = await axiosClient.get('/categories');
            setCategories(res.data.categories);

            const updatedCategory = res.data.categories.find(cat => cat._id === selectedCategory._id);
            setSubcategories(updatedCategory?.subCategoriesName || []);
            setSelectedCategory(updatedCategory);
          } catch (err) {
            console.error('Error refreshing categories:', err.message);
          }
        }}
        mode="create"
        categoryId={selectedCategory?._id}
      />
    </Dialog>
  );
};

export default ProductUpdateForm;
