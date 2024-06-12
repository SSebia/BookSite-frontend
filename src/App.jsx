import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from 'src/services/AuthContext';
import PrivateRoute from 'src/services/PrivateRoute';

import Login from "src/pages/login";
import Home from "src/pages/home";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Layout = () => ( 
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
      <Outlet /> 
    </SnackbarProvider>
  </ThemeProvider>
);

const NoPage = () => <h1>404 Page Not Found</h1>;

function App() {

  return (
    <Router>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute roles={['User', 'Admin']}><Home /></PrivateRoute>} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;