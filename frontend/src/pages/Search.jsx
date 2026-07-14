import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { CalendarDays, CheckSquare, ListTodo, HelpCircle, ChevronRight, Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const location = useLocation();
  const getQuery = () => new URLSearchParams(location.search).get('q') || '';
  const query = getQuery();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    if (!query) return;
    try {
      setLoading(true);
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (err) {
      setError('Search query failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary text-sm">Searching records for "{query}"...</p>
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

  const hasMeetings = results?.meetings && results.meetings.length > 0;
  const hasTasks = results?.tasks && results.tasks.length > 0;
  const hasActionItems = results?.actionItems && results.actionItems.length > 0;
  const hasDecisions = results?.decisions && results.decisions.length > 0;
  const hasAnyResults = hasMeetings || hasTasks || hasActionItems || hasDecisions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2">
          <SearchIcon size={24} className="text-accent" />
          Search Results
        </h2>
        <p className="text-sm text-secondary">
          Displaying matches for: <span className="font-semibold text-text">"{query}"</span>
        </p>
      </div>

      {hasAnyResults ? (
        <div className="space-y-8">
          {/* Meetings Section */}
          {hasMeetings && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-text flex items-center gap-2 border-b border-border pb-2">
                <CalendarDays size={18} className="text-accent" />
                Meetings Matches ({results.meetings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.meetings.map((m) => (
                  <div key={m.id} className="bg-white border border-border rounded-xl p-5 shadow-card hover:border-slate-300 transition-colors flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-secondary bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                        {m.department}
                      </span>
                      <h4 className="font-bold text-sm text-text">{m.title}</h4>
                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {m.description || 'No description provided.'}
                      </p>
                    </div>
                    <Link
                      to={`/meetings/${m.id}`}
                      className="mt-4 text-xs font-semibold text-accent hover:underline flex items-center gap-0.5 self-start"
                    >
                      View meeting analysis <ChevronRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {hasTasks && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-text flex items-center gap-2 border-b border-border pb-2">
                <CheckSquare size={18} className="text-accent" />
                Tasks Matches ({results.tasks.length})
              </h3>
              <div className="table-container">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border text-xs text-secondary uppercase font-semibold">
                      <th className="px-6 py-3">Task Name</th>
                      <th className="px-6 py-3">Assignee</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {results.tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-text">{t.name}</td>
                        <td className="px-6 py-4 text-secondary">
                          {t.assignee ? t.assignee.fullName : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            t.status === 'COMPLETED' ? 'bg-green-50 text-success border-green-200' : 'bg-slate-50 text-secondary border-slate-200'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Decisions Section */}
          {hasDecisions && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-text flex items-center gap-2 border-b border-border pb-2">
                <ListTodo size={18} className="text-accent" />
                Decisions Made Matches ({results.decisions.length})
              </h3>
              <div className="bg-white border border-border rounded-xl shadow-card p-6">
                <ul className="space-y-3">
                  {results.decisions.map((dec, idx) => (
                    <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed font-medium text-text">{dec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Items Section */}
          {hasActionItems && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-text flex items-center gap-2 border-b border-border pb-2">
                <HelpCircle size={18} className="text-accent" />
                Action Items Matches ({results.actionItems.length})
              </h3>
              <div className="bg-white border border-border rounded-xl shadow-card p-6">
                <ul className="space-y-3">
                  {results.actionItems.map((item) => (
                    <li key={item.id} className="text-sm text-secondary flex items-start gap-2 justify-between">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{item.description}</span>
                      </div>
                      <span className="text-xs text-secondary-light">
                        Assigned to: {item.assignedTo ? item.assignedTo.fullName : 'Unassigned'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 bg-white rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-secondary">No matches found for "{query}"</p>
          <p className="text-xs text-secondary-light">Try searching for meeting keywords, departments, user names, or task status.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
