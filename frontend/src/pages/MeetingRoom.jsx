import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { PhoneOff, Mic, MicOff, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';

const MeetingRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Transcript & speech Recognition state
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Load meeting metadata
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await api.get(`/meetings/${id}`);
        setMeeting(response.data);
      } catch (err) {
        setError('Failed to load meeting details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  // Load Jitsi Iframe & Speech Recognition
  useEffect(() => {
    if (!loading && meeting && !error) {
      // 1. Initialize Jitsi Meet Iframe
      if (window.JitsiMeetExternalAPI) {
        const domain = 'meet.ffmuc.net';
        const options = {
          roomName: `MeetingFlow_Room_${meeting.id}_${meeting.title.replace(/[^a-zA-Z0-9]+/g, '_')}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting',
              'fullscreen', 'fodeviceselection', 'hangup', 'profile', 'chat',
              'recording', 'livestreaming', 'etherpad', 'sharedvideo', 'settings',
              'raisehand', 'videoquality', 'filmstrip', 'invite', 'feedback',
              'stats', 'shortcuts', 'tileview', 'select-background', 'download',
              'help', 'mute-everyone', 'mute-video-everyone', 'security'
            ],
          },
          userInfo: {
            displayName: user?.fullName || 'User',
            email: user?.email || '',
          }
        };

        const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = apiInstance;

        // Automatically clean up when Jitsi call ends from iframe
        apiInstance.addEventListener('readyToClose', () => {
          handleEndMeeting();
        });
      } else {
        console.error('Jitsi Meet External API script not loaded');
      }

      // 2. Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsTranscribing(true);
        };

        rec.onresult = (event) => {
          const latestResult = event.results[event.results.length - 1][0].transcript;
          const speakerPrefix = user?.fullName ? `${user.fullName}: ` : 'Speaker: ';
          setTranscript((prev) => {
            const separator = prev ? '\n' : '';
            return `${prev}${separator}${speakerPrefix}${latestResult.trim()}`;
          });
        };

        rec.onerror = (e) => {
          console.error('Speech recognition error', e);
        };

        rec.onend = () => {
          // If we are supposed to be transcribing, restart the listener automatically
          if (isListeningRef.current) {
            try {
              rec.start();
            } catch (err) {
              console.error('Failed to restart speech recognition', err);
            }
          } else {
            setIsTranscribing(false);
          }
        };

        recognitionRef.current = rec;
        
        // Start transcribing automatically
        isListeningRef.current = true;
        rec.start();
      } else {
        console.warn('Speech Recognition not supported in this browser.');
      }
    }

    return () => {
      // Cleanup Jitsi Meet and Speech listeners
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [loading, meeting]);

  const toggleTranscription = () => {
    if (!recognitionRef.current) {
      alert('Speech transcription is not supported in this browser. Try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsTranscribing(false);
    } else {
      isListeningRef.current = true;
      recognitionRef.current.start();
      setIsTranscribing(true);
    }
  };

  const handleEndMeeting = async () => {
    setIsUploading(true);
    isListeningRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      // Upload accumulated transcript
      const finalTranscript = transcript.trim() || `No verbal dialogue was captured.\n\nMeeting Summary Note:\nMeeting title: ${meeting.title}\nAgenda: ${meeting.agenda}`;
      await api.post(`/meetings/${id}/transcript`, { transcript: finalTranscript });
      
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      
      // Redirect to Meeting details view
      navigate(`/meetings/${id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to process and analyze meeting transcript.');
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <Loader2 size={36} className="animate-spin text-accent" />
        <p className="text-sm font-medium">Entering meeting room...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 space-y-4 text-white">
        <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm px-6 py-4 rounded-xl max-w-md text-center">
          {error || 'Failed to initialize meeting session.'}
        </div>
        <button onClick={() => navigate('/meetings')} className="text-accent hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Back to meetings list
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50 overflow-hidden font-sans">
      {/* Room Header bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Leave call? Transcript progress will be discarded.')) {
                navigate('/meetings');
              }
            }}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
            title="Leave Call"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-white text-sm font-bold leading-tight truncate max-w-md">{meeting.title}</h2>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              {meeting.department} Call Room
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Transcription toggle */}
          <button
            onClick={toggleTranscription}
            className={`px-2 py-1.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border cursor-pointer ${
              isTranscribing
                ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isTranscribing ? 'Mute speech translation' : 'Enable live speech translation'}
          >
            {isTranscribing ? <Mic size={14} /> : <MicOff size={14} />}
            <span className="hidden sm:inline">{isTranscribing ? 'Live Transcription Active' : 'Transcription Muted'}</span>
            <span className="sm:hidden">{isTranscribing ? 'Live' : 'Muted'}</span>
          </button>

          {/* End meeting button */}
          <button
            onClick={handleEndMeeting}
            disabled={isUploading}
            className="bg-danger hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-card disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <PhoneOff size={14} />
                <span className="hidden sm:inline">End & Analyze Meeting</span>
                <span className="sm:hidden">End</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main splits screen */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Jitsi Iframe Video Feed */}
        <div className="flex-1 h-[45vh] md:h-full bg-slate-900 p-2 flex flex-col">
          <div ref={jitsiContainerRef} className="w-full flex-1 rounded-xl overflow-hidden bg-slate-950 min-h-[300px] md:min-h-0">
            {/* Jitsi Meet will inject its video iframe here */}
          </div>
        </div>

        {/* Right Live Transcript Log Sidebar */}
        <div className="w-full md:w-80 h-[45vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between flex-shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 text-white">
            <MessageSquare size={16} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider">Live Transcript / Notes Log</span>
          </div>

          {/* Real-time preview */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs leading-relaxed text-slate-300">
            {transcript ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Live transcription will appear here. You can manually edit or write notes here as well."
                className="w-full h-full bg-transparent text-slate-300 focus:outline-none resize-none scrollbar-thin border-0"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-1.5 px-4">
                <Mic size={20} className="text-slate-600 animate-pulse" />
                <p className="text-[10px] font-semibold leading-relaxed">
                  Speech recognition will listen to your microphone and transcribing log will appear here in real-time.
                </p>
              </div>
            )}
          </div>

          {/* Assistant Info block */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-400 space-y-1 leading-relaxed">
            <p className="font-semibold text-slate-300">Automated Task Assignment</p>
            <p>
              When you click "End", this log is sent directly to the server to extract action items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
