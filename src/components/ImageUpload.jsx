import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageIcon, Upload } from 'lucide-react';
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
      <Card
        onClick={handleContainerClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          w-40 h-40 flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 hover:shadow-lg
          ${focused ? 'ring-2 ring-primary' : ''}
          ${image ? 'bg-primary/5' : 'bg-background'}
        `}
        tabIndex={0}
      >
        {image ? (
          <div className="text-center space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-primary" />
            <div className="text-xs text-muted-foreground">Click to view image</div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        )}
        
        {selected && !image && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            className="mt-2"
          >
            Upload
          </Button>
        )}
      </Card>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
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