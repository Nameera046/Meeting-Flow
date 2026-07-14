import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CalendarDays, Users, FileText, Upload, Plus, X, Search, ChevronRight } from 'lucide-react';

const Meetings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State controls
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals visibility
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // New Meeting Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [agenda, setAgenda] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Transcript upload form
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Open modal if URL query specifies it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('schedule') === 'true') {
      setScheduleModalOpen(true);
    }
  }, [location]);

  // Load meetings & users
  const loadData = async () => {
    try {
      setLoading(true);
      const mResponse = await api.get('/meetings');
      setMeetings(mResponse.data);
      
      const uResponse = await api.get('/users');
      setUsers(uResponse.data);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        date,
        time,
        department,
        agenda,
        participantIds: selectedParticipants,
      };
      await api.post('/meetings', payload);
      setScheduleModalOpen(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setDepartment('Engineering');
      setAgenda('');
      setSelectedParticipants([]);

      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule meeting.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    try {
      setIsAnalyzing(true);
      await api.post(`/meetings/${selectedMeeting.id}/transcript`, { transcript });
      setUploadModalOpen(false);
      setTranscript('');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to upload and analyze transcript.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleParticipant = (userId) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredMeetings = deptFilter
    ? meetings.filter((m) => m.department?.toLowerCase() === deptFilter.toLowerCase())
    : meetings;

  const departments = ['Engineering', 'Product Management', 'Design', 'Marketing', 'Sales', 'HR'];

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Meetings Log</h2>
          <p className="text-sm text-secondary">Schedule team discussions, upload notes, and view AI analysis logs</p>
        </div>
        <button
          onClick={() => setScheduleModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-card cursor-pointer"
        >
          <Plus size={16} />
          Schedule Meeting
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setDeptFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            !deptFilter ? 'bg-accent border-accent text-white shadow-premium' : 'bg-white border-border text-secondary hover:border-slate-300'
          }`}
        >
          All Departments
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
              deptFilter === dept ? 'bg-accent border-accent text-white shadow-premium' : 'bg-white border-border text-secondary hover:border-slate-300'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Meetings Grid Container */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-secondary text-sm">Loading meeting schedule...</p>
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white border border-border rounded-xl p-5 shadow-card hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-secondary bg-slate-100 border border-border px-2 py-0.5 rounded-full uppercase">
                      {meeting.department}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        meeting.status === 'COMPLETED'
                          ? 'bg-green-50 text-success border-green-200'
                          : 'bg-teal-50 text-accent border-teal-200'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-text text-sm line-clamp-1">{meeting.title}</h3>
                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                      {meeting.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Meta details */}
                  <div className="space-y-2 text-xs text-secondary font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-secondary-light" />
                      <span>
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-secondary-light" />
                      <span>{meeting.participants?.length || 0} participants</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-5 border-t border-slate-50 mt-5 flex items-center gap-2">
                  {meeting.status === 'COMPLETED' ? (
                    <Link
                      to={`/meetings/${meeting.id}`}
                      className="flex-1 text-center bg-slate-50 border border-border hover:bg-slate-100 text-text py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      View Analysis
                      <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={`/meetings/${meeting.id}/room`}
                        className="flex-1 bg-accent hover:bg-accent-light text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-card text-center"
                      >
                        <Users size={14} />
                        Join Video Call
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setUploadModalOpen(true);
                        }}
                        className="px-3 bg-white border border-border hover:bg-slate-50 text-secondary py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Upload manual notes or transcript"
                      >
                        <Upload size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 border-2 border-dashed border-slate-200 bg-white rounded-xl text-center">
            <p className="text-sm text-secondary-light font-medium">No meetings scheduled for this category.</p>
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-border shadow-dropdown p-6 relative animate-fade-in max-h-[90vh] flex flex-col m-auto">
            <button
              onClick={() => setScheduleModalOpen(false)}
              className="absolute right-4 top-4 text-secondary-light hover:text-secondary cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-text mb-4 flex-shrink-0">Schedule Meeting</h3>
            
            <form onSubmit={handleScheduleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 max-h-[60vh] pb-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Q3 Architecture Alignments"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Description</label>
                  <textarea
                    placeholder="Short description of meeting scope..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Time</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Agenda</label>
                  <textarea
                    placeholder="1. Topic one&#10;2. Topic two..."
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent h-20"
                  />
                </div>

                {/* Participants multi-select */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider block">Add Participants</label>
                  <div className="border border-border rounded-lg p-3 max-h-28 overflow-y-auto space-y-1 bg-slate-50">
                    {users.map((u) => (
                      <label key={u.id} className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer hover:bg-slate-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(u.id)}
                          onChange={() => toggleParticipant(u.id)}
                          className="rounded border-border text-accent focus:ring-accent"
                        />
                        <span>{u.fullName} ({u.username})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex-shrink-0">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-card cursor-pointer"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Transcript Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-border shadow-dropdown p-6 relative animate-fade-in m-auto">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 text-secondary-light hover:text-secondary"
              disabled={isAnalyzing}
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-text mb-2">Upload Meeting Notes / Transcript</h3>
            <p className="text-xs text-secondary mb-4">
              Upload the complete dialog or brief summaries. MeetingFlow's processor will extract action items, summaries, and decisions.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Transcript Text / Notes</label>
                <textarea
                  required
                  placeholder="Paste meeting dialog or minutes here. Format like:&#10;Alice: We need to do X.&#10;Bob: I will handle Y."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-accent h-64 font-mono leading-relaxed"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 rounded-xl text-xs font-semibold text-secondary"
                  disabled={isAnalyzing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-card flex items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing Notes...
                    </>
                  ) : (
                    <>
                      <FileText size={14} />
                      Process & Analyze
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
