import React, { useState } from 'react'
import cluesData from '../../assets/clues.json'

/* ---------------- 203 杂物间组件 ---------------- */
const Room203 = ({ onReturn, onCollect, onShowDetail, inventory, isTruth1Unlocked }) => {
  const [activeClueId, setActiveClueId] = useState(null) // 当前点击的线索ID（显示【可收集】标签）

  // 获取203房间的线索数据
  const room203Clues = cluesData.room203.collectable
  const uncollectableClues = cluesData.room203.uncollectable

  // 检查线索是否已收集
  const isCollected = (id) => inventory.some(item => item.id === id)

  // 处理线索点击
  const handleClueClick = (e, clueId, isCollectable) => {
    e.stopPropagation()
    
    // 如果是不可收集线索，直接显示详情
    if (!isCollectable) {
      const clue = uncollectableClues.find(c => c.clueId === clueId)
      if (clue) {
        onShowDetail({
          id: clue.clueId,
          content: clue.clueDesc,
          title: clue.clueName // 虽然Modal没显示Title，但为了数据完整性加上
        })
      }
      return
    }

    // 如果已收集，点击显示详情（回顾）
    if (isCollected(clueId)) {
      const clue = room203Clues.find(c => c.clueId === clueId)
      if (clue) {
        onShowDetail({
          id: clue.clueId,
          content: clue.clueDesc,
          title: clue.clueName
        })
      }
      return
    }
    
    // 切换标签显示状态
    setActiveClueId(activeClueId === clueId ? null : clueId)
  }

  // 处理【可收集】标签点击
  const handleLabelClick = (e, clue) => {
    e.stopPropagation()
    onCollect(clue)
    setActiveClueId(null)
  }

  // 点击背景关闭标签
  const handleBgClick = () => {
    setActiveClueId(null)
  }

  return (
    <div className="room-203-container" onClick={handleBgClick}>
      {/* 返回按钮 */}
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room-203-content">
        {/* 左侧核心区：储物柜 */}
        <div className="zone left-zone cabinet">
          {/* 层板1：10101 旧报纸 */}
          <div className="cabinet-layer layer-1">
            <div 
              className={`clue-item clue-newspaper ${isCollected('10101') ? 'collected' : ''}`}
              onClick={(e) => handleClueClick(e, '10101', true)}
            >
              {!isCollected('10101') && (
                <div className="flicker-dots">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              )}
              {activeClueId === '10101' && (
                <div className="collect-label" onClick={(e) => handleLabelClick(e, room203Clues.find(c => c.clueId === '10101'))}>
                  【可收集】
                </div>
              )}
            </div>
          </div>

          {/* 层板2：10104 灭火器 */}
          <div className="cabinet-layer layer-2">
            <div 
              className={`clue-item clue-extinguisher ${isCollected('10104') ? 'collected' : ''}`}
              onClick={(e) => handleClueClick(e, '10104', true)}
            >
              {!isCollected('10104') && (
                <div className="flicker-dots">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              )}
              {activeClueId === '10104' && (
                <div className="collect-label" onClick={(e) => handleLabelClick(e, room203Clues.find(c => c.clueId === '10104'))}>
                  【可收集】
                </div>
              )}
            </div>
          </div>

          {/* 层板3：10105 房梁碎片 (隐藏线索) */}
          <div className="cabinet-layer layer-3">
            {isTruth1Unlocked && (
              <div 
                className={`clue-item clue-beam ${isCollected('10105') ? 'collected' : ''}`}
                onClick={(e) => handleClueClick(e, '10105', true)}
              >
                {!isCollected('10105') && (
                  <div className="flicker-dots">
                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  </div>
                )}
                {activeClueId === '10105' && (
                  <div className="collect-label" onClick={(e) => handleLabelClick(e, room203Clues.find(c => c.clueId === '10105'))}>
                    【可收集】
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 中间背景区：杂物堆 + 20301 画笔 */}
        <div className="zone middle-zone debris-pile">
          <div className="debris-decoration box"></div>
          <div className="debris-decoration rag"></div>
          <div className="debris-decoration wood"></div>
          
          {/* 20301 画笔 (不可收集) */}
          <div 
            className="clue-item clue-brush"
            onClick={(e) => handleClueClick(e, '20301', false)}
          >
            <div className="flicker-dots permanent">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        </div>

        {/* 右侧背景区：墙面 + 暖气片 + 20302 住户记录 */}
        <div className="zone right-zone wall-area">
          <div className="radiator"></div>
          
          {/* 20302 住户记录碎片 (不可收集) */}
          <div 
            className="clue-item clue-record"
            onClick={(e) => handleClueClick(e, '20302', false)}
          >
            <div className="flicker-dots permanent">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        </div>

        {/* 全局装饰 */}
        <div className="global-overlay cobwebs"></div>
        <div className="global-overlay dust"></div>
      </div>
    </div>
  )
}

export default Room203
