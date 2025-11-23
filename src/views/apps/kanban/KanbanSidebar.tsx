import { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { IconLayoutKanban, IconMenu2 } from '@tabler/icons-react';
import styles from './kanban.styles.module.css';

const KanbanSidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const navContent = (
    <Box
      component="nav"
      aria-label="Kanban navigation"
      sx={{ width: isMobile ? 260 : '100%', color: theme.palette.text.primary }}
    >
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton selected aria-current="page">
            <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>
              <IconLayoutKanban size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Kanban"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Box className={styles.sidebarRoot}>
        <Tooltip title="Open Kanban sidebar">
          <IconButton
            className={styles.sidebarToggle}
            color="primary"
            aria-label="Open Kanban sidebar"
            onClick={() => setOpen(true)}
            size="large"
          >
            <IconMenu2 size={20} />
          </IconButton>
        </Tooltip>
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          <Box role="presentation" sx={{ height: '100%', background: theme.palette.background.default }}>
            {navContent}
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Box className={styles.sidebarRoot}>
      <Paper
        elevation={0}
        className={styles.sidebarPaper}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {navContent}
      </Paper>
    </Box>
  );
};

export default KanbanSidebar;
