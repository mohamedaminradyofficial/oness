import React from 'react';
import { Typography, Box } from '@mui/material';

const StatsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
        📊 إحصائيات وأداء النظام
      </Typography>
      <Typography sx={{ textAlign: 'right' }}>
        هذه الصفحة قيد التطوير...
      </Typography>
    </Box>
  );
};

export default StatsPage;
