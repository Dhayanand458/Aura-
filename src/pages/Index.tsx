import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateAuraDates } from '../utils/auraCalculation';
import DatePicker from '../components/DatePicker';
import TaskItem from '../components/TaskItem';
import { Button } from '@/components/ui/button';
import { PlusCircle, FolderPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
    setTasks(prev => [...prev]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Task Manager
      </h1>
      
      <div className="flex gap-4 mb-8 justify-center">
        <Button onClick={handleAddTask} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Task
        </Button>
        <Button onClick={handleAddFolder} variant="outline" className="gap-2">
          <FolderPlus className="w-4 h-4" />
          Add Folder
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            collectionName="tasks"
            onUpdate={handleUpdate}
          />
        ))}

        {folders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Folders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{folder.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderEdit(folder);
                      }}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDatePicker && (
        <DatePicker
          onDateSelect={handleDateSelect}
          onCancel={() => setShowDatePicker(false)}
          defaultDate={lastEndDate}
        />
      )}

      <Dialog open={showFolderInput} onOpenChange={setShowFolderInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFolder ? 'Edit Folder' : 'Create Folder'}</DialogTitle>
            <DialogDescription>
              {editingFolder ? 'Update the folder name below.' : 'Enter a name for your new folder.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFolderInput(false);
                  setEditingFolder(null);
                  setFolderName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleFolderSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;