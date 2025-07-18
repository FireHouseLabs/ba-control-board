
import React, { useState, useEffect } from 'react';

function calculateMinutesToEmpty(pressure) {
  // Use interpolation between reference points for more accurate calculation
  if (pressure >= 300) {
    return 34;
  }
  if (pressure >= 250) {
    // Interpolate between 250 bar (28 min) and 300 bar (34 min)
    const ratio = (pressure - 250) / (300 - 250);
    const minutes = 28 + ratio * (34 - 28);
    return Math.floor(minutes);
  }
  if (pressure >= 150) {
    // Interpolate between 150 bar (17 min) and 250 bar (28 min)
    const ratio = (pressure - 150) / (250 - 150);
    const minutes = 17 + ratio * (28 - 17);
    return Math.floor(minutes);
  }
  if (pressure >= 100) {
    // Interpolate between 100 bar (11 min) and 150 bar (17 min)
    const ratio = (pressure - 100) / (150 - 100);
    const minutes = 11 + ratio * (17 - 11);
    return Math.floor(minutes);
  }
  if (pressure >= 55) {
    // Interpolate between 55 bar (5 min) and 100 bar (11 min)
    const ratio = (pressure - 55) / (100 - 55);
    const minutes = 5 + ratio * (11 - 5);
    return Math.floor(minutes);
  }
  
  return 0; // Below operational pressure
}

function getStatusInfo(pressure, timeRemaining) {
  // First check if overdue
  if (timeRemaining === 'OVERDUE') return { 
    status: 'overdue', 
    color: 'bg-red-200', 
    style: { backgroundColor: '#fecaca' },
    label: 'OVERDUE - EXIT NOW' 
  };
  
  // Convert time remaining to minutes for comparison
  const timeToMinutes = (timeStr) => {
    if (timeStr === 'OVERDUE') return -1;
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes + (seconds / 60);
  };
  
  const remainingMinutes = timeToMinutes(timeRemaining);
  
  // Individual status based only on this operator's time remaining
  if (remainingMinutes <= 0) {
    return { 
      status: 'whistle', 
      color: 'bg-red-100', 
      style: { backgroundColor: '#fee2e2' },
      label: 'Whistle - EXIT NOW' 
    };
  }
  
  if (remainingMinutes <= 11) {
    return { 
      status: 'action', 
      color: 'bg-yellow-100', 
      style: { backgroundColor: '#fef3c7' },
      label: 'Action Time' 
    };
  }
  
  if (remainingMinutes <= 17) {
    return { 
      status: 'reassess', 
      color: 'bg-green-100', 
      style: { backgroundColor: '#dcfce7' },
      label: 'Reassess' 
    };
  }
  
  return { 
    status: 'working', 
    color: 'bg-green-100', 
    style: { backgroundColor: '#dcfce7' },
    label: 'Working Time' 
  };
}

function calculateWhistleTime(entryTime, minutesToEmpty) {
  const entryDate = new Date(entryTime);
  return new Date(entryDate.getTime() + (minutesToEmpty - 6) * 60000);
}

function formatTimeRemaining(ms) {
  if (ms <= 0) return 'OVERDUE';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function BAEntry({ entry, onRemove }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const whistleTime = calculateWhistleTime(entry.entryTime, entry.minutesToEmpty);
      const remainingMs = whistleTime - now;
      setTimeRemaining(formatTimeRemaining(remainingMs));
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [entry]);

  const statusInfo = getStatusInfo(entry.pressure, timeRemaining);

  return (
    <tr className="hover:bg-gray-50" style={statusInfo.style}>
      <td className="px-4 py-4 text-lg font-bold text-gray-900">BA {entry.teamNumber}</td>
      <td className="px-4 py-4 text-lg font-medium text-gray-900">{entry.name}</td>
      <td className="px-4 py-4 text-lg text-gray-900">{entry.pressure} bar</td>
      <td className="px-4 py-4 text-lg text-gray-900">{new Date(entry.entryTime).toLocaleTimeString()}</td>
      <td className="px-4 py-4 text-lg text-gray-900">{new Date(calculateWhistleTime(entry.entryTime, entry.minutesToEmpty)).toLocaleTimeString()}</td>
      <td className="px-4 py-4 text-2xl font-mono font-bold text-gray-900">{timeRemaining}</td>
      <td className="px-4 py-4">
        <span 
          className="inline-flex px-3 py-2 rounded-lg text-lg font-semibold"
          style={{
            backgroundColor: statusInfo.status === 'overdue' ? '#dc2626' :
                           statusInfo.status === 'whistle' ? '#ef4444' :
                           statusInfo.status === 'action' ? '#d97706' :
                           '#16a34a',
            color: 'white'
          }}
        >
          {statusInfo.label}
        </span>
      </td>
      <td className="px-4 py-4 text-lg text-gray-900">{entry.comments}</td>
      <td className="px-4 py-4">
        <button
          onClick={() => onRemove(entry)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          title="Remove from board"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

function BAEntryCard({ entry, onRemove }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const whistleTime = calculateWhistleTime(entry.entryTime, entry.minutesToEmpty);
      const remainingMs = whistleTime - now;
      setTimeRemaining(formatTimeRemaining(remainingMs));
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [entry]);

  const statusInfo = getStatusInfo(entry.pressure, timeRemaining);

  return (
    <div className="p-6" style={statusInfo.style}>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">BA {entry.teamNumber} - {entry.name}</h3>
            <p className="text-lg text-gray-600">Entry: {entry.pressure} bar</p>
          </div>
          <span 
            className="inline-flex px-4 py-2 rounded-lg text-lg font-semibold"
            style={{
              backgroundColor: statusInfo.status === 'overdue' ? '#dc2626' :
                             statusInfo.status === 'whistle' ? '#ef4444' :
                             statusInfo.status === 'action' ? '#d97706' :
                             '#16a34a',
              color: 'white'
            }}
          >
            {statusInfo.label}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-lg">
          <div>
            <span className="font-semibold text-gray-700">Entry:</span>
            <p className="text-gray-900">{new Date(entry.entryTime).toLocaleTimeString()}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Whistle:</span>
            <p className="text-gray-900">{new Date(calculateWhistleTime(entry.entryTime, entry.minutesToEmpty)).toLocaleTimeString()}</p>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-gray-700">Time Remaining:</span>
            <p className="text-3xl font-mono font-bold text-gray-900">{timeRemaining}</p>
          </div>
        </div>
        
        {entry.comments && (
          <div>
            <span className="font-semibold text-gray-700">Comments:</span>
            <p className="text-lg text-gray-900">{entry.comments}</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onRemove(entry)}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
          >
            Remove from Board
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BAControlBoard() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', pressure: '', entryTime: '', comments: '', teamNumber: '' });

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('ba-control-entries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error loading saved entries:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('ba-control-entries', JSON.stringify(entries));
  }, [entries]);

  function handleAddEntry(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name || !form.pressure || !form.entryTime) {
      return;
    }
    
    const pressure = parseInt(form.pressure);
    if (isNaN(pressure)) {
      return;
    }
    
    const minutesToEmpty = calculateMinutesToEmpty(pressure);
    
    // Create a proper date from today + the time input
    const today = new Date();
    const [hours, minutes] = form.entryTime.split(':');
    const entryDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
    
    const newEntry = {
      ...form,
      pressure,
      minutesToEmpty,
      entryTime: entryDateTime.toISOString(),
    };
    
    setEntries(prevEntries => [...prevEntries, newEntry]);
    setForm({ name: '', pressure: '', entryTime: '', comments: '', teamNumber: '' });
  }

  function handleClearBoard() {
    if (confirm('Are you sure you want to clear all entries? This action cannot be undone.')) {
      setEntries([]);
    }
  }

  function setCurrentTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format
    setForm({ ...form, entryTime: timeString });
  }

  function removeEntry(entryToRemove) {
    if (confirm(`Remove ${entryToRemove.name} from BA Team ${entryToRemove.teamNumber}?`)) {
      setEntries(prevEntries => prevEntries.filter(entry => 
        !(entry.name === entryToRemove.name && entry.entryTime === entryToRemove.entryTime)
      ));
    }
  }

  function getStatusPriority(entry) {
    // Higher numbers = higher priority (show at top)
    const priorityMap = {
      'overdue': 5,    // Critical - show first
      'whistle': 4,    // Urgent - show second
      'action': 3,     // Action needed - show third
      'reassess': 2,   // Monitor - show fourth
      'working': 1,    // Normal - show last
    };
    
    const now = new Date();
    const whistleTime = calculateWhistleTime(entry.entryTime, entry.minutesToEmpty);
    const remainingMs = whistleTime - now;
    const timeRemaining = formatTimeRemaining(remainingMs);
    const statusInfo = getStatusInfo(entry.pressure, timeRemaining);
    
    // Check if any team member is in action time or worse for sorting priority
    let teamPriority = 1; // Default
    if (entry.teamNumber) {
      const teamMembers = entries.filter(e => e.teamNumber === entry.teamNumber);
      
      for (const member of teamMembers) {
        const memberNow = new Date();
        const memberWhistleTime = calculateWhistleTime(member.entryTime, member.minutesToEmpty);
        const memberRemainingMs = memberWhistleTime - memberNow;
        const memberTimeRemaining = formatTimeRemaining(memberRemainingMs);
        const memberStatusInfo = getStatusInfo(member.pressure, memberTimeRemaining);
        
        const memberPriority = priorityMap[memberStatusInfo.status] || 1;
        if (memberPriority > teamPriority) {
          teamPriority = memberPriority;
        }
      }
    }
    
    const individualPriority = priorityMap[statusInfo.status] || 1;
    
    // Return the higher of individual or team priority
    return Math.max(individualPriority, teamPriority);
  }

  // Sort entries by priority (highest priority first)
  const sortedEntries = [...entries].sort((a, b) => {
    const priorityA = getStatusPriority(a);
    const priorityB = getStatusPriority(b);
    
    // If same priority, sort by time remaining (shortest first)
    if (priorityA === priorityB) {
      const now = new Date();
      const timeA = calculateWhistleTime(a.entryTime, a.minutesToEmpty) - now;
      const timeB = calculateWhistleTime(b.entryTime, b.minutesToEmpty) - now;
      return timeA - timeB;
    }
    
    return priorityB - priorityA; // Higher priority first
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                BA Control Board
              </h1>
              <p className="text-gray-600 text-lg">Breathing Apparatus Monitoring System</p>
            </div>
            {entries.length > 0 && (
              <button 
                onClick={handleClearBoard}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
              >
                Clear Board
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Entry</h2>
          <form onSubmit={handleAddEntry}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Firefighter Name
                </label>
                <input
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  BA Team
                </label>
                <input
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="e.g. 1, 2, 3"
                  type="number"
                  min="1"
                  max="20"
                  value={form.teamNumber}
                  onChange={e => setForm({ ...form, teamNumber: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pressure (bar)
                </label>
                <input
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="e.g. 300"
                  type="number"
                  min="0"
                  max="400"
                  value={form.pressure}
                  onChange={e => setForm({ ...form, pressure: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Entry Time
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    type="time"
                    value={form.entryTime}
                    onChange={e => setForm({ ...form, entryTime: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={setCurrentTime}
                    className="px-4 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                  >
                    Now
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comments
                </label>
                <input
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Optional notes"
                  value={form.comments}
                  onChange={e => setForm({ ...form, comments: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add Entry
              </button>
            </div>
          </form>
        </div>

        {/* Entries Table */}
        {entries.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">Active Entries</h2>
              <p className="text-sm text-gray-600 mt-1">Sorted by priority - Action/Whistle/Overdue shown first</p>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Team</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Entry Pressure</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Entry Time</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Whistle Time</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time Remaining</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Comments</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedEntries.map((entry, idx) => <BAEntry key={`${entry.name}-${entry.entryTime}`} entry={entry} onRemove={removeEntry} />)}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {sortedEntries.map((entry, idx) => <BAEntryCard key={`${entry.name}-${entry.entryTime}`} entry={entry} onRemove={removeEntry} />)}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Entries</h3>
            <p className="text-gray-500">Add firefighter entries using the form above to start monitoring.</p>
          </div>
        )}
      </div>
    </div>
  );
}
