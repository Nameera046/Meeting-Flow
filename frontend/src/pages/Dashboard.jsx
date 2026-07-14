import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  User,
  Plus
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-danger border border-red-200 p-4 rounded-xl text-center">
        {error}
      </div>
    );
  }

  // Chart Data preparation
  const doughnutData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Blocked'],
    datasets: [
      {
        data: [
          stats.pendingTasks,
          stats.inProgressTasks,
          stats.completedTasks,
          stats.blockedTasks,
        ],
        backgroundColor: ['#475569', '#0F766E', '#16A34A', '#DC2626'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { family: 'Inter', size: 11 },
        },
      },
    },
  };

  const barLabels = Object.keys(stats.tasksAssignedPerUser || {});
  const barValues = Object.values(stats.tasksAssignedPerUser || {});

  const barData = {
    labels: barLabels.length > 0 ? barLabels : ['No Users'],
    datasets: [
      {
        label: 'Assigned Tasks',
        data: barValues.length > 0 ? barValues : [0],
        backgroundColor: '#0F766E',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: '#F1F5F9' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Overview</h2>
          <p className="text-sm text-secondary">Monitor meeting records, tasks status, and team assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/meetings?schedule=true"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-card cursor-pointer"
          >
            <Plus size={16} />
            Schedule Meeting
          </Link>
        </div>
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Meetings Logged" value={stats.totalMeetings} icon={CalendarDays} />
        <StatCard title="Tasks To Do" value={stats.pendingTasks} icon={Clock} />
        <StatCard title="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} />
        <StatCard
          title="Completion Rate"
          value={`${stats.taskCompletionRate.toFixed(0)}%`}
          icon={TrendingUp}
          trend={stats.taskCompletionRate > 50 ? 'Above target' : 'Pending tasks'}
          trendType={stats.taskCompletionRate > 50 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Breakdown Doughnut */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-card flex flex-col md:col-span-1 h-96">
          <h3 className="font-semibold text-sm text-text mb-4">Task Status Breakdown</h3>
          <div className="flex-1 relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Team Productivity Bar */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-card flex flex-col md:col-span-2 h-96">
          <h3 className="font-semibold text-sm text-text mb-4">Team Productivity (Tasks per Member)</h3>
          <div className="flex-1 relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Meetings Section (Recent & Upcoming) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent logs */}
        <div className="bg-white border border-border rounded-xl shadow-card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-semibold text-sm text-text">Recent Meetings Logs</h3>
            <Link to="/meetings" className="text-xs text-accent font-semibold hover:underline flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            {stats.recentMeetings && stats.recentMeetings.length > 0 ? (
              stats.recentMeetings.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between group hover:bg-slate-50/50 rounded-lg px-2 transition-all">
                  <div className="space-y-1 overflow-hidden pr-4">
                    <Link to={`/meetings/${m.id}`} className="font-medium text-xs text-text hover:text-accent truncate block">
                      {m.title}
                    </Link>
                    <p className="text-[10px] text-secondary">
                      {new Date(m.date).toLocaleDateString()} at {m.time} • {m.department}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-success bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    ANALYZED
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-secondary-light">
                No recent meetings found. Upload transcripts to analyze.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming schedules */}
        <div className="bg-white border border-border rounded-xl shadow-card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-semibold text-sm text-text">Upcoming Meetings Schedules</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            {stats.upcomingMeetings && stats.upcomingMeetings.length > 0 ? (
              stats.upcomingMeetings.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded-lg px-2 transition-all">
                  <div className="space-y-1 overflow-hidden pr-4">
                    <p className="font-medium text-xs text-text truncate">{m.title}</p>
                    <p className="text-[10px] text-secondary">
                      Scheduled for {new Date(m.date).toLocaleDateString()} at {m.time}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-secondary bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                    {m.department}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-secondary-light">
                No upcoming meetings scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
