import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const ImagePreview = ({
  label,
  file,
  fileList,
  onFileChange,
  onFileListChange,
  multiple = false,
  max = 50
}) => {
  const handleSingleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileChange(selected);
  };

  const handleMultipleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (fileList.length + selectedFiles.length > max) return alert(`Max ${max} images allowed`);
    onFileListChange([...fileList, ...selectedFiles]);
  };

  const removeImage = (index) => {
    const newList = [...fileList];
    newList.splice(index, 1);
    onFileListChange(newList);
  };

  return (
    <Box>
      <Typography variant="subtitle1">{label}</Typography>

      {multiple ? (
        <>
          <Button variant="outlined" component="label">
            Select Images
            <input
              hidden
              accept="image/*"
              type="file"
              multiple
              onChange={handleMultipleFiles}
            />
          </Button>
          <Box mt={1} display="flex" gap={2} flexWrap="wrap">
            {fileList.map((img, idx) => (
              <Box key={idx} position="relative">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`img-${idx}`}
                  height={80}
                  style={{ borderRadius: 4 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeImage(idx)}
                  sx={{ position: 'absolute', top: -10, right: -10 }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <>
          {!file ? (
            <Button variant="outlined" component="label">
              Select Image
              <input hidden accept="image/*" type="file" onChange={handleSingleFile} />
            </Button>
          ) : (
            <Box mt={1} display="flex" alignItems="center" gap={2}>
              <img src={URL.createObjectURL(file)} alt="thumb" height={50} />
              <IconButton color="error" onClick={() => onFileChange(null)}>
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ImagePreview;
