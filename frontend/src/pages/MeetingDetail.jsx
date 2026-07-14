import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CalendarDays, Clock, Users, ChevronLeft, FileText, CheckSquare, ListPlus, ShieldAlert, Award } from 'lucide-react';

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analysis'); // Default tab

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meetings/${id}`);
      setMeeting(response.data);
    } catch (err) {
      setError('Meeting not found or failed to load details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary text-sm">Retrieving meeting logs...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 text-danger border border-red-200 p-4 rounded-xl text-center">
          {error || 'Meeting details could not be found.'}
        </div>
        <button onClick={() => navigate('/meetings')} className="text-accent hover:underline flex items-center gap-1">
          <ChevronLeft size={16} /> Back to meetings
        </button>
      </div>
    );
  }

  const parseBulletedList = (text) => {
    if (!text) return [];
    return text.split('\n')
      .map(item => item.replace(/^[-\s*+]+/, '').trim())
      .filter(item => item.length > 0);
  };

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/meetings')}
          className="text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1 bg-white border border-border px-3 py-1.5 rounded-lg shadow-card cursor-pointer"
        >
          <ChevronLeft size={14} /> Back to Meetings
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-text tracking-tight">{meeting.title}</h2>
          <span className="self-start text-[10px] font-bold text-success bg-green-50 border border-green-200 px-2 py-1 rounded-full uppercase tracking-wider">
            ANALYZED
          </span>
        </div>
      </div>

      {/* Grid Meta Details Header */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-card grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Department</span>
          <p className="text-sm font-semibold text-text">{meeting.department}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Date & Time</span>
          <p className="text-sm font-semibold text-text flex items-center gap-1.5">
            <CalendarDays size={14} className="text-secondary-light" />
            {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Organized By</span>
          <p className="text-sm font-semibold text-text">{meeting.createdBy?.fullName || 'System'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Participants</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex -space-x-2">
              {meeting.participants?.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  className="w-6 h-6 rounded-full bg-accent text-white border border-white flex items-center justify-center text-[10px] font-bold"
                  title={p.fullName}
                >
                  {p.fullName.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs font-semibold text-text">
              {meeting.participants?.length || 0} members
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex items-center gap-6">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'analysis'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          AI Analysis Results
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Details & Agenda
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'transcript'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Full Transcript
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'analysis' && meeting.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Col - Summary cards */}
            <div className="md:col-span-2 space-y-6">
              {/* Executive Summary */}
              <div className="bg-white border border-border p-6 rounded-xl shadow-card space-y-3">
                <h3 className="font-bold text-sm text-text flex items-center gap-2">
                  <Award size={18} className="text-accent" />
                  Executive Summary
                </h3>
                <p className="text-sm text-secondary leading-relaxed font-normal">
                  {meeting.summary.executiveSummary}
                </p>
              </div>

              {/* Discussion points and Decisions side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Discussion Points */}
                <div className="bg-white border border-border p-6 rounded-xl shadow-card space-y-3">
                  <h4 className="font-bold text-sm text-text flex items-center gap-2">
                    <ListPlus size={18} className="text-accent" />
                    Key Discussion Points
                  </h4>
                  <ul className="space-y-2.5">
                    {parseBulletedList(meeting.summary.keyDiscussionPoints).map((dp, idx) => (
                      <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{dp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decisions */}
                <div className="bg-white border border-border p-6 rounded-xl shadow-card space-y-3">
                  <h4 className="font-bold text-sm text-text flex items-center gap-2">
                    <CheckSquare size={18} className="text-accent" />
                    Decisions Made
                  </h4>
                  <ul className="space-y-2.5">
                    {parseBulletedList(meeting.summary.decisionsMade).map((dec, idx) => (
                      <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed font-medium text-text">{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white border border-border rounded-xl shadow-card p-6 space-y-4">
                <h3 className="font-bold text-sm text-text">Extracted Action Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-slate-50">
                        <th className="px-4 py-3 font-semibold text-secondary uppercase tracking-wider">Action description</th>
                        <th className="px-4 py-3 font-semibold text-secondary uppercase tracking-wider">Assigned to</th>
                        <th className="px-4 py-3 font-semibold text-secondary uppercase tracking-wider">Due date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {meeting.actionItems && meeting.actionItems.length > 0 ? (
                        meeting.actionItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-text font-medium leading-relaxed">{item.description}</td>
                            <td className="px-4 py-3 text-secondary font-medium">
                              {item.assignedTo ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[9px]">
                                    {item.assignedTo.fullName.charAt(0)}
                                  </div>
                                  <span>{item.assignedTo.fullName}</span>
                                </div>
                              ) : (
                                <span className="italic text-secondary-light">Unassigned</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-secondary font-medium">
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-6 text-center text-secondary-light italic bg-white">
                            No action items extracted from the transcript.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col - Risks and info */}
            <div className="space-y-6">
              {/* Risks and concerns */}
              <div className="bg-red-50/30 border border-red-200 p-6 rounded-xl shadow-card space-y-4">
                <h3 className="font-bold text-sm text-danger flex items-center gap-2">
                  <ShieldAlert size={18} />
                  Risks and Concerns
                </h3>
                <ul className="space-y-3">
                  {parseBulletedList(meeting.summary.risksConcerns).map((risk, idx) => (
                    <li key={idx} className="text-sm text-secondary-dark flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action sync notification */}
              <div className="bg-slate-50 p-6 rounded-xl border border-border space-y-2 text-xs text-secondary leading-relaxed">
                <p className="font-semibold text-text">Sync Status</p>
                <p>All extracted action items have been mapped to tracking tasks in the tasks center automatically.</p>
                <Link to="/tasks" className="text-accent font-semibold hover:underline block pt-1">
                  Go to Task Board →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Details & Agenda */}
        {activeTab === 'details' && (
          <div className="bg-white border border-border p-6 rounded-xl shadow-card space-y-6 max-w-3xl">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-text uppercase tracking-wider text-secondary-light">Description</h3>
              <p className="text-sm text-text leading-relaxed font-normal">{meeting.description || 'No description provided.'}</p>
            </div>
            
            <div className="border-t border-border pt-6 space-y-2">
              <h3 className="font-semibold text-sm text-text uppercase tracking-wider text-secondary-light">Original Meeting Agenda</h3>
              {meeting.agenda ? (
                <div className="text-sm text-text font-normal leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-border font-sans">
                  {meeting.agenda}
                </div>
              ) : (
                <p className="text-sm text-secondary italic">No agenda specified.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Transcript */}
        {activeTab === 'transcript' && (
          <div className="bg-white border border-border p-6 rounded-xl shadow-card max-w-4xl space-y-4">
            <h3 className="font-semibold text-sm text-text uppercase tracking-wider text-secondary-light flex items-center gap-2">
              <FileText size={16} />
              Meeting Transcript / Notes
            </h3>
            <div className="text-sm text-text font-mono leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-xl border border-border overflow-y-auto max-h-[600px]">
              {meeting.transcript || 'No transcript was uploaded for this meeting.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;
