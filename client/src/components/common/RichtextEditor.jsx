import React from 'react';
import { Typography, Box } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CKEditorComponent = ({ label, value, onChange, error }) => (
  <Box mb={2}>
    <Typography variant="subtitle1" gutterBottom>
      {label}
    </Typography>
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={(_, editor) => onChange(editor.getData())}
    />
    {error && (
      <Typography color="error" variant="caption" mt={0.5} display="block">
        This field is required
      </Typography>
    )}
  </Box>
);

export default CKEditorComponent;
