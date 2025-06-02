import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateAuraDates, formatDate } from '../utils/auraCalculation';
import TextPopup from './TextPopup';
import ImageUpload from './ImageUpload';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Check, X } from 'lucide-react';

const TaskItem = ({ task, collectionName, onUpdate }) => {
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [showText2Popup, setShowText2Popup] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [editingText, setEditingText] = useState(false);
  const [editingText2, setEditingText2] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [text2Input, setText2Input] = useState('');
  const [showTextInput, setShowTextInput] = useState(!task.text1);
  const [showText2Input, setShowText2Input] = useState(false);
  const [showText2, setShowText2] = useState(false);

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleSaveText = async () => {
    try {
      const taskRef = doc(db, collectionName, task.id);
      await updateDoc(taskRef, { text1: textInput });
      setShowTextInput(false);
      setTextInput('');
      onUpdate();
    } catch (error) {
      console.error('Error saving text:', error);
    }
  };

  const handleSaveText2 = async () => {
    try {
      const taskRef = doc(db, collectionName, task.id);
      await updateDoc(taskRef, { text2: text2Input });
      setShowText2Input(false);
      setText2Input('');
      onUpdate();
    } catch (error) {
      console.error('Error saving text2:', error);
    }
  };

  const handleTextEdit = async (newText) => {
    try {
      const taskRef = doc(db, collectionName, task.id);
      await updateDoc(taskRef, { text1: newText });
      onUpdate();
    } catch (error) {
      console.error('Error updating text:', error);
    }
  };

  const handleText2Edit = async (newText) => {
    try {
      const taskRef = doc(db, collectionName, task.id);
      await updateDoc(taskRef, { text2: newText });
      onUpdate();
    } catch (error) {
      console.error('Error updating text2:', error);
    }
  };

  const handleImageUpdate = async (imageKey, imageData) => {
    try {
      const taskRef = doc(db, collectionName, task.id);
      await updateDoc(taskRef, { [imageKey]: imageData });
      onUpdate();
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleNotDone = async () => {
    try {
      const auraDates = generateAuraDates(new Date(), new Date(task.endDate));
      const currentIndex = task.currentAuraIndex || 0;
      const newIndex = Math.min(currentIndex + 1, auraDates.length - 1);
      
      const taskRef = doc(db, collectionName, task.id);
      await updateDoc(taskRef, { 
        currentAuraIndex: newIndex,
        currentDate: auraDates[newIndex].toISOString()
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDone = async () => {
    try {
      await deleteDoc(doc(db, collectionName, task.id));
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getCurrentDate = () => {
    const auraDates = generateAuraDates(new Date(), new Date(task.endDate));
    const currentIndex = task.currentAuraIndex || 0;
    return auraDates[Math.min(currentIndex + 1, auraDates.length - 1)];
  };

  const handleEyeClick = () => {
    if (!showText2) {
      setShowText2(true);
      if (!task.text2) {
        setShowText2Input(true);
      }
    } else {
      setShowText2(false);
      setShowText2Input(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-primary">{task.serialNumber}.</span>
              
              {showTextInput ? (
                <div className="flex-1 flex gap-2">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text..."
                    className="flex-1 min-h-[100px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleSaveText}>Save</Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTextPopup(true)}
                  className="text-left hover:text-primary transition-colors"
                >
                  {truncateText(task.text1)}
                </button>
              )}
            </div>

            {collectionName.includes('folder') && (
              <div className="flex items-center gap-2">
                {showText2Input ? (
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={text2Input}
                      onChange={(e) => setText2Input(e.target.value)}
                      placeholder="Enter second text..."
                      className="flex-1 min-h-[100px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button onClick={handleSaveText2}>Save</Button>
                  </div>
                ) : showText2 && task.text2 ? (
                  <button
                    onClick={() => setShowText2Popup(true)}
                    className="text-left hover:text-primary transition-colors"
                  >
                    {truncateText(task.text2)}
                  </button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEyeClick}
                    className="hover:bg-primary/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Next in {formatDate(getCurrentDate())}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <ImageUpload
              label="Image 1"
              image={task.image1}
              onImageChange={(imageData) => handleImageUpdate('image1', imageData)}
            />

            <ImageUpload
              label="Image 2"
              image={task.image2}
              onImageChange={(imageData) => handleImageUpdate('image2', imageData)}
            />
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => setShowConfirm('notDone')}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Not Done
            </Button>
            <Button
              variant="default"
              onClick={() => setShowConfirm('done')}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Done
            </Button>
          </div>
        </div>
      </CardContent>

      {showTextPopup && (
        <TextPopup
          text={task.text1}
          onClose={() => setShowTextPopup(false)}
          onSave={handleTextEdit}
          isEditing={editingText}
        />
      )}

      {showText2Popup && (
        <TextPopup
          text={task.text2}
          onClose={() => setShowText2Popup(false)}
          onSave={handleText2Edit}
          isEditing={editingText2}
        />
      )}

      <AlertDialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {showConfirm === 'done'
                ? 'Are you sure you want to mark this as done?'
                : 'Are you sure you want to mark this as not done?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showConfirm === 'done') {
                  handleDone();
                } else {
                  handleNotDone();
                }
                setShowConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TaskItem;