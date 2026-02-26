import React, { useState, useEffect, useRef } from 'react';
import './TruthFlashback.css';

const TruthFlashback = ({ title, content, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textRef = useRef(null);
  const timerRef = useRef(null);
  
  // Speed of typing in ms
  const typingSpeed = 80; // Faster speed 

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayedText(content.substring(0, index + 1));
      index++;
      
      // Auto scroll to bottom
      if (textRef.current) {
        textRef.current.scrollTop = textRef.current.scrollHeight;
      }

      if (index >= content.length) {
        setIsTyping(false);
        clearInterval(timerRef.current);
      }
    }, typingSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [content]);

  const handleSkip = () => {
    if (isTyping) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(content);
      setIsTyping(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="truth-flashback-overlay" onClick={handleSkip}>
      <div className="truth-flashback-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="truth-title">{title}</h2>
        <div className="truth-content" ref={textRef}>
          {displayedText}
          <span className="cursor">|</span>
        </div>
        <div className="truth-footer">
          <button className="truth-action-btn" onClick={handleSkip}>
            {isTyping ? '跳过 / 显示全部' : '关闭回忆'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruthFlashback;
