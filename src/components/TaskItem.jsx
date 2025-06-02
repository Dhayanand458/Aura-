
import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateAuraDates, formatDate } from '../utils/auraCalculation';
import TextPopup from './TextPopup';
import ImageUpload from './ImageUpload';
import ConfirmDialog from './ConfirmDialog';

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
    <div style={{ 
      border: '1px solid #ccc', 
      margin: '10px 0', 
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <span>{task.serialNumber}.</span>
      
      {showTextInput ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text..."
            style={{ minWidth: '200px', minHeight: '50px' }}
          />
          <button onClick={handleSaveText}>Save</button>
        </div>
      ) : (
        <span 
          onClick={() => setShowTextPopup(true)}
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          {truncateText(task.text1)}
        </span>
      )}

      {collectionName.includes('folder') && (
        <>
          {showText2Input ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <textarea
                value={text2Input}
                onChange={(e) => setText2Input(e.target.value)}
                placeholder="Enter second text..."
                style={{ minWidth: '200px', minHeight: '50px' }}
              />
              <button onClick={handleSaveText2}>Save</button>
            </div>
          ) : showText2 && task.text2 ? (
            <span 
              onClick={() => setShowText2Popup(true)}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {truncateText(task.text2)}
            </span>
          ) : (
            <button onClick={handleEyeClick}>👁</button>
          )}
        </>
      )}

      <span>next in {formatDate(getCurrentDate())}</span>

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

      <button onClick={() => setShowConfirm('notDone')}>Not Done</button>
      <button onClick={() => setShowConfirm('done')}>Done</button>

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

      {showConfirm && (
        <ConfirmDialog
          message={showConfirm === 'done' ? 'Are you sure you want to mark this as done?' : 'Are you sure you want to mark this as not done?'}
          onConfirm={() => {
            if (showConfirm === 'done') {
              handleDone();
            } else {
              handleNotDone();
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </div>
  );
};

export default TaskItem;
