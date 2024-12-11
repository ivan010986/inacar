import React from 'react';
import { Modal, CircularProgress, Typography } from '@mui/material';

const LoadingModal = ({ open }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border:'none' }}>
        <CircularProgress />
        <Typography variant="h6" id="loading-modal-title" style={{ marginTop: '16px' }}>
          Cargando...
        </Typography>
      </div>
    </Modal>
  );
};

export default LoadingModal;