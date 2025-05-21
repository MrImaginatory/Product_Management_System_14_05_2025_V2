import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const ImagePreview = ({ file, onFileChange }) => {
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) onFileChange(selected);
    };

    return (
        <Box>
            <Typography variant="subtitle1">Category Image</Typography>
            {!file ? (
                <Button variant="outlined" component="label">
                    Select Image
                    <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                </Button>
            ) : (
                <Box mt={1} display="flex" alignItems="center">
                    <img src={URL.createObjectURL(file)} alt="preview" height="50" />
                    <IconButton color="error" onClick={() => onFileChange(null)}>
                        <CancelIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default ImagePreview;
