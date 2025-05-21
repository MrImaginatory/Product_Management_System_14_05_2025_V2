import { Box, Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import { VisuallyHiddenInput } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUploadIcon'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CreateCategoryDialog = ({open, close, category, onSubmit}) => {

    const [formData,setFormData] = useState({
        categoryName: category?.categoryName || '',
        description: category?.description || '',
        slug:category?.slug || '',
        image:null
    })

    const handleChange = (e) => {
        const {name, value, files} = e.target
        setFormData((prevData) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }))
    }
    const handleSubmit = () => {
        const data = new FormData();
        data.append('categoryName', formData.categoryName);
        data.append('description', formData.description);
        if(formData.image){
            data.append('categoryImage', formData.image);
        }
        onSubmit(data);
    }

    return (
        <Dialog open={open} close={close} maxWidth='sm' fullWidth>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
                <Box display='flex' flexDirection='column' gap={2} mt={1}>
                    <TextField 
                        name='categoryName'
                        label='Category Name'
                        value={formData.categoryName}
                        onChange={handleChange}
                        required
                    />
                    <TextField 
                        name='slug'
                        label='Slug'
                        value={formData.slug}
                        onChange={handleChange}
                        required
                    />
                    <TextField 
                        name='categoryDescription'
                        label='Category Description'
                        value={formData.categoryDescription}
                        onChange={handleChange}
                        required
                    />
                    <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    >
                        Upload files
                    <VisuallyHiddenInput
                        type="images"
                        onChange={handleChange}
                        multiple
                    />
                    </Button>
                    <Typography variant="h6" gutterBottom>Product Description</Typography>
                    <CKEditor
                        editor={ClassicEditor}
                        name="categoryDescription"
                        value={formData.categoryDescription}
                        data="<p>Start typing here...</p>"
                        onChange={handleChange}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCategoryDialog