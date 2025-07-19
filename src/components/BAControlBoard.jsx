
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
  // First check if overdue (past empty time)
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
  
  // Whistle time: 0.01-6 minutes remaining until exit time (6 minutes before empty)
  if (remainingMinutes > 0 && remainingMinutes <= 6) {
    return { 
      status: 'whistle', 
      color: 'bg-red-100', 
      style: { backgroundColor: '#fee2e2' },
      label: 'Whistle - EXIT NOW' 
    };
  }
  
  // Exactly 0 minutes remaining should be overdue (past whistle time)
  if (remainingMinutes <= 0) {
    return { 
      status: 'overdue', 
      color: 'bg-red-200', 
      style: { backgroundColor: '#fecaca' },
      label: 'OVERDUE - EXIT NOW' 
    };
  }
  
  // Action time: 6-11 minutes remaining
  if (remainingMinutes <= 11) {
    return { 
      status: 'action', 
      color: 'bg-yellow-100', 
      style: { backgroundColor: '#fef3c7' },
      label: 'Action Time' 
    };
  }
  
  // Reassess time: 11-17 minutes remaining  
  if (remainingMinutes <= 17) {
    return { 
      status: 'reassess', 
      color: 'bg-green-100', 
      style: { backgroundColor: '#dcfce7' },
      label: 'Reassess' 
    };
  }
  
  // Working time: 17+ minutes remaining
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
  const [stagedEntries, setStagedEntries] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ name: '', pressure: '', entryTime: '', comments: '', teamNumber: '' });
  const [alertedOperators, setAlertedOperators] = useState(new Set());

  // Load entries, staged entries and history from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('ba-control-entries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error loading saved entries:', error);
      }
    }
    
    const savedStagedEntries = localStorage.getItem('ba-control-staged');
    if (savedStagedEntries) {
      try {
        setStagedEntries(JSON.parse(savedStagedEntries));
      } catch (error) {
        console.error('Error loading saved staged entries:', error);
      }
    }
    
    const savedHistory = localStorage.getItem('ba-control-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading saved history:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('ba-control-entries', JSON.stringify(entries));
  }, [entries]);

  // Save staged entries to localStorage whenever staged entries change
  useEffect(() => {
    localStorage.setItem('ba-control-staged', JSON.stringify(stagedEntries));
  }, [stagedEntries]);

  // Save history to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('ba-control-history', JSON.stringify(history));
  }, [history]);

  // Monitor entries for critical time alerts
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      const newAlertedOperators = new Set(alertedOperators);
      
      entries.forEach(entry => {
        const operatorKey = `${entry.name}-${entry.entryTime}`;
        const whistleKey = `${operatorKey}-whistle`;
        const overdueKey = `${operatorKey}-overdue`;
        
        const whistleTime = calculateWhistleTime(entry.entryTime, entry.minutesToEmpty);
        const remainingMs = whistleTime - now;
        const timeRemaining = formatTimeRemaining(remainingMs);
        const statusInfo = getStatusInfo(entry.pressure, timeRemaining);
        
        // Check for whistle alert (only once per operator)
        if (statusInfo.status === 'whistle' && !alertedOperators.has(whistleKey)) {
          console.log(`Whistle alert triggered for ${entry.name}: timeRemaining=${timeRemaining}`);
          
          // Try to play audio alert first
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const playBeep = (frequency, delay = 0) => {
              setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = frequency;
                oscillator.type = 'square';
                gainNode.gain.value = 0.3;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
              }, delay);
            };
            playBeep(800, 0);
          } catch (error) {
            console.log('Audio alert not available:', error);
          }
          
          const alertMessage = `⚠️ WHISTLE TIME ALERT ⚠️\n\nBA Team ${entry.teamNumber} - ${entry.name}\nSTATUS: WHISTLE TIME\n\nEXIT NOW - 6 MINUTES TO EMPTY!`;
          setTimeout(() => {
            alert(alertMessage);
          }, 100);
          
          newAlertedOperators.add(whistleKey);
        }
        
        // Check for overdue alert (only once per operator)
        if (statusInfo.status === 'overdue' && !alertedOperators.has(overdueKey)) {
          console.log(`Overdue alert triggered for ${entry.name}: timeRemaining=${timeRemaining}`);
          
          // Try to play audio alert first
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play first beep immediately
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.frequency.value = 1000;
            osc1.type = 'square';
            gain1.gain.value = 0.3;
            osc1.start();
            osc1.stop(audioContext.currentTime + 0.5);
            
            // Schedule additional beeps
            setTimeout(() => {
              const osc2 = audioContext.createOscillator();
              const gain2 = audioContext.createGain();
              osc2.connect(gain2);
              gain2.connect(audioContext.destination);
              osc2.frequency.value = 1000;
              osc2.type = 'square';
              gain2.gain.value = 0.3;
              osc2.start();
              osc2.stop(audioContext.currentTime + 0.5);
            }, 600);
            
            setTimeout(() => {
              const osc3 = audioContext.createOscillator();
              const gain3 = audioContext.createGain();
              osc3.connect(gain3);
              gain3.connect(audioContext.destination);
              osc3.frequency.value = 1000;
              osc3.type = 'square';
              gain3.gain.value = 0.3;
              osc3.start();
              osc3.stop(audioContext.currentTime + 0.5);
            }, 1200);
          } catch (error) {
            console.log('Audio alert not available:', error);
          }
          
          const alertMessage = `🚨 CRITICAL ALERT 🚨\n\nBA Team ${entry.teamNumber} - ${entry.name}\nSTATUS: OVERDUE\n\nIMMEDIATE EXIT REQUIRED!`;
          setTimeout(() => {
            alert(alertMessage);
          }, 100);
          
          newAlertedOperators.add(overdueKey);
        }
      });
      
      // Update alerted operators if any new alerts were triggered
      if (newAlertedOperators.size !== alertedOperators.size) {
        setAlertedOperators(newAlertedOperators);
      }
    };

    // Check immediately and then every 10 seconds
    checkAlerts();
    const alertInterval = setInterval(checkAlerts, 10000);
    
    return () => clearInterval(alertInterval);
  }, [entries, alertedOperators]);

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

  function handleStageEntry(e) {
    e.preventDefault();
    
    // Validate required fields for staging (no entry time needed)
    if (!form.name || !form.pressure) {
      return;
    }
    
    const pressure = parseInt(form.pressure);
    if (isNaN(pressure)) {
      return;
    }
    
    const newStagedEntry = {
      name: form.name,
      pressure,
      teamNumber: form.teamNumber,
      comments: form.comments,
    };
    
    setStagedEntries(prevStaged => [...prevStaged, newStagedEntry]);
    setForm({ name: '', pressure: '', entryTime: '', comments: '', teamNumber: '' });
  }

  function handleClearBoard() {
    if (confirm('Are you sure you want to clear the entire board including staging and history? This action cannot be undone.')) {
      setEntries([]);
      setStagedEntries([]);
      setHistory([]);
      setAlertedOperators(new Set());
    }
  }

  function setCurrentTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format
    setForm({ ...form, entryTime: timeString });
  }

  function activateStagedEntry(stagedEntry) {
    if (confirm(`Activate ${stagedEntry.name} from BA Team ${stagedEntry.teamNumber}?`)) {
      const minutesToEmpty = calculateMinutesToEmpty(stagedEntry.pressure);
      
      // Create a proper date with current time
      const now = new Date();
      
      const newEntry = {
        ...stagedEntry,
        minutesToEmpty,
        entryTime: now.toISOString(),
      };
      
      setEntries(prevEntries => [...prevEntries, newEntry]);
      
      // Remove from staged entries
      setStagedEntries(prevStaged => prevStaged.filter(entry => 
        !(entry.name === stagedEntry.name && entry.teamNumber === stagedEntry.teamNumber)
      ));
    }
  }

  function removeStagedEntry(stagedEntry) {
    if (confirm(`Remove ${stagedEntry.name} from staging?`)) {
      setStagedEntries(prevStaged => prevStaged.filter(entry => 
        !(entry.name === stagedEntry.name && entry.teamNumber === stagedEntry.teamNumber)
      ));
    }
  }

  function removeEntry(entryToRemove) {
    if (confirm(`Remove ${entryToRemove.name} from BA Team ${entryToRemove.teamNumber}?`)) {
      // Add to history with exit time
      const exitTime = new Date().toISOString();
      const historyEntry = {
        ...entryToRemove,
        exitTime: exitTime
      };
      
      setHistory(prevHistory => [...prevHistory, historyEntry]);
      
      // Remove from active entries
      setEntries(prevEntries => prevEntries.filter(entry => 
        !(entry.name === entryToRemove.name && entry.entryTime === entryToRemove.entryTime)
      ));
      
      // Clear any alerts for this operator
      const operatorKey = `${entryToRemove.name}-${entryToRemove.entryTime}`;
      setAlertedOperators(prev => {
        const newSet = new Set(prev);
        newSet.delete(operatorKey);
        return newSet;
      });
    }
  }

  function downloadCSV() {
    if (history.length === 0) {
      alert('No operational history to download');
      return;
    }

    const headers = ['Team', 'Name', 'Entry Pressure (bar)', 'Entry Time', 'Exit Time', 'Duration (minutes)', 'Comments'];
    const csvData = [headers];

    history.forEach(entry => {
      const entryTime = new Date(entry.entryTime);
      const exitTime = new Date(entry.exitTime);
      const duration = Math.floor((exitTime - entryTime) / (1000 * 60));
      
      csvData.push([
        `BA ${entry.teamNumber}`,
        entry.name,
        entry.pressure,
        entryTime.toLocaleString(),
        exitTime.toLocaleString(),
        duration,
        entry.comments || ''
      ]);
    });

    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `BA_Operations_History_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadPDF() {
    if (history.length === 0) {
      alert('No operational history to download');
      return;
    }

    // Create a simple HTML document for PDF generation
    const timestamp = new Date().toLocaleString();
    const date = new Date().toISOString().split('T')[0];
    
    let htmlContent = `
      <html>
      <head>
        <title>BA Operations History</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header-info { margin-bottom: 20px; }
          .summary { margin-top: 20px; padding: 10px; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Breathing Apparatus Operations History</h1>
        <div class="header-info">
          <p><strong>Report Generated:</strong> ${timestamp}</p>
          <p><strong>Total Operations:</strong> ${history.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Name</th>
              <th>Entry Pressure</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
    `;

    history.forEach(entry => {
      const entryTime = new Date(entry.entryTime);
      const exitTime = new Date(entry.exitTime);
      const duration = Math.floor((exitTime - entryTime) / (1000 * 60));
      
      htmlContent += `
        <tr>
          <td>BA ${entry.teamNumber}</td>
          <td>${entry.name}</td>
          <td>${entry.pressure} bar</td>
          <td>${entryTime.toLocaleString()}</td>
          <td>${exitTime.toLocaleString()}</td>
          <td>${duration} min</td>
          <td>${entry.comments || ''}</td>
        </tr>
      `;
    });

    const totalDuration = history.reduce((total, entry) => {
      const entryTime = new Date(entry.entryTime);
      const exitTime = new Date(entry.exitTime);
      return total + Math.floor((exitTime - entryTime) / (1000 * 60));
    }, 0);

    htmlContent += `
          </tbody>
        </table>
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Personnel Operations:</strong> ${history.length}</p>
          <p><strong>Total Operational Time:</strong> ${totalDuration} minutes</p>
          <p><strong>Average Operation Duration:</strong> ${Math.round(totalDuration / history.length)} minutes</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing to PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.print();
    };
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

  // Sort entries by team grouping, then priority within teams
  const sortedEntries = [...entries].sort((a, b) => {
    // If both have team numbers, group teams together
    if (a.teamNumber && b.teamNumber) {
      if (a.teamNumber !== b.teamNumber) {
        // Different teams - sort by team's highest priority
        const teamAPriority = getStatusPriority(a);
        const teamBPriority = getStatusPriority(b);
        
        if (teamAPriority !== teamBPriority) {
          return teamBPriority - teamAPriority; // Higher priority team first
        }
        
        // Same team priority, sort by team's shortest time remaining
        const now = new Date();
        const teamATime = Math.min(...entries.filter(e => e.teamNumber === a.teamNumber)
          .map(e => calculateWhistleTime(e.entryTime, e.minutesToEmpty) - now));
        const teamBTime = Math.min(...entries.filter(e => e.teamNumber === b.teamNumber)
          .map(e => calculateWhistleTime(e.entryTime, e.minutesToEmpty) - now));
        return teamATime - teamBTime;
      } else {
        // Same team - sort by individual time remaining (shortest first)
        const now = new Date();
        const timeA = calculateWhistleTime(a.entryTime, a.minutesToEmpty) - now;
        const timeB = calculateWhistleTime(b.entryTime, b.minutesToEmpty) - now;
        return timeA - timeB;
      }
    }
    
    // Handle entries without team numbers or mixed scenarios
    const priorityA = getStatusPriority(a);
    const priorityB = getStatusPriority(b);
    
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
              <div className="flex items-center gap-2">
                <p className="text-gray-600 text-lg">Breathing Apparatus Monitoring System</p>
                <span className="text-gray-400">-</span>
                <a 
                  href="/about" 
                  className="text-red-600 hover:text-red-700 text-lg underline transition-colors"
                >
                  more info
                </a>
              </div>
            </div>
            {(entries.length > 0 || stagedEntries.length > 0 || history.length > 0) && (
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
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add Entry
              </button>
              <button 
                type="button"
                onClick={handleStageEntry}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-semibold text-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Stage Crew
              </button>
            </div>
          </form>
        </div>

        {/* Staged Entries Table */}
        {stagedEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 bg-orange-50 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">Staged Crews</h2>
              <p className="text-sm text-gray-600 mt-1">RIT and standby crews ready for deployment</p>
            </div>
            
            {/* Desktop Staging Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Team</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Pressure</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Comments</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stagedEntries.map((entry) => (
                    <tr key={`${entry.name}-${entry.teamNumber}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-lg font-bold text-gray-900">BA {entry.teamNumber}</td>
                      <td className="px-4 py-4 text-lg font-medium text-gray-900">{entry.name}</td>
                      <td className="px-4 py-4 text-lg text-gray-900">{entry.pressure} bar</td>
                      <td className="px-4 py-4 text-lg text-gray-900">{entry.comments}</td>
                      <td className="px-4 py-4 space-x-2">
                        <button
                          onClick={() => activateStagedEntry(entry)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                          title="Activate and start timing"
                        >
                          Enter
                        </button>
                        <button
                          onClick={() => removeStagedEntry(entry)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                          title="Remove from staging"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Staging Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {stagedEntries.map((entry) => (
                <div key={`${entry.name}-${entry.teamNumber}`} className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">BA {entry.teamNumber} - {entry.name}</h3>
                        <p className="text-lg text-gray-600">Pressure: {entry.pressure} bar</p>
                      </div>
                      <span className="inline-flex px-4 py-2 rounded-lg text-lg font-semibold bg-orange-600 text-white">
                        Staged
                      </span>
                    </div>
                    
                    {entry.comments && (
                      <div>
                        <span className="font-semibold text-gray-700">Comments:</span>
                        <p className="text-lg text-gray-900">{entry.comments}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      <button
                        onClick={() => activateStagedEntry(entry)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
                      >
                        Enter and Start Timing
                      </button>
                      <button
                        onClick={() => removeStagedEntry(entry)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
                      >
                        Remove from Staging
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <p className="text-gray-500">Add firefighter entries or stage crews using the form above to start monitoring.</p>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Operation History</h2>
                  <p className="text-sm text-gray-600 mt-1">Complete record of all BA entries and exits</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={downloadCSV}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                    title="Download as CSV file"
                  >
                    Download CSV
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                    title="Download as PDF report"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            
            {/* Desktop History Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Team</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Entry Pressure</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Entry Time</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Exit Time</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((entry, idx) => {
                    const entryTime = new Date(entry.entryTime);
                    const exitTime = new Date(entry.exitTime);
                    const duration = Math.floor((exitTime - entryTime) / (1000 * 60)); // Duration in minutes
                    
                    return (
                      <tr key={`${entry.name}-${entry.entryTime}`} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-lg font-bold text-gray-900">BA {entry.teamNumber}</td>
                        <td className="px-4 py-4 text-lg font-medium text-gray-900">{entry.name}</td>
                        <td className="px-4 py-4 text-lg text-gray-900">{entry.pressure} bar</td>
                        <td className="px-4 py-4 text-lg text-gray-900">{entryTime.toLocaleTimeString()}</td>
                        <td className="px-4 py-4 text-lg text-gray-900">{exitTime.toLocaleTimeString()}</td>
                        <td className="px-4 py-4 text-lg text-gray-900">{duration} min</td>
                        <td className="px-4 py-4 text-lg text-gray-900">{entry.comments}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile History Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {history.map((entry, idx) => {
                const entryTime = new Date(entry.entryTime);
                const exitTime = new Date(entry.exitTime);
                const duration = Math.floor((exitTime - entryTime) / (1000 * 60));
                
                return (
                  <div key={`${entry.name}-${entry.entryTime}`} className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">BA {entry.teamNumber} - {entry.name}</h3>
                          <p className="text-lg text-gray-600">Entry: {entry.pressure} bar</p>
                        </div>
                        <span className="inline-flex px-4 py-2 rounded-lg text-lg font-semibold bg-gray-600 text-white">
                          Exited
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-lg">
                        <div>
                          <span className="font-semibold text-gray-700">Entry:</span>
                          <p className="text-gray-900">{entryTime.toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Exit:</span>
                          <p className="text-gray-900">{exitTime.toLocaleTimeString()}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Duration:</span>
                          <p className="text-2xl font-mono font-bold text-gray-900">{duration} minutes</p>
                        </div>
                      </div>
                      
                      {entry.comments && (
                        <div>
                          <span className="font-semibold text-gray-700">Comments:</span>
                          <p className="text-lg text-gray-900">{entry.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
