
import React from 'react';

const ImageViewer = ({ imageUrl, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '95%',
        maxHeight: '95%',
        position: 'relative',
        overflow: 'auto',
        borderRadius: '8px'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '16px',
            cursor: 'pointer',
            zIndex: 1001
          }}
        >
          ×
        </button>
        
        <div style={{
          maxHeight: 'calc(95vh - 40px)',
          maxWidth: 'calc(95vw - 40px)',
          overflow: 'auto'
        }}>
          <img 
            src={imageUrl} 
            alt="Uploaded content"
            style={{
              display: 'block',
              maxWidth: 'none',
              maxHeight: 'none',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
