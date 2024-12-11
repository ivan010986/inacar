import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const Cookies = () => {
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const cookieStatus = localStorage.getItem('cookie_accepted');
    if (cookieStatus === 'true') {
      setCookieAccepted(true);
    } else {
      setModalVisible(true); // Mostrar el modal si no se ha aceptado
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie_accepted', 'true');
    setCookieAccepted(true);
    setModalVisible(false); // Cerrar el modal
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie_accepted', 'false');
    setCookieAccepted(false);
    setModalVisible(false); // Cerrar el modal
  };

  return (
    <Dialog open={modalVisible} onClose={() => setModalVisible(false)}>
      <DialogTitle>Aviso de Cookies</DialogTitle>
      <DialogContent>
        <p>
          Este sitio web utiliza cookies para mejorar tu experiencia. Al aceptar, estás de acuerdo con nuestra política de cookies.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeclineCookies} color="secondary">
          Declinar cookies
        </Button>
        <Button onClick={handleAcceptCookies} color="primary">
          Aceptar cookies
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Cookies;