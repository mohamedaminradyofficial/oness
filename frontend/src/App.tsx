import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Paper, Typography, Box } from '@mui/material';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import VideoPage from './pages/VideoPage';
import StatsPage from './pages/StatsPage';
import Sidebar from './components/Sidebar';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('analysis');

  const renderPage = () => {
    switch (currentPage) {
      case 'analysis':
        return <AnalysisPage />;
      case 'history':
        return <HistoryPage />;
      case 'video':
        return <VideoPage />;
      case 'stats':
        return <StatsPage />;
      default:
        return <AnalysisPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Container maxWidth="lg">
              <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'right' }}>
                  🤖 الوكيل الذكي لتحليل المحتوى من الإنترنت
                </Typography>
                {renderPage()}
              </Paper>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
