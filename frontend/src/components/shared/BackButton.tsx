import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton: React.FC = () => {
  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <button 
      className="back-button" 
      onClick={goToHome}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#667eea',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <FaArrowLeft size={20} />
      Back to Home
    </button>
  );
};

export default BackButton;