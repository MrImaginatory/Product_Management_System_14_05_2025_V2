import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const CustomPagination = ({ page, totalPages, onChange }) => {
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageSubmit = () => {
    const num = parseInt(pageInput);
    if (!isNaN(num) && num >= 1 && num <= totalPages && num !== page) {
      onChange(num);
    } else {
      setPageInput(String(page)); // reset if invalid
    }
  };

  return (
    <Box mt={3} display="flex" justifyContent="center" alignItems="center" gap={1}>
      <Button
        variant="outlined"
        size="small"
        disabled={page === 1}
        onClick={() => onChange(Math.max(page - 1, 1))}
      >
        Prev
      </Button>

      <TextField
        type="number"
        size="small"
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        onBlur={handlePageSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handlePageSubmit();
        }}
        inputProps={{
          min: 1,
          max: totalPages,
          style: { width: 60, textAlign: 'center' },
        }}
      />

      <Typography variant="body2">of {totalPages}</Typography>

      <Button variant="outlined" size="small" onClick={handlePageSubmit}>
        Go
      </Button>

      <Button
        variant="outlined"
        size="small"
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(page + 1, totalPages))}
      >
        Next
      </Button>
    </Box>
  );
};

export default CustomPagination;
