import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, Typography,
  IconButton, Checkbox, FormControlLabel, FormGroup, RadioGroup, Radio
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../services/axiosClient';
import ImagePreview from '../common/FileUpload';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CKEditorComponent from '../common/RichTextEditor';


const schema = yup.object().shape({
  productName: yup.string().required('Product Name is Required'),
  productPrice: yup.number().positive().required(),
  productSalePrice: yup.number().positive().required().test('is-less-than-price', 'Sale price must be less than product price',function (value) {
        const { productPrice } = this.parent;
        return value < productPrice;
      }),
  stock: yup.number().min(0).required(),
  weight: yup.number().positive().required(),
  availability: yup.string().required(),
  productType: yup.array().of(yup.string()).min(1),
  productDescription: yup.string().required(),
});

const ProductForm = ({ open, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  const [displayImage, setDisplayImage] = useState(null);
  const [productImages, setProductImages] = useState([]);

  const {
    control, handleSubmit, setValue, reset, watch, getValues, formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      productName: '',
      productPrice: '',
      productSalePrice: '',
      stock: '',
      weight: '',
      availability: '',
      productType: [],
      productDescription: '',
    }
  });

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error loading categories:', err.message);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (selectedCategory) {
      const match = categories.find(cat => cat._id === selectedCategory._id);
      setSubcategories(match?.subCategoriesName || []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('productName', data.productName);
      formData.append('categoryName', selectedCategory._id);
      selectedSubcategories.forEach((sub) => formData.append('subCategoryName', sub));
      formData.append('productDescription', data.productDescription);
      formData.append('productPrice', data.productPrice);
      formData.append('productSalePrice', data.productSalePrice);
      formData.append('stock', data.stock);
      formData.append('weight', data.weight);
      formData.append('availability', data.availability);
      data.productType.forEach((type) => formData.append('productType', type));
      if (displayImage) formData.append('productDisplayImage', displayImage);
      productImages.forEach(img => formData.append('productImages', img));

      await axiosClient.post('/createProduct', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      reset();
      setDisplayImage(null);
      setProductImages([]);
      setSelectedCategory(null);
      setSelectedSubcategories([]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating product:', err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
      <DialogTitle>
        Add Product
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Controller
            name="productName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Product Name" fullWidth error={!!errors.productName} />
            )}
          />

          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.categoryName}
            value={selectedCategory}
            onChange={(_, val) => setSelectedCategory(val)}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />

          <Autocomplete
            multiple
            options={subcategories}
            getOptionLabel={(opt) => opt}
            value={selectedSubcategories}
            onChange={(_, val) => setSelectedSubcategories(val)}
            renderInput={(params) => <TextField {...params} label="Subcategories" />}
          />

          <ImagePreview label="Product Display Image" file={displayImage} onFileChange={setDisplayImage} />

          <ImagePreview
  label="Product Images"
  fileList={productImages}
  onFileListChange={setProductImages}
  multiple
  max={50}
/>

          <Stack direction="row" spacing={2}>
            <Controller
              name="productPrice"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Price" type="number" fullWidth error={!!errors.productPrice} />
              )}
            />
            <Controller
              name="productSalePrice"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Sale Price" type="number" fullWidth error={!!errors.productSalePrice} />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Stock" type="number" fullWidth error={!!errors.stock} />
              )}
            />
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Weight" type="number" fullWidth error={!!errors.weight} />
              )}
            />
          </Stack>

          <Controller
            name="availability"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} row>
                <FormControlLabel value="Ready_To_Ship" control={<Radio />} label="Ready To Ship" />
                <FormControlLabel value="On_Booking" control={<Radio />} label="On Booking" />
              </RadioGroup>
            )}
          />

          <Controller
            name="productType"
            control={control}
            render={({ field }) => (
              <FormGroup row>
                {["Hot_product", "Best_Seller", "Today's_deal"].map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={field.value.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) field.onChange([...field.value, type]);
                          else field.onChange(field.value.filter((t) => t !== type));
                        }}
                      />
                    }
                    label={type.replace('_', ' ')}
                  />
                ))}
              </FormGroup>
            )}
          />

          <Controller
            name="productDescription"
            control={control}
            render={({ field }) => (
              <CKEditorComponent
                label="Description"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.productDescription}
              />
            )}
          />
        </Stack>
        
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">Add Product</Button>
      </DialogActions>
    </Dialog>

    
  );
};

export default ProductForm;
