
import React, { useState } from "react";
import { Plus, Trash } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  subject?: string;
  dueDate?: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Complete algebra worksheet", completed: false, subject: "Mathematics" },
    { id: "2", title: "Read Shakespeare analysis", completed: true, subject: "English" },
    { id: "3", title: "Review notes for science test", completed: false, subject: "Science" },
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const addTask = () => {
    if (newTaskTitle.trim() === "") return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };
  
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  return (
    <Layout>
      <div className="space-y-6 animate-slide-up pt-4">
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Tasks
        </h1>
        
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-grow"
          />
          <Button onClick={addTask} size="icon" aria-label="Add task">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4 pt-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending tasks. Great job!</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTaskCompletion} 
                  onDelete={deleteTask} 
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 pt-4">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No completed tasks yet.</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTaskCompletion} 
                  onDelete={deleteTask} 
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        <Checkbox 
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />
        <div>
          <label 
            htmlFor={`task-${task.id}`}
            className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
          >
            {task.title}
          </label>
          {task.subject && (
            <p className="text-xs text-gray-500">{task.subject}</p>
          )}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Tasks;
