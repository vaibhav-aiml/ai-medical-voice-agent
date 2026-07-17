import React from 'react';

interface TriageResult {
  urgencyLevel: 'routine' | 'consult_48h' | 'consult_24h' | 'emergency_immediate';
  score: number;
  recommendation: string;
  riskFactors: string[];
  suggestedAction: string;
  requiresAmbulance: boolean;
  colorCode: 'green' | 'yellow' | 'orange' | 'red';
}

interface TriageDisplayProps {
  result: TriageResult;
  onClose: () => void;
}

const TriageDisplay: React.FC<TriageDisplayProps> = ({ result, onClose }) => {
  const getColorStyles = () => {
    switch (result.colorCode) {
      case 'red':
        return { 
          bg: '#dc2626', 
          light: '#fee2e2', 
          text: '#7f1d1d',
          border: '#ef4444',
          button: '#dc2626',
          buttonHover: '#b91c1c'
        };
      case 'orange':
        return { 
          bg: '#ea580c', 
          light: '#ffedd5', 
          text: '#7c2d12',
          border: '#f97316',
          button: '#ea580c',
          buttonHover: '#c2410c'
        };
      case 'yellow':
        return { 
          bg: '#ca8a04', 
          light: '#fef3c7', 
          text: '#713f12',
          border: '#eab308',
          button: '#ca8a04',
          buttonHover: '#a16207'
        };
      default:
        return { 
          bg: '#16a34a', 
          light: '#dcfce7', 
          text: '#14532d',
          border: '#22c55e',
          button: '#16a34a',
          buttonHover: '#15803d'
        };
    }
  };

  const colors = getColorStyles();

  // Format recommendation text to remove HTML/asterisk formatting
  const cleanText = (text: string) => {
    return text.replace(/\*\*/g, '').replace(/⚠️/g, '🚨');
  };

  return (
    <div className="triage-overlay">
      <div className="triage-modal" style={{ borderTop: `8px solid ${colors.bg}` }}>
        <div className="triage-header">
          <div className="triage-icon" style={{ background: colors.bg }}>
            {result.requiresAmbulance ? '🚨' : '🏥'}
          </div>
          <h2 style={{ color: colors.bg }}>Urgency Assessment Result</h2>
        </div>

        <div className="triage-score">
          <div className="score-circle" style={{ background: colors.bg }}>
            <span className="score-number">{result.score}</span>
            <span className="score-label">Urgency Score</span>
          </div>
          <div className="score-level" style={{ color: colors.bg }}>
            {result.urgencyLevel === 'emergency_immediate' && '🚨 EMERGENCY'}
            {result.urgencyLevel === 'consult_24h' && '🟠 URGENT - 24 Hours'}
            {result.urgencyLevel === 'consult_48h' && '🟡 SEE DOCTOR - 48 Hours'}
            {result.urgencyLevel === 'routine' && '🟢 ROUTINE - Monitor'}
          </div>
        </div>

        <div className="triage-recommendation" style={{ background: colors.light, borderLeft: `4px solid ${colors.bg}` }}>
          <p style={{ color: colors.text, fontSize: '16px', lineHeight: '1.6' }}>
            {cleanText(result.recommendation)}
          </p>
        </div>

        <div className="triage-action">
          <h3 style={{ color: '#1f2937' }}>📋 What You Should Do:</h3>
          <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.5' }}>
            {result.suggestedAction}
          </p>
        </div>

        {result.riskFactors && result.riskFactors.length > 0 && (
          <div className="triage-risk-factors">
            <h3 style={{ color: '#1f2937' }}>⚠️ Risk Factors Identified:</h3>
            <ul>
              {result.riskFactors.slice(0, 5).map((factor, idx) => (
                <li key={idx} style={{ color: '#4b5563' }}>{factor.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </div>
        )}

        {result.requiresAmbulance && (
          <div className="emergency-numbers">
            <h3 style={{ color: '#991b1b', marginBottom: '12px' }}>🚑 Emergency Contacts (India):</h3>
            <div className="emergency-grid">
              <div className="emergency-card">
                <span className="emergency-number">108</span>
                <span className="emergency-service">Ambulance</span>
              </div>
              <div className="emergency-card">
                <span className="emergency-number">112</span>
                <span className="emergency-service">National Emergency</span>
              </div>
              <div className="emergency-card">
                <span className="emergency-number">100</span>
                <span className="emergency-service">Police</span>
              </div>
              <div className="emergency-card">
                <span className="emergency-number">101</span>
                <span className="emergency-service">Fire</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '12px', textAlign: 'center' }}>
              📍 Call 108 immediately for an ambulance
            </p>
          </div>
        )}

        <button 
          className="triage-close-btn" 
          onClick={onClose}
          style={{ background: colors.button }}
          onMouseEnter={(e) => (e.currentTarget.style.background = colors.buttonHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = colors.button)}
        >
          I Understand, I'll Take Action
        </button>
      </div>

      <style>{`
        .triage-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          animation: fadeIn 0.3s ease;
          padding: 16px;
        }
        
        .triage-modal {
          background: white;
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 20px;
          animation: slideUp 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .triage-modal::-webkit-scrollbar {
          width: 6px;
        }
        
        .triage-modal::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .triage-modal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .triage-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .triage-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 12px;
          color: white;
        }
        
        .triage-header h2 {
          font-size: 24px;
          margin: 0;
          font-weight: 700;
        }
        
        .triage-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px 0;
        }
        
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .score-number {
          font-size: 48px;
          font-weight: 800;
        }
        
        .score-label {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .score-level {
          font-size: 16px;
          font-weight: 700;
          margin-top: 8px;
        }
        
        .triage-recommendation {
          padding: 16px;
          border-radius: 12px;
          margin: 16px 0;
        }
        
        .triage-recommendation p {
          margin: 0;
          font-weight: 500;
        }
        
        .triage-action, .triage-risk-factors {
          margin: 16px 0;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }
        
        .triage-action h3, .triage-risk-factors h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 700;
        }
        
        .triage-action p {
          margin: 0;
          line-height: 1.5;
        }
        
        .triage-risk-factors ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .triage-risk-factors li {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .emergency-numbers {
          margin: 16px 0;
          padding: 16px;
          background: #fee2e2;
          border-radius: 12px;
          border: 1px solid #fecaca;
        }
        
        .emergency-numbers h3 {
          color: #991b1b;
          font-size: 16px;
          font-weight: 700;
        }
        
        .emergency-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 12px;
        }
        
        .emergency-card {
          background: white;
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid #fecaca;
        }
        
        .emergency-number {
          font-size: 24px;
          font-weight: 800;
          color: #dc2626;
          display: block;
          font-family: monospace;
        }
        
        .emergency-service {
          font-size: 11px;
          color: #4b5563;
          margin-top: 4px;
          display: block;
        }
        
        .triage-close-btn {
          width: 100%;
          padding: 14px;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 600px) {
          .triage-modal {
            padding: 16px;
          }
          
          .score-circle {
            width: 100px;
            height: 100px;
          }
          
          .score-number {
            font-size: 36px;
          }
          
          .triage-header h2 {
            font-size: 20px;
          }
          
          .emergency-number {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default TriageDisplay;