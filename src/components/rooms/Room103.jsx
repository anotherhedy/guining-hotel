import React, { useState } from 'react';
import cluesData from '../../assets/clues.json';
import './Room103.css';

const Room103 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const [activeClueId, setActiveClueId] = useState(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [phoneApp, setPhoneApp] = useState(null); // 'chat' or 'moments'
  const [paintingFlipped, setPaintingFlipped] = useState(false);

  const room103Clues = cluesData.room103.collectable;
  const uncollectableClues = cluesData.room103.uncollectable;

  const isCollected = (id) => inventory.some(item => item.id === id);
  const isHiddenUnlocked = (id) => unlockedHiddenIds.includes(id);

  const handleClueClick = (e, clueId) => {
    e.stopPropagation();
    const clue = room103Clues.find(c => c.clueId === clueId);
    
    if (isCollected(clueId)) {
      if (clue) {
        onShowDetail({
          id: clue.clueId,
          content: clue.clueDesc,
          title: clue.clueName
        });
      }
    } else {
      setActiveClueId(activeClueId === clueId ? null : clueId);
    }
  };

  const handleLabelClick = (e, clue) => {
    e.stopPropagation();
    onCollect(clue);
    setActiveClueId(null);
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    setIsPhoneOpen(true);
    setPhoneApp(null);
  };

  const handlePhoneAppClick = (e, app) => {
    e.stopPropagation();
    setPhoneApp(app);
  };

  const handlePaintingClick = (e) => {
    e.stopPropagation();
    setPaintingFlipped(!paintingFlipped);
    // Also trigger clue interaction if it's the collectible one
    handleClueClick(e, '10302');
  };

  const getUncollectableContent = (id) => {
    const clue = uncollectableClues.find(c => c.clueId === id);
    return clue ? clue.clueDesc : '';
  };

  return (
    <div className="room103-container" onClick={() => { setActiveClueId(null); setIsPhoneOpen(false); }}>
      <button className="room103-back" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room103-content">
        {/* Left Zone: Window & Door */}
        <div className="room103-zone-left">
          <div 
            className={`room103-doorwin room103-clue ${isCollected('10301') ? 'collected' : 'collectable'}`}
            onClick={(e) => handleClueClick(e, '10301')}
          >
            <div className="room103-window">
              <div className="room103-window-dust"></div>
            </div>
            {activeClueId === '10301' && (
              <div className="room103-collect-tag" onClick={(e) => handleLabelClick(e, room103Clues.find(c => c.clueId === '10301'))}>
                【可收集】
              </div>
            )}
          </div>
        </div>

        {/* Middle Zone: Desk, Easel, Wall */}
        <div className="room103-zone-middle">
          {/* Wall Paintings */}
          <div className="room103-wall">
            <div className="room103-wall-texture"></div>
            {/* Decor paintings */}
            <div className="room103-painting"></div>
            <div className="room103-painting"></div>
            
            {/* Collectible Painting (Flippable) */}
            <div 
              className={`room103-painting room103-painting-flippable room103-clue ${isCollected('10302') ? 'collected' : 'collectable'} ${paintingFlipped ? 'flipped' : ''}`}
              onClick={handlePaintingClick}
            >
              <div className="room103-painting-front"></div>
              <div className="room103-painting-back">
                这家山上的旅馆跟我的作品主题很契合...
              </div>
              {activeClueId === '10302' && !paintingFlipped && (
                 // Tag visible when not flipped or maybe when flipped? User logic might vary.
                 // Let's show it if active.
                 <div className="room103-collect-tag" onClick={(e) => handleLabelClick(e, room103Clues.find(c => c.clueId === '10302'))}>
                  【可收集】
                </div>
              )}
               {activeClueId === '10302' && paintingFlipped && (
                 <div className="room103-collect-tag" style={{left: '110%'}} onClick={(e) => handleLabelClick(e, room103Clues.find(c => c.clueId === '10302'))}>
                  【可收集】
                </div>
              )}
            </div>
            
            <div className="room103-painting"></div>
          </div>

          {/* Easel */}
          <div className="room103-easel">
            <div className="room103-easel-stand"></div>
            <div className="room103-canvas"></div>
          </div>

          {/* Desk */}
          <div className="room103-desk">
            <div className="room103-palette">
              <div className="room103-paint-blob room103-paint-red"></div>
              <div className="room103-paint-blob room103-paint-green"></div>
              <div className="room103-paint-blob room103-paint-blue"></div>
              <div className="room103-paint-blob room103-paint-yellow"></div>
            </div>
            
            <div className="room103-brushes">
              <div className="room103-brush"></div>
              <div className="room103-brush"></div>
              <div className="room103-brush"></div>
            </div>

            {/* Hidden Turpentine */}
            <div 
              className={`room103-turpentine room103-clue ${isHiddenUnlocked('10303') ? 'visible' : ''} ${isCollected('10303') ? 'collected' : 'collectable'}`}
              onClick={(e) => isHiddenUnlocked('10303') && handleClueClick(e, '10303')}
              style={{ display: isHiddenUnlocked('10303') ? 'block' : 'none' }}
            >
               {activeClueId === '10303' && (
                <div className="room103-collect-tag" onClick={(e) => handleLabelClick(e, room103Clues.find(c => c.clueId === '10303'))}>
                  【可收集】
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="room103-phone" onClick={handlePhoneClick}>
              <div className="room103-phone-screen"></div>
            </div>
          </div>
        </div>

        {/* Right Zone: Bed, Box */}
        <div className="room103-zone-right">
          <div className="room103-bed">
            <div className="room103-bed-mattress"></div>
          </div>
          
          <div className="room103-box">
             <div className="room103-box-lid"></div>
          </div>
        </div>
      </div>

      {/* Phone Overlay */}
      {isPhoneOpen && (
        <div className="room103-phone-ui" onClick={(e) => e.stopPropagation()}>
          <button className="room103-phone-close" onClick={() => setIsPhoneOpen(false)}>×</button>
          
          {!phoneApp ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '50px' }}>
              <div className="room103-app-icon room103-app-chat" onClick={(e) => handlePhoneAppClick(e, 'chat')}>
                <span style={{color: 'white', fontWeight: 'bold'}}>WeChat</span>
              </div>
              <div className="room103-app-icon room103-app-moments" onClick={(e) => handlePhoneAppClick(e, 'moments')}>
                <span style={{fontWeight: 'bold'}}>Moments</span>
              </div>
            </div>
          ) : (
            <div className="room103-phone-content">
              <button onClick={() => setPhoneApp(null)} style={{ marginBottom: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                &lt; Back
              </button>
              <div style={{ color: '#ccc', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                {phoneApp === 'chat' ? getUncollectableContent('10304') : getUncollectableContent('10305')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Room103;
