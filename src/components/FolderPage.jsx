
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateAuraDates } from '../utils/auraCalculation';
import DatePicker from './DatePicker';
import TaskItem from './TaskItem';

const FolderPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lastEndDate, setLastEndDate] = useState(null);

  const collectionName = `folder-${folderId}`;

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('serialNumber'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
      
      if (tasksData.length > 0) {
        setLastEndDate(new Date(tasksData[tasksData.length - 1].endDate));
      }
    });

    return () => unsubscribe();
  }, [collectionName]);

  const handleAddTask = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = async (endDate) => {
    try {
      const today = new Date();
      const auraDates = generateAuraDates(today, endDate);
      const serialNumber = tasks.length + 1;

      await addDoc(collection(db, collectionName), {
        serialNumber,
        endDate: endDate.toISOString(),
        currentDate: auraDates[1]?.toISOString() || today.toISOString(),
        currentAuraIndex: 0,
        text1: '',
        text2: '',
        image1: null,
        image2: null,
        createdAt: new Date().toISOString()
      });

      setShowDatePicker(false);
      setLastEndDate(endDate);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdate = () => {
    // Force re-render by updating a dummy state
    setTasks(prev => [...prev]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back
      </button>
      
      <h2>Folder Tasks</h2>
      
      <button onClick={handleAddTask}>+ Add Task</button>

      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          collectionName={collectionName}
          onUpdate={handleUpdate}
        />
      ))}

      {showDatePicker && (
        <DatePicker
          onDateSelect={handleDateSelect}
          onCancel={() => setShowDatePicker(false)}
          defaultDate={lastEndDate}
        />
      )}
    </div>
  );
};

export default FolderPage;
