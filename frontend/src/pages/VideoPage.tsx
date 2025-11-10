import React from 'react';
import { Typography, Box } from '@mui/material';

const VideoPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
        🎬 تحليل الفيديوهات (YouTube وغيرها)
      </Typography>
      <Typography sx={{ textAlign: 'right' }}>
        هذه الصفحة قيد التطوير...
      </Typography>
    </Box>
  );
};

export default VideoPage;
