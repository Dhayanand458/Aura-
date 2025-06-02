
import React from 'react';

const TextPopup = ({ text, onClose, onSave, isEditing = false }) => {
  const [editText, setEditText] = React.useState(text);
  const [editMode, setEditMode] = React.useState(isEditing);

  const handleSave = () => {
    if (editMode) {
      onSave(editText);
    }
    onClose();
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '80%',
        maxHeight: '80%',
        overflow: 'auto',
        border: '1px solid #ccc',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        
        {editMode ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              width: '100%',
              height: '300px',
              marginTop: '20px'
            }}
          />
        ) : (
          <div style={{ 
            whiteSpace: 'pre-wrap',
            marginTop: '20px',
            wordWrap: 'break-word'
          }}>
            {text}
          </div>
        )}
        
        <div style={{ marginTop: '10px' }}>
          {editMode ? (
            <>
              <button onClick={handleSave}>Save</button>
              <button onClick={onClose} style={{ marginLeft: '10px' }}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={handleEdit}>Edit</button>
              <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextPopup;
