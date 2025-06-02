import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const ImageViewer = ({ imageUrl, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <div className="relative w-full h-full overflow-auto">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="min-h-[200px] flex items-center justify-center p-4">
            <img 
              src={imageUrl} 
              alt="Uploaded content"
              className="max-w-none max-h-none"
              style={{
                maxWidth: 'none',
                maxHeight: 'none'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;