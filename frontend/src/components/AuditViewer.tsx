import React, { useState, useEffect } from 'react';
import { auditLogger, AuditLogEntry } from '../services/auditLogger';

const AuditViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Load logs (admin only)
    const loadLogs = async () => {
      const stored = localStorage.getItem('audit_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    };
    loadLogs();
  }, []);

  const exportLogs = () => {
    const csv = auditLogger.exportLogs('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => 
    log.userId.includes(filter) || 
    log.action.includes(filter) ||
    log.message.includes(filter)
  );

  return (
    <div className="audit-viewer">
      <h2>Audit Logs (Immutable Record)</h2>
      
      <div className="audit-controls">
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button onClick={exportLogs}>Export CSV</button>
      </div>
      
      <table className="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User ID</th>
            <th>Action</th>
            <th>Message</th>
            <th>Integrity</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => {
            const isValid = auditLogger.verifyIntegrity(log);
            return (
              <tr key={index} className={!isValid ? 'tampered' : ''}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.userId}</td>
                <td>{log.action}</td>
                <td>{log.message.substring(0, 100)}</td>
                <td>{isValid ? '✅ Verified' : '❌ TAMPERED'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <style>{`
        .audit-viewer {
          padding: 24px;
          background: white;
          border-radius: 12px;
        }
        
        .audit-controls {
          display: flex;
          gap: 16px;
          margin: 20px 0;
        }
        
        .audit-controls input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .audit-controls button {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .audit-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .audit-table th,
        .audit-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .audit-table th {
          background: #f8fafc;
          font-weight: 600;
        }
        
        .audit-table tr.tampered {
          background: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default AuditViewer;