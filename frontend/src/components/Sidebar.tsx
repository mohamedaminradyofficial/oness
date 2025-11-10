import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Box
} from '@mui/material';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  VideoLibrary as VideoIcon,
  BarChart as StatsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'analysis', label: '🔍 تحليل جديد', icon: <SearchIcon /> },
    { id: 'history', label: '📚 السجل السابق', icon: <HistoryIcon /> },
    { id: 'video', label: '🎬 تحليل فيديو', icon: <VideoIcon /> },
    { id: 'stats', label: '📊 الإحصائيات', icon: <StatsIcon /> },
  ];

  // Mock service status - in real app, fetch from API
  const geminiAvailable = !!process.env.REACT_APP_GEMINI_API_KEY;
  const groqAvailable = !!process.env.REACT_APP_GROQ_API_KEY;
  const databaseAvailable = true; // Mock

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ textAlign: 'right', mb: 2 }}>
          ⚙️ الإعدادات
        </Typography>

        <Typography variant="subtitle2" sx={{ textAlign: 'right', mb: 1 }}>
          🔑 حالة الخدمات:
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              icon={geminiAvailable ? <CheckIcon /> : <ErrorIcon />}
              label="Gemini API"
              color={geminiAvailable ? 'success' : 'error'}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              icon={groqAvailable ? <CheckIcon /> : <ErrorIcon />}
              label="Groq API"
              color={groqAvailable ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              icon={databaseAvailable ? <CheckIcon /> : <ErrorIcon />}
              label="قاعدة البيانات"
              color={databaseAvailable ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ textAlign: 'right' }}>
          ℹ️ عن الوكيل
        </Typography>
        <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', mt: 1 }}>
          هذا الوكيل الذكي يقوم بـ:
          <br />- 📥 استخراج المحتوى من أي رابط
          <br />- 🔍 تحليل النصوص والمقالات
          <br />- 💻 كشف وشرح الأكواد البرمجية
          <br />- 📝 تقديم شرح مبسط بالعربية
          <br />- 🎯 التركيز على الذكاء الاصطناعي
          <br />- 💾 حفظ سجل التحليلات
        </Typography>
      </Box>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={currentPage === item.id}
              onClick={() => setCurrentPage(item.id)}
              sx={{
                textAlign: 'right',
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    textAlign: 'right',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
