import React from 'react';
import { Typography } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CKEditorComponent = ({ label, value, onChange, error }) => (
    <div>
        <Typography variant="subtitle1">{label}</Typography>
        <CKEditor
            editor={ClassicEditor}
            data={value}
            onChange={(_, editor) => onChange(editor.getData())}
        />
        {error && <Typography color="error" variant="caption">This field is required</Typography>}
    </div>
);

export default CKEditorComponent;
