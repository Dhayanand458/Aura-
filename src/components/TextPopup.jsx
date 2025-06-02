import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const TextPopup = ({ text, onClose, onSave, isEditing = false }) => {
  const [editText, setEditText] = React.useState(text);
  const [editMode, setEditMode] = React.useState(isEditing);

  const handleSave = () => {
    if (editMode) {
      onSave(editText);
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Text' : 'View Text'}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {editMode ? (
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[300px] font-mono"
            />
          ) : (
            <div className="min-h-[300px] whitespace-pre-wrap break-words rounded-md border bg-muted/50 p-4 font-mono">
              {text}
            </div>
          )}
        </div>

        <DialogFooter>
          {editMode ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                Edit
              </Button>
              <Button onClick={onClose}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextPopup;