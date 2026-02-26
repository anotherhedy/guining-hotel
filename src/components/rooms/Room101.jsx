import React, { useState, useEffect } from 'react';
import cluesData from '../../assets/clues.json';
import './Room101.css';

const Room101 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const [activeClueId, setActiveClueId] = useState(null);
  const [drawersOpen, setDrawersOpen] = useState({ 1: false, 2: false, 3: false, 4: false });
  const [pillowMoved, setPillowMoved] = useState(false);
  const [computerOn, setComputerOn] = useState(false);
  const [isCabinetUnlocked, setIsCabinetUnlocked] = useState(false);
  const [showCabinetLock, setShowCabinetLock] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Helper to find clue by ID from Room 101 or 203 (for newspaper)
  const findClue = (id) => {
    let clue = cluesData.room101.collectable.find(c => c.clueId === id);
    if (!clue) clue = cluesData.room101.uncollectable.find(c => c.clueId === id);
    if (!clue) clue = cluesData.room203.collectable.find(c => c.clueId === id);
    return clue;
  };

  const isCollected = (id) => inventory.some(item => item.id === id);
  const isVisible = (clue) => !clue.isHidden || unlockedHiddenIds.includes(clue.clueId);

  // Handlers
  const toggleDrawer = (e, drawerId) => {
    e.stopPropagation();
    if (drawerId === 2 && !isCabinetUnlocked) {
      setShowCabinetLock(true);
      return;
    }
    setDrawersOpen(prev => ({ ...prev, [drawerId]: !prev[drawerId] }));
    setActiveClueId(null); // Close any active collect tag
  };

  const handlePasswordSubmit = () => {
    if (passwordInput.toLowerCase() === 'jiangyiyi') {
      setIsCabinetUnlocked(true);
      setShowCabinetLock(false);
      setDrawersOpen(prev => ({ ...prev, 2: true }));
      setPasswordInput('');
    } else {
      alert('密码错误');
    }
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

  return (
    <div className="room101-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      {/* Left Zone: Desk */}
      <div className="room101-zone-left">
        <div className="room101-desk">
            
            {/* Drawers */}
            <div className="room101-drawers">
                {/* Drawer 1: Ledger */}
                <div className={`room101-drawer ${drawersOpen[1] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 1)}>
                    <div className="room101-drawer-content">
                         {/* 101 Ledger (10102) */}
                         <div 
                            className={`room101-clue room101-ledger no-flash ${isCollected('10102') ? 'collected' : 'collectable'}`}
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

                {/* Drawer 2: Locked Cabinet (contains Medical Sheet and Hukou) */}
                <div className={`room101-drawer ${drawersOpen[2] ? 'open' : ''} ${!isCabinetUnlocked ? 'locked' : ''}`} onClick={(e) => toggleDrawer(e, 2)}>
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
                         {/* 101 Hukou (10109) - Uncollectable */}
                         <div 
                            className="room101-clue room101-hukou"
                            style={{ top: '60px' }}
                            onClick={(e) => handleClueClick(e, '10109', false)}
                            title="101户口本"
                         />
                    </div>
                </div>

                {/* Drawer 3: Record (10111) - Bottom */}
                <div className={`room101-drawer ${drawersOpen[3] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 3)}>
                    <div className="room101-drawer-content">
                         {/* 101 Record (10111) - Uncollectable */}
                         <div 
                            className="room101-clue room101-record"
                            onClick={(e) => handleClueClick(e, '10111', false)}
                            title="101住户记录"
                         />
                    </div>
                </div>

                {/* Drawer 4: Empty or other items if needed */}
                <div className={`room101-drawer ${drawersOpen[4] ? 'open' : ''}`} onClick={(e) => toggleDrawer(e, 4)}>
                    <div className="room101-drawer-content">
                    </div>
                </div>
            </div>

            {/* Computer */}
            <div className="room101-computer-area">
                <div className={`room101-computer ${computerOn ? 'on' : ''}`}>
                    <div className="room101-computer-body">
                        <div className="room101-screen-bezel">
                            <div className="room101-screen">
                                {computerOn ? (
                                    // 101 Monitor (10107)
                                    <div 
                                        className="room101-screen-content"
                                        onClick={(e) => handleClueClick(e, '10107', true)}
                                        title="101监控片段"
                                    >
                                        <div className="room101-monitor">
                                            <div className="room101-monitor-header">
                                                <span className="room101-rec-icon">● REC</span>
                                                <span className="room101-timestamp">[00:14:23]</span>
                                            </div>
                                            <div className="room101-monitor-body">
                                                CAM 04 - CORRIDOR
                                            </div>
                                            <div className="room101-monitor-footer">
                                                (点击查看详情)
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="room101-screen-off"></div>
                                )}
                                <div className="room101-screen-glare"></div>
                            </div>
                        </div>
                         <div className="room101-computer-controls">
                             <div className="room101-brand">TRON-IX</div>
                             <div 
                                 className={`room101-power-btn ${computerOn ? 'on' : ''}`} 
                                 onClick={toggleComputer}
                                 title={computerOn ? "关闭电脑" : "开启电脑"}
                             ></div>
                         </div>
                         {/* Monitor Collect Tag - Moved outside overflow:hidden screen */}
                         {activeClueId === '10107' && !isCollected('10107') && (
                            <div className="room101-collect-tag" onClick={(e) => handleCollect(e, '10107')}>
                                【可收集】
                            </div>
                         )}
                     </div>
                    <div className="room101-computer-stand"></div>
                </div>
            </div>

            {/* Box (Empty) */}
            <div className="room101-box">
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

      {/* Cabinet Lock Modal */}
      {showCabinetLock && (
        <div className="room101-modal-overlay" onClick={() => setShowCabinetLock(false)}>
            <div className="room101-modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="room101-modal-title">抽屉被锁住了</h3>
                <p className="room101-modal-hint">提示：最重要的人</p>
                <input 
                    type="text" 
                    className="room101-modal-input" 
                    placeholder="输入密码 (拼音)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    autoFocus
                />
                <div className="room101-modal-actions">
                    <button className="room101-modal-btn cancel" onClick={() => setShowCabinetLock(false)}>取消</button>
                    <button className="room101-modal-btn confirm" onClick={handlePasswordSubmit}>确认</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Room101;
