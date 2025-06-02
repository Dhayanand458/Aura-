
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateAuraDates } from '../utils/auraCalculation';
import DatePicker from '../components/DatePicker';
import TaskItem from '../components/TaskItem';

const Index = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [lastEndDate, setLastEndDate] = useState(null);

  useEffect(() => {
    // Listen to tasks
    const tasksQuery = query(collection(db, 'tasks'), orderBy('serialNumber'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
      
      if (tasksData.length > 0) {
        setLastEndDate(new Date(tasksData[tasksData.length - 1].endDate));
      }
    });

    // Listen to folders
    const foldersQuery = query(collection(db, 'folders'), orderBy('createdAt'));
    const unsubscribeFolders = onSnapshot(foldersQuery, (querySnapshot) => {
      const foldersData = [];
      querySnapshot.forEach((doc) => {
        foldersData.push({ id: doc.id, ...doc.data() });
      });
      setFolders(foldersData);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeFolders();
    };
  }, []);

  const handleAddTask = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = async (endDate) => {
    try {
      const today = new Date();
      const auraDates = generateAuraDates(today, endDate);
      const serialNumber = tasks.length + 1;

      await addDoc(collection(db, 'tasks'), {
        serialNumber,
        endDate: endDate.toISOString(),
        currentDate: auraDates[1]?.toISOString() || today.toISOString(),
        currentAuraIndex: 0,
        text1: '',
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

  const handleAddFolder = () => {
    setShowFolderInput(true);
  };

  const handleFolderSave = async () => {
    if (folderName.trim()) {
      try {
        if (editingFolder) {
          await updateDoc(doc(db, 'folders', editingFolder.id), {
            name: folderName.trim()
          });
          setEditingFolder(null);
        } else {
          await addDoc(collection(db, 'folders'), {
            name: folderName.trim(),
            createdAt: new Date().toISOString()
          });
        }
        setFolderName('');
        setShowFolderInput(false);
      } catch (error) {
        console.error('Error saving folder:', error);
      }
    }
  };

  const handleFolderEdit = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setShowFolderInput(true);
  };

  const handleFolderClick = (folderId) => {
    navigate(`/folder/${folderId}`);
  };

  const handleUpdate = () => {
    // Force re-render
    setTasks(prev => [...prev]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleAddTask} style={{ marginRight: '10px' }}>
          + Add Task
        </button>
        <button onClick={handleAddFolder}>
          + Add Folder
        </button>
      </div>

      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          collectionName="tasks"
          onUpdate={handleUpdate}
        />
      ))}

      {folders.map((folder) => (
        <div 
          key={folder.id}
          style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '10px 0',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleFolderClick(folder.id)}
        >
          {folder.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFolderEdit(folder);
            }}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✏️
          </button>
        </div>
      ))}

      {showDatePicker && (
        <DatePicker
          onDateSelect={handleDateSelect}
          onCancel={() => setShowDatePicker(false)}
          defaultDate={lastEndDate}
        />
      )}

      {showFolderInput && (
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
              onClick={() => {
                setShowFolderInput(false);
                setEditingFolder(null);
                setFolderName('');
              }}
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
            
            <h3>{editingFolder ? 'Edit Folder' : 'Create Folder'}</h3>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              style={{ width: '200px', padding: '5px' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleFolderSave} style={{ marginRight: '10px' }}>
                OK
              </button>
              <button onClick={() => {
                setShowFolderInput(false);
                setEditingFolder(null);
                setFolderName('');
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
