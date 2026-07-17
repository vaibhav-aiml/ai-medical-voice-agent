import React from 'react';

interface CrisisAlertProps {
  crisisType: string;
  resource: {
    type?: string;
    message?: string;
    hotline?: string;
    instruction?: string;
  };
  onClose: () => void;
}

const CrisisAlert: React.FC<CrisisAlertProps> = ({ crisisType, resource, onClose }) => {
  return (
    <div className="crisis-alert-overlay">
      <div className="crisis-alert-modal">
        <div className="crisis-icon">⚠️</div>
        <h2 className="crisis-title">Mental Health Support - India</h2>
        
        <div className="crisis-message">
          <p>We care about your safety. <strong>You are not alone.</strong></p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Free & Confidential Support Available 24/7</p>
        </div>

        {/* Primary National Helpline - Most prominent */}
        <div className="hotline-section">
          <div className="hotline-number-large">
            📞 <span className="hotline-digits">14416</span>
          </div>
          <div className="hotline-label">Tele-MANAS</div>
          <div className="hotline-availability">National Mental Health Helpline | 24/7 | Free</div>
          <div className="hotline-alt-number">Toll Free: 1-800-891-4416</div>
        </div>

        {/* Secondary Helplines Grid */}
        <div className="helpline-grid">
          <div className="helpline-card">
            <div className="helpline-number">📞 9820466728</div>
            <div className="helpline-name">AASRA</div>
            <div className="helpline-desc">Suicide Prevention & Emotional Support</div>
          </div>
          <div className="helpline-card">
            <div className="helpline-number">📞 9999 666 555</div>
            <div className="helpline-name">Vandrevala Foundation</div>
            <div className="helpline-desc">24/7 Crisis Intervention</div>
          </div>
          <div className="helpline-card">
            <div className="helpline-number">📞 78930-78930</div>
            <div className="helpline-name">One Life</div>
            <div className="helpline-desc">Suicide Prevention Helpline</div>
          </div>
          <div className="helpline-card">
            <div className="helpline-number">📞 8448-8448-45</div>
            <div className="helpline-name">iCALL / Fortis</div>
            <div className="helpline-desc">Psycho-social Support</div>
          </div>
          <div className="helpline-card">
            <div className="helpline-number">📞 1800-599-0019</div>
            <div className="helpline-name">KIRAN</div>
            <div className="helpline-desc">Mental Health Rehabilitation</div>
          </div>
          <div className="helpline-card">
            <div className="helpline-number">📞 080-46110007</div>
            <div className="helpline-name">NIMHANS</div>
            <div className="helpline-desc">Mental Health Support</div>
          </div>
        </div>

        <div className="crisis-instruction">
          <p>📢 <strong>Call 14416 (Tele-MANAS)</strong> for immediate, confidential mental health support.</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>For medical emergencies, call <strong>112</strong> (National Emergency Number)</p>
        </div>

        <button className="crisis-button" onClick={onClose}>
          I Understand, I'll Seek Help
        </button>
      </div>

      <style>{`
        .crisis-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
          padding: 16px;
          overflow-y: auto;
        }
        
        .crisis-alert-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 4px #ef4444;
          animation: slideUp 0.3s ease;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Custom Scrollbar */
        .crisis-alert-modal::-webkit-scrollbar {
          width: 6px;
        }
        
        .crisis-alert-modal::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        
        .crisis-alert-modal::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 3px;
        }
        
        .crisis-icon {
          font-size: 56px;
          margin-bottom: 12px;
          animation: pulse 1s ease-in-out infinite;
        }
        
        .crisis-title {
          color: #ef4444;
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: 1px;
        }
        
        .crisis-message {
          background: rgba(239, 68, 68, 0.15);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .crisis-message p {
          color: #fff;
          font-size: 16px;
          margin: 0;
        }
        
        .crisis-message strong {
          color: #ef4444;
        }
        
        /* Primary Hotline Section */
        .hotline-section {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        
        .hotline-number-large {
          font-size: 42px;
          font-weight: 800;
          color: white;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }
        
        .hotline-digits {
          font-size: 48px;
          font-weight: 900;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hotline-label {
          font-size: 16px;
          color: #fef08a;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .hotline-availability {
          font-size: 12px;
          color: #fca5a5;
        }
        
        .hotline-alt-number {
          font-size: 13px;
          color: #fed7aa;
          margin-top: 6px;
        }
        
        /* Helpline Grid */
        .helpline-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        
        .helpline-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px;
          text-align: center;
          transition: all 0.2s ease;
        }
        
        .helpline-card:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.02);
        }
        
        .helpline-number {
          color: #fef08a;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 4px;
        }
        
        .helpline-name {
          color: #fff;
          font-weight: 600;
          font-size: 13px;
        }
        
        .helpline-desc {
          color: #94a3b8;
          font-size: 10px;
        }
        
        .crisis-instruction {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        
        .crisis-instruction p {
          color: #cbd5e1;
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }
        
        .crisis-instruction strong {
          color: #ef4444;
        }
        
        .crisis-button {
          background: white;
          color: #dc2626;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.3s ease;
          width: 100%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .crisis-button:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
        }
        
        /* Responsive - Mobile */
        @media (max-width: 600px) {
          .crisis-alert-modal {
            padding: 16px;
          }
          
          .crisis-title {
            font-size: 20px;
          }
          
          .crisis-icon {
            font-size: 44px;
          }
          
          .hotline-number-large {
            font-size: 32px;
          }
          
          .hotline-digits {
            font-size: 36px;
          }
          
          .helpline-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .helpline-number {
            font-size: 12px;
          }
          
          .crisis-message p {
            font-size: 14px;
          }
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
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default CrisisAlert;