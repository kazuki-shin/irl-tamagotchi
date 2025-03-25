import React, { useState, useEffect } from 'react';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: string;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon = '🏆',
}) => {
  const [visible, setVisible] = useState(false);
  const [animation, setAnimation] = useState('');
  
  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Delay setting the animation to trigger entrance animation
      setTimeout(() => {
        setAnimation('scale-100 opacity-100');
      }, 10);
    } else {
      setAnimation('scale-95 opacity-0');
      // Delay hiding the modal to allow exit animation to complete
      setTimeout(() => {
        setVisible(false);
      }, 200);
    }
  }, [isOpen]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          animation === 'scale-100 opacity-100' ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-200 ${animation}`}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Achievement content */}
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce inline-block">
            {icon}
          </div>
          
          <h2 className="text-2xl font-bold text-indigo-600 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Claim Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal; 