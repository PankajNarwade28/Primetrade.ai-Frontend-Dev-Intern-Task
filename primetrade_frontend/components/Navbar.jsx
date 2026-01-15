"use client";
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';

export default function Navbar({ isLoggedIn, userEmail, onLogout }) {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          PrimeTrade Dashboard
        </Typography>
        {isLoggedIn && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">{userEmail}</Typography>
            <Button 
              color="inherit" 
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              variant="outlined"
              sx={{ borderColor: 'white' }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}