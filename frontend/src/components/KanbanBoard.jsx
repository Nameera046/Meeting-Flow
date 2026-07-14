import React from 'react';
import { Clock, AlertCircle, ArrowRightLeft, ArrowRight, User } from 'lucide-react';

const KanbanBoard = ({ tasks, onUpdateStatus }) => {
  const columns = [
    { id: 'PENDING', title: 'To Do', color: 'bg-slate-100 border-t-slate-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-teal-50/50 border-t-accent' },
    { id: 'COMPLETED', title: 'Completed', color: 'bg-green-50/50 border-t-success' },
    { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-50/50 border-t-danger' },
  ];

  const getPriorityStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-50 text-danger border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-warning border-amber-200';
      default:
        return 'bg-slate-50 text-secondary border-slate-200';
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((t) => t.status?.toUpperCase() === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      {columns.map((col) => {
        const colTasks = getTasksByStatus(col.id);
        return (
          <div key={col.id} className="bg-slate-50 rounded-xl border border-border p-4 flex flex-col min-h-[500px]">
            {/* Column Header */}
            <div className={`border-t-4 ${col.color} pt-2 pb-4 flex items-center justify-between`}>
              <span className="font-semibold text-sm text-text">{col.title}</span>
              <span className="text-xs font-bold text-secondary bg-white px-2 py-0.5 border border-border rounded-full">
                {colTasks.length}
              </span>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {colTasks.length > 0 ? (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl border border-border shadow-card space-y-3 group hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-text line-clamp-2">{task.name}</h4>
                      {task.description && (
                        <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                          {task.description.replace(/Action item from.*/, '')}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 text-xs">
                      {/* Priority Tag */}
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-medium uppercase ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <span className="text-secondary-light flex items-center gap-1 font-medium">
                          <Clock size={12} />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Assignee and Action Panel */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      {/* Assignee */}
                      <div className="flex items-center gap-2">
                        {task.assignee ? (
                          <div
                            className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold"
                            title={`Assigned to ${task.assignee.fullName}`}
                          >
                            {task.assignee.fullName.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center" title="Unassigned">
                            <User size={10} />
                          </div>
                        )}
                        <span className="text-[10px] font-medium text-secondary truncate max-w-[80px]">
                          {task.assignee ? task.assignee.fullName.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>

                      {/* Action selector to change status */}
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                        className="text-[10px] font-medium text-secondary bg-slate-50 hover:bg-slate-100 border border-border rounded px-1 py-0.5 focus:outline-none"
                      >
                        <option value="PENDING">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-secondary-light border-2 border-dashed border-slate-200 rounded-xl">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
