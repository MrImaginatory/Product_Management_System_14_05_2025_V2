import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Stack, IconButton,
  Checkbox, FormControlLabel, FormGroup, RadioGroup, Radio,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import axiosClient from '../../services/axiosClient';
import ImagePreview from '../common/FileUpload';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CKEditorComponent from '../common/RichTextEditor';
import SubCategoryForm from '../categories/SubCategoryForm';
import { useSnackbar } from '../../context/SnackbarContext';

const schema = yup.object().shape({
  productName: yup.string().required('Product Name is required'),
  categoryName: yup.string().required('Category Name is required'),
  subCategoriesName: yup.array().min(1, 'At least one Subcategory is required'),
  productPrice: yup.number().positive().required('Product Price is required'),
  productSalePrice: yup.number()
    .positive()
    .required('Sale Price is required')
    .test(
      'is-less-than-price',
      'Sale price must be less than product price',
      function (value) {
        const { productPrice } = this.parent;
        return value < productPrice;
      }
    ),
  stock: yup.number().min(0).required('Stock is required'),
  weight: yup.number().positive().required('Weight is required'),
  availability: yup.string().required('Availability is required'),
  productType: yup.array().of(yup.string()).min(1, 'Select at least one product type'),
  productDescription: yup.string().required('Product Description is required'),
});

const ProductForm = ({ open, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [displayImage, setDisplayImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [openSubForm, setOpenSubForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showSnackbar } = useSnackbar();

  const {
    control, handleSubmit, setValue, reset, formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      productName: '',
      categoryName: '',
      subCategoriesName: [],
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
      const res = await axiosClient.get('/subCategories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error loading categories:', err.message);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      reset();  // Clear form on open
      setSelectedCategory(null);
      setSelectedSubcategories([]);
      setDisplayImage(null);
      setProductImages([]);
    }
  }, [open, reset]);

  useEffect(() => {
    if (selectedCategory) {
      const matchedCategory = categories.find(cat => cat._id === selectedCategory._id);
      setSubcategories(matchedCategory?.subCategoriesName || []);
    } else {
      setSubcategories([]);
      setSelectedSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // Sync categoryName field in react-hook-form with selectedCategory state
  useEffect(() => {
    setValue('categoryName', selectedCategory ? selectedCategory._id : '');
  }, [selectedCategory, setValue]);

  // Sync subCategoriesName field in react-hook-form with selectedSubcategories state
  useEffect(() => {
    setValue('subCategoriesName', selectedSubcategories);
  }, [selectedSubcategories, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', data.productName);
      formData.append('categoryName', data.categoryName);
      data.subCategoriesName.forEach((sub) => formData.append('subCategoryName', sub));
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
      showSnackbar('Product created successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Error creating product:', err.message);
      showSnackbar(err?.response?.data?.message || 'Error creating product', 'error');
    } finally {
      setLoading(false);
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
              <TextField {...field} label="Product Name" fullWidth error={!!errors.productName} helperText={errors.productName?.message} />
            )}
          />

          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.categoryName}
            value={selectedCategory}
            onChange={(_, val) => setSelectedCategory(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                error={!!errors.categoryName}
                helperText={errors.categoryName?.message}
              />
            )}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Autocomplete
              multiple
              options={subcategories}
              getOptionLabel={(opt) => opt}
              value={selectedSubcategories}
              onChange={(_, val) => setSelectedSubcategories(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Subcategories"
                  error={!!errors.subCategoriesName}
                  helperText={errors.subCategoriesName?.message}
                />
              )}
              fullWidth
            />
            {selectedCategory && (
              <IconButton onClick={() => setOpenSubForm(true)} color="primary">
                <AddIcon />
              </IconButton>
            )}
          </Stack>

          <ImagePreview
            label="Product Display Image"
            file={displayImage}
            onFileChange={setDisplayImage}
          />

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
                <TextField {...field} label="Price" type="number" fullWidth error={!!errors.productPrice} helperText={'Product Price Must Be A Number'} />
              )}
            />
            <Controller
              name="productSalePrice"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Sale Price" type="number" fullWidth error={!!errors.productSalePrice} helperText={'Sale price Should be a number and Must be less than Product Price'} />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Stock" type="number" fullWidth error={!!errors.stock} helperText={'Stock Should be a Number'} />
              )}
            />
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Weight in Kgs" type="number" fullWidth error={!!errors.weight} helperText={'Weight Should be a Number'} />
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
          {errors.availability && (
            <p style={{ color: 'red', marginTop: -10, marginBottom: 10, size: 5}}>{errors.availability.message}</p>
          )}

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
                    label={type.replace(/_/g, ' ')}
                  />
                ))}
              </FormGroup>
            )}
          />
          {errors.productType && (
            <p style={{ color: 'red', marginTop: -10, marginBottom: 10 }}>{errors.productType.message}</p>
          )}

          <Controller
            name="productDescription"
            control={control}
            render={({ field }) => (
              <CKEditorComponent
                label="Description"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.productDescription}
                helperText={errors.productDescription?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Save
        </Button>
      </DialogActions>

      <SubCategoryForm
        open={openSubForm}
        onClose={() => setOpenSubForm(false)}
        categoryId={selectedCategory?._id}
        onSuccess={() => {
          fetchCategories();
          setOpenSubForm(false);
        }}
        
      />
    </Dialog>
  );
};

export default ProductForm;
