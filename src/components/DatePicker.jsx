
import React, { useState } from 'react';

const DatePicker = ({ onDateSelect, onCancel, defaultDate }) => {
  const [selectedDate, setSelectedDate] = useState(
    defaultDate ? defaultDate.toISOString().split('T')[0] : ''
  );

  const handleOk = () => {
    if (selectedDate) {
      onDateSelect(new Date(selectedDate));
    }
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
        border: '1px solid #ccc',
        position: 'relative'
      }}>
        <button 
          onClick={onCancel}
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
        
        <h3>Select End Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleOk} style={{ marginRight: '10px' }}>OK</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
