import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Stack, InputAdornment, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CustomPagination = ({ page, totalPages, onChange }) => {
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageSubmit = () => {
    const num = parseInt(pageInput, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages && num !== page) {
      onChange(num);
    } else {
      setPageInput(String(page)); // Reset to current page if invalid
    }
  };

  return (
    <Box mt={4} display="flex" justifyContent="center">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ userSelect: 'none' }}>
        <IconButton
          color="primary"
          size="small"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
          sx={{
            border: '1px solid',
            borderColor: page === 1 ? 'grey.300' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
            },
            transition: 'background-color 0.3s ease',
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <TextField
          type="number"
          size="small"
          variant="outlined"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={handlePageSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handlePageSubmit()}
          inputProps={{
            min: 1,
            max: totalPages,
            style: {
              textAlign: 'center',
              width: 60,
              borderRadius: 8,
              padding: '6px 8px',
              fontWeight: 600,
            },
            'aria-label': 'Page number',
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 8px 2px rgba(25,118,210,0.3)', // subtle glow
                borderColor: 'primary.main',
              },
            },
          }}
        />

        <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center', color: 'text.secondary' }}>
          of {totalPages}
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={handlePageSubmit}
          disabled={String(page) === pageInput || !pageInput}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            paddingX: 2,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 3px 10px rgba(25,118,210,0.4)',
            },
          }}
        >
          Go
        </Button>

        <IconButton
          color="primary"
          size="small"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
          sx={{
            border: '1px solid',
            borderColor: page === totalPages ? 'grey.300' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
            },
            transition: 'background-color 0.3s ease',
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default CustomPagination;
