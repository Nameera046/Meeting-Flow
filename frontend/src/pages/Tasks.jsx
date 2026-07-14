import React, { useState, useEffect } from 'react';
import api from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import TaskTable from '../components/TaskTable';
import { Plus, LayoutGrid, List, Search, X, Loader2 } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // kanban or table

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Manual Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch Tasks
      const tRes = await api.get('/tasks');
      setTasks(tRes.data);

      // Fetch Users
      const uRes = await api.get('/users');
      setUsers(uRes.data);
    } catch (err) {
      setError('Failed to fetch tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      // Find current task
      const taskObj = tasks.find((t) => t.id === taskId);
      if (!taskObj) return;

      const payload = {
        name: taskObj.name,
        description: taskObj.description,
        assigneeId: taskObj.assignee ? taskObj.assignee.id : null,
        priority: taskObj.priority,
        dueDate: taskObj.dueDate,
        status: newStatus,
      };

      await api.put(`/tasks/${taskId}`, payload);
      // Quick local update to prevent full reload flicker
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        description,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        priority,
        dueDate: dueDate || null,
        status,
      };

      await api.post('/tasks', payload);
      setTaskModalOpen(false);

      // Reset
      setName('');
      setDescription('');
      setAssigneeId('');
      setPriority('MEDIUM');
      setDueDate('');
      setStatus('PENDING');

      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local Filter Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesAssignee = !assigneeFilter || (t.assignee && t.assignee.id === parseInt(assigneeFilter));
    const matchesPriority = !priorityFilter || t.priority?.toUpperCase() === priorityFilter.toUpperCase();
    const matchesSearch = !searchFilter || 
      t.name?.toLowerCase().contains(searchFilter.toLowerCase()) || 
      t.description?.toLowerCase().contains(searchFilter.toLowerCase());
    
    // Wait, in plain Javascript, string has .includes() not .contains(). Let's change .contains to .includes to avoid crash!
    // Correct: t.name?.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesSearchCorrect = !searchFilter || 
      (t.name && t.name.toLowerCase().includes(searchFilter.toLowerCase())) || 
      (t.description && t.description.toLowerCase().includes(searchFilter.toLowerCase()));

    return matchesAssignee && matchesPriority && matchesSearchCorrect;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Tasks Workspace</h2>
          <p className="text-sm text-secondary">Manage and update individual milestones and action items</p>
        </div>
        <button
          onClick={() => setTaskModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-card cursor-pointer"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-white border border-border p-4 rounded-xl shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:border-accent"
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg text-xs bg-white text-secondary cursor-pointer focus:outline-none focus:border-accent"
          >
            <option value="">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg text-xs bg-white text-secondary cursor-pointer focus:outline-none focus:border-accent"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Right Side: View Toggles */}
        <div className="flex items-center gap-1 border border-border p-1 bg-slate-50 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-accent shadow-card border border-border/50' : 'text-secondary-light hover:text-secondary'
            }`}
            title="Kanban Board"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-accent shadow-card border border-border/50' : 'text-secondary-light hover:text-secondary'
            }`}
            title="Table List"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Workspace Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary text-sm">Loading task board...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-danger border border-red-200 p-4 rounded-xl text-center">{error}</div>
      ) : (
        <div className="animate-fade-in">
          {viewMode === 'kanban' ? (
            <KanbanBoard tasks={filteredTasks} onUpdateStatus={handleUpdateStatus} />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onUpdateStatus={handleUpdateStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-border shadow-dropdown p-6 relative animate-fade-in">
            <button
              onClick={() => setTaskModalOpen(false)}
              className="absolute right-4 top-4 text-secondary-light hover:text-secondary"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-text mb-4">Create Manual Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Document database schemas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Task specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent h-20"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="PENDING">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
