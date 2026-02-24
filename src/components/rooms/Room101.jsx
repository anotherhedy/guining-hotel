import React, { useState, useEffect } from 'react';
import cluesData from '../../assets/clues.json';
import './Room101.css';

const Room101 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const [activeClueId, setActiveClueId] = useState(null);
  const [drawersOpen, setDrawersOpen] = useState({ 1: false, 2: false, 3: false, 4: false });
  const [pillowMoved, setPillowMoved] = useState(false);
  const [computerOn, setComputerOn] = useState(false);

  // Helper to find clue by ID from Room 101 or 203 (for newspaper)
  const findClue = (id) => {
    let clue = cluesData.room101.collectable.find(c => c.clueId === id);
    if (!clue) clue = cluesData.room101.uncollectable.find(c => c.clueId === id);
    return clue;
  };

  const isCollected = (id) => inventory.some(item => item.id === id);
  const isVisible = (clue) => !clue.isHidden || unlockedHiddenIds.includes(clue.clueId);

  // Handlers
  const toggleDrawer = (e, drawerId) => {
    e.stopPropagation();
    setDrawersOpen(prev => ({ ...prev, [drawerId]: !prev[drawerId] }));
    setActiveClueId(null); // Close any active collect tag
  };

  const togglePillow = (e) => {
    e.stopPropagation();
    setPillowMoved(!pillowMoved);
    setActiveClueId(null);
  };

  const toggleComputer = (e) => {
    e.stopPropagation();
    setComputerOn(!computerOn);
    // If turning on, maybe unlock the clue if it's the monitor footage
    if (!computerOn) {
        // The clue logic for monitor is handled by clicking the screen usually, 
        // but here clicking computer toggles screen. 
        // We'll let the user click the screen to see the clue.
    }
  };

  const handleClueClick = (e, clueId, isCollectable) => {
    e.stopPropagation();
    const clue = findClue(clueId);
    if (!clue) return;

    if (!isVisible(clue)) return;

    // If uncollectable, show detail immediately
    if (!isCollectable) {
      onShowDetail({
        id: clue.clueId,
        content: clue.clueDesc,
        title: clue.clueName
      });
      return;
    }

    // If already collected, show detail
    if (isCollected(clueId)) {
      onShowDetail({
        id: clue.clueId,
        content: clue.clueDesc,
        title: clue.clueName
      });
      return;
    }

    // Toggle collect tag
    setActiveClueId(activeClueId === clueId ? null : clueId);
  };

  const handleCollect = (e, clueId) => {
    e.stopPropagation();
    const clue = findClue(clueId);
    if (clue) {
      onCollect(clue);
      setActiveClueId(null);
    }
  };

  const handleBgClick = () => {
    setActiveClueId(null);
  };

  // Clue Definitions (Mapped to visual elements)
  // Drawer 1: 10101 (203 Newspaper) - Special
  // Drawer 2: 10106 (Medical)
  // Drawer 3: 10109 (Hukou) - Uncollectable
  // Drawer 4: 10111 (Record) - Uncollectable
  // Box: 10102 (Ledger)
  // Computer: 10107 (Monitor)
  // Pillow: 10103 (Diary 1), 10108 (Diary 2 - Hidden)
  // Wall: 10110 (License)

  return (
    <div className="room101-container" onClick={handleBgClick}>
      <button className="room101-back" onClick={onReturn}>
        ← 返回旅馆
      </button>

      {/* Left Zone: Desk */}
      <div className="room101-zone-left">
        <div className="room101-desk">
            
            {/* Drawers */}
            <div className="room101-drawers">
                {/* Drawer 1: Newspaper */}
                <div className={`room101-drawer ${drawersOpen[1] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 1)}>
                    <div className="room101-drawer-content">
                         {/* 203 Newspaper (10101) */}
                         <div 
                            className={`room101-clue room101-newspaper ${isCollected('10101') ? 'collected' : 'collectable'}`}
                            onClick={(e) => handleClueClick(e, '10101', true)}
                            title="203旧报纸"
                         >
                            {activeClueId === '10101' && (
                                <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10101')}>
                                    【可收集】
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                {/* Drawer 2: Medical Sheet */}
                <div className={`room101-drawer ${drawersOpen[2] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 2)}>
                    <div className="room101-drawer-content">
                        {/* 101 Medical (10106) */}
                        <div 
                            className={`room101-clue room101-medical ${isCollected('10106') ? 'collected' : 'collectable'}`}
                            onClick={(e) => handleClueClick(e, '10106', true)}
                            title="101诊疗单"
                         >
                            {activeClueId === '10106' && (
                                <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10106')}>
                                    【可收集】
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                {/* Drawer 3: Hukou (Uncollectable) - Bottom drawer usually, but let's follow order */}
                {/* User said "Bottom drawer (drawer 3)" then "Third drawer (drawer 4)". 
                    Actually user said:
                    4. Drawer 2
                    8. Bottom Drawer (Drawer 3) -> Hukou
                    9. Third Drawer (Drawer 4) -> Record
                    This numbering is slightly confusing. 
                    I'll assume visual order from top to bottom: 1, 2, 4, 3 (since 3 is called "bottom").
                    Or just 1, 2, 3, 4 and map names accordingly.
                    Let's assume:
                    Top: Drawer 1
                    Mid-Top: Drawer 2
                    Mid-Bottom: Drawer 4 (Record)
                    Bottom: Drawer 3 (Hukou)
                */}
                
                 {/* Drawer 4: Record (10111) */}
                 <div className={`room101-drawer ${drawersOpen[4] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 4)}>
                    <div className="room101-drawer-content">
                         {/* 101 Record (10111) - Uncollectable */}
                         <div 
                            className="room101-clue room101-record"
                            onClick={(e) => handleClueClick(e, '10111', false)}
                            title="101住户记录"
                         />
                    </div>
                </div>

                {/* Drawer 3: Hukou (10109) - Bottom */}
                <div className={`room101-drawer ${drawersOpen[3] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 3)}>
                    <div className="room101-drawer-content">
                         {/* 101 Hukou (10109) - Uncollectable */}
                         <div 
                            className="room101-clue room101-hukou"
                            onClick={(e) => handleClueClick(e, '10109', false)}
                            title="101户口本"
                         />
                    </div>
                </div>
            </div>

            {/* Computer */}
            <div className="room101-computer-area">
                <div className="room101-computer" onClick={toggleComputer}>
                    <div className="room101-screen">
                        {computerOn ? (
                             // 101 Monitor (10107)
                             <div 
                                className="room101-screen-content"
                                onClick={(e) => handleClueClick(e, '10107', true)}
                                title="101监控片段"
                             >
                                <div className="room101-monitor">
                                    REC [00:14:23]<br/>
                                    CAM 04 - CORRIDOR<br/>
                                    ...<br/>
                                    (点击查看详情)
                                </div>
                                {activeClueId === '10107' && !isCollected('10107') && (
                                    <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10107')}>
                                        【可收集】
                                    </div>
                                )}
                             </div>
                        ) : (
                            <div className="room101-screen-off" style={{width:'100%', height:'100%', background:'black'}}></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Box */}
            <div className="room101-box">
                {/* 101 Ledger (10102) */}
                <div 
                    className={`room101-clue room101-ledger ${isCollected('10102') ? 'collected' : 'collectable'}`}
                    onClick={(e) => handleClueClick(e, '10102', true)}
                    title="101账本"
                >
                    {activeClueId === '10102' && (
                        <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10102')}>
                            【可收集】
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* Right Zone: Bed & Wall */}
      <div className="room101-zone-right">
        {/* Wall */}
        <div className="room101-wall">
            <div className="room101-wall-texture"></div>
            {/* License (10110) - Uncollectable */}
            <div 
                className="room101-clue room101-license"
                onClick={(e) => handleClueClick(e, '10110', false)}
                title="101营业执照"
            />
            {/* Key Pos (Empty) */}
            <div className="room101-keypos" title="钥匙保管处 (空)"></div>
        </div>

        {/* Bed */}
        <div className="room101-bed">
            <div className="room101-mattress"></div>
            <div className={`room101-pillow ${pillowMoved ? 'moved' : ''}`} onClick={togglePillow}></div>
            
            {/* Diary 1 (10103) */}
            <div 
                className={`room101-clue room101-diary1 ${isCollected('10103') ? 'collected' : 'collectable'}`}
                style={{ top: '30px', left: '30px', display: pillowMoved ? 'block' : 'none' }}
                onClick={(e) => handleClueClick(e, '10103', true)}
                title="101日记一"
            >
                {activeClueId === '10103' && (
                    <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10103')}>
                        【可收集】
                    </div>
                )}
            </div>

             {/* Diary 2 (10108) - Hidden, appears after unlock */}
             {unlockedHiddenIds.includes('10108') && (
                 <div 
                    className={`room101-clue room101-diary1 ${isCollected('10108') ? 'collected' : 'collectable'}`}
                    style={{ top: '35px', left: '40px', display: pillowMoved ? 'block' : 'none', transform: 'rotate(5deg)', background: '#fff' }}
                    onClick={(e) => handleClueClick(e, '10108', true)}
                    title="101日记二"
                >
                    {activeClueId === '10108' && (
                        <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10108')}>
                            【可收集】
                        </div>
                    )}
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default Room101;
