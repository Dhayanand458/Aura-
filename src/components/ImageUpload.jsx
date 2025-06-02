
import React, { useState, useRef } from 'react';
import ImageViewer from './ImageViewer';

const ImageUpload = ({ label, image, onImageChange }) => {
  const [showViewer, setShowViewer] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
  const fileInputRef = useRef();

  const handleFileSelect = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
    setSelected(false);
  };

  const handlePaste = (e) => {
    if (!focused) return;
    
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        handleFileSelect(blob);
        break;
      }
    }
    setSelected(false);
  };

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [focused]);

  const handleContainerClick = () => {
    if (image) {
      setShowViewer(true);
    } else {
      setSelected(true);
      setFocused(true);
    }
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  return (
    <>
      <div
        onClick={handleContainerClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: selected ? '2px solid blue' : focused ? '2px solid blue' : '1px solid #ccc',
          padding: '10px',
          margin: '5px',
          cursor: 'pointer',
          minHeight: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: image ? '#e8f5e8' : 'white',
          tabIndex: 0
        }}
      >
        {image ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>📷</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Click to view image</div>
          </div>
        ) : (
          <span>{label}</span>
        )}
        
        {selected && !image && (
          <button 
            onClick={handleUploadClick}
            style={{ 
              marginTop: '5px',
              padding: '5px 10px',
              fontSize: '12px'
            }}
          >
            Click to Upload
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      
      {showViewer && image && (
        <ImageViewer 
          imageUrl={image} 
          onClose={() => setShowViewer(false)} 
        />
      )}
    </>
  );
};

export default ImageUpload;
