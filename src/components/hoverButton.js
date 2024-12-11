import React, { useState } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';

const HoverButton = ({ onRemove }) => {
    return (
        <div style={{ position: 'relative' }}>
            <button
                style={{
                    opacity: 0, // El botón es invisible por defecto
                    transition: 'opacity 0.3s ease', // Transición suave
                    background: 'none',
                    border: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                onClick={onRemove} // Ejecuta la función de eliminación
            >
                <RemoveIcon color='error' />
            </button>
        </div>
    );
};

export default HoverButton;