import React from 'react';
import { User, Clock, Trash2 } from 'lucide-react';

const TaskTable = ({ tasks, onUpdateStatus, onDeleteTask }) => {
  
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-50 text-success border-green-200';
      case 'IN_PROGRESS':
        return 'bg-teal-50 text-accent border-teal-200';
      case 'BLOCKED':
        return 'bg-red-50 text-danger border-red-200';
      default:
        return 'bg-slate-50 text-secondary border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-50 text-danger border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-warning border-amber-200';
      default:
        return 'bg-slate-50 text-secondary border-slate-200';
    }
  };

  return (
    <div className="table-container overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-border">
            <th className="table-header">Task Name</th>
            <th className="table-header">Assignee</th>
            <th className="table-header">Due Date</th>
            <th className="table-header">Priority</th>
            <th className="table-header">Status</th>
            <th className="table-header">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm">
                  <div className="font-semibold text-text">{task.name}</div>
                  {task.description && (
                    <div className="text-xs text-secondary truncate max-w-md">
                      {task.description.replace(/Action item from.*/, '')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-secondary">
                  <div className="flex items-center gap-2">
                    {task.assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.fullName.charAt(0)}
                        </div>
                        <span className="font-medium text-text">{task.assignee.fullName}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                          <User size={12} />
                        </div>
                        <span className="italic text-secondary-light">Unassigned</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-secondary">
                  {task.dueDate ? (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={14} className="text-secondary-light" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className={`px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none cursor-pointer ${getStatusBadge(
                      task.status
                    )}`}
                  >
                    <option value="PENDING">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-secondary-light hover:text-danger rounded hover:bg-slate-100 transition-all"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-sm text-secondary-light italic bg-white">
                No tasks match filters or have been created.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
