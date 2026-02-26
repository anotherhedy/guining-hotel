import React, { useState, useEffect } from 'react'
import cluesData from '../../assets/clues.json'
// ✅ 导入两张蜡笔画图片
import drawing10203 from '../../assets/drawing-10203.png'
import drawing10206 from '../../assets/drawing-10206.png'
import './Room102.css'

const Room102 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const collectable = cluesData.room102.collectable
  const uncollectable = cluesData.room102.uncollectable
  
  const [activeClueId, setActiveClueId] = useState(null)
  // ✅ 拼图相关状态
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false)
  const [activePuzzleId, setActivePuzzleId] = useState(null)
  const [puzzlePieces, setPuzzlePieces] = useState([0, 1, 2, 3])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [puzzleCompleted, setPuzzleCompleted] = useState({
    '10203': false,
    '10206': false
  })
  
  // ✅ 图片映射
  const DRAWING_IMAGES = {
    '10203': drawing10203,
    '10206': drawing10206
  }
  
  const isCollected = (id) => inventory.some(item => item.id === id)
  const isVisible = (clue) => !clue.isHidden || unlockedHiddenIds.includes(clue.clueId)
  const getCollectable = (id) => collectable.find(c => c.clueId === id)
  const getUncollectable = (id) => uncollectable.find(c => c.clueId === id)
  
  // ✅ 拼图正确顺序
  const CORRECT_ORDER = [0, 1, 2, 3]
  
  const handleItemClick = (e, clue, isCollectable) => {
    e.stopPropagation()
    if (!clue || !isVisible(clue)) return
    
    // ✅ 特殊处理：蜡笔画需要拼图
    if (clue.clueId === '10203' || clue.clueId === '10206') {
      if (puzzleCompleted[clue.clueId]) {
        // 已拼好，直接查看详情
        onShowDetail({
          id: clue.clueId,
          content: clue.clueDesc,
          title: clue.clueName
        })
      } else {
        // 未拼好，打开拼图界面
        setActivePuzzleId(clue.clueId)
        setIsPuzzleOpen(true)
        resetPuzzle()
      }
      return
    }
    
    if (!isCollectable) {
      onShowDetail({
        id: clue.clueId,
        content: clue.clueDesc,
        title: clue.clueName
      })
      return
    }
    
    if (isCollected(clue.clueId)) {
      onShowDetail({
        id: clue.clueId,
        content: clue.clueDesc,
        title: clue.clueName
      })
      return
    }
    
    setActiveClueId(activeClueId === clue.clueId ? null : clue.clueId)
  }
  
  const handleLabelClick = (e, clue) => {
    e.stopPropagation()
    if (!clue) return
    onCollect(clue)
    setActiveClueId(null)
  }
  
  const handleBgClick = () => {
    setActiveClueId(null)
    // 点击背景也关闭拼图
    if (isPuzzleOpen) {
      setIsPuzzleOpen(false)
      setSelectedPiece(null)
    }
  }
  
  // ✅ 拼图交互：点击交换两块碎片
  const handlePuzzlePieceClick = (gridIndex) => {
    if (selectedPiece === null) {
      // 第一次点击：选中
      setSelectedPiece(gridIndex)
    } else {
      // 第二次点击：交换
      setPuzzlePieces(prev => {
        const newPieces = [...prev]
        ;[newPieces[gridIndex], newPieces[selectedPiece]] = [newPieces[selectedPiece], newPieces[gridIndex]]
        
        // 检查是否拼对
        if (JSON.stringify(newPieces) === JSON.stringify(CORRECT_ORDER)) {
          setPuzzleCompleted(prev => ({ ...prev, [activePuzzleId]: true }))
          setTimeout(() => {
            setIsPuzzleOpen(false)
            setSelectedPiece(null)
          }, 600)
        }
        return newPieces
      })
      setSelectedPiece(null)
    }
  }
  
  // ✅ 重置拼图
  const resetPuzzle = () => {
    setPuzzlePieces([0, 1, 2, 3].sort(() => Math.random() - 0.5))
    setSelectedPiece(null)
  }
  
  // ✅ 预加载图片避免闪烁
  useEffect(() => {
    Object.values(DRAWING_IMAGES).forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])
  
  const clue10201 = getCollectable('10201')
  const clue10202 = getCollectable('10202')
  const clue10203 = getCollectable('10203')
  const clue10204 = getUncollectable('10204')
  const clue10205 = getUncollectable('10205')
  const clue10206 = getUncollectable('10206')
  
  return (
    <div className="room102-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room102-content">
        {/* 左侧区域 - 休息区 (35%) */}
        <div className="room102-zone room102-rest-zone">
          <div className="room102-wall-decorations">
            <div className="room102-height-mark"></div>
            <div className="room102-sticker sticker-star"></div>
            <div className="room102-sticker sticker-bear"></div>
          </div>
          
          <div className="room102-nightstand">
            <div className="room102-lamp"></div>
            {/* 102 钥匙串 (10201) */}
            <div
              className={`room102-clue-item room102-clue-keys ${isCollected('10201') ? 'collected' : ''}`}
              onClick={(e) => handleItemClick(e, clue10201, true)}
              title={clue10201?.clueName}
            >
              {activeClueId === '10201' && !isCollected('10201') && (
                <div className="room102-collect-label" onClick={(e) => handleLabelClick(e, clue10201)}>
                  【可收集】
                </div>
              )}
            </div>
          </div>

          <div
            className={`room102-clue-item room102-bed ${isCollected('10202') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue10202, true)}
            title={clue10202?.clueName}
          >
            <div className="room102-bed-frame"></div>
            <div className="room102-mattress"></div>
            <div className="room102-quilt"></div>
            <div className="room102-pillow"></div>
            <div className="room102-plush-toy"></div>
            {activeClueId === '10202' && !isCollected('10202') && (
              <div className="room102-collect-label" onClick={(e) => handleLabelClick(e, clue10202)}>
                【可收集】
              </div>
            )}
          </div>
        </div>

        {/* 中间区域 - 游戏区 (35%) */}
        <div className="room102-zone room102-play-zone">
          <div className="room102-carpet"></div>
          
          <div className="room102-blocks-area">
            {/* 102 积木 (10204) - Uncollectable */}
            <div 
              className="room102-clue-item room102-blocks-clue"
              onClick={(e) => handleItemClick(e, clue10204, false)}
              title={clue10204?.clueName}
            >
              <div className="room102-block block-orange"></div>
              <div className="room102-block block-blue"></div>
              <div className="room102-block block-green"></div>
              <div className="room102-block block-yellow"></div>
            </div>
          </div>

          <div className="room102-toy-box">
            <div className="room102-toy-box-lid"></div>
            <div className="room102-toy-inside"></div>
          </div>
        </div>

        {/* 右侧区域 - 学习区 (30%) */}
        <div className="room102-zone room102-study-zone">
          <div className="room102-shelf">
            <div className="room102-shelf-item book-1"></div>
            <div className="room102-shelf-item book-2"></div>
            <div className="room102-shelf-item figure"></div>
          </div>

          <div className="room102-desk">
            <div className="room102-desk-top"></div>
            {/* 102 糖果 (10205) - Uncollectable */}
            <div 
              className="room102-clue-item room102-clue-candy"
              onClick={(e) => handleItemClick(e, clue10205, false)}
              title={clue10205?.clueName}
            />
            
            {/* 102 奇怪的蜡笔画 (10203) - Collectable with Puzzle */}
            <div
              className={`room102-clue-item room102-clue-crayon-drawing ${isCollected('10203') ? 'collected' : ''} ${puzzleCompleted['10203'] ? 'puzzle-completed' : ''}`}
              onClick={(e) => handleItemClick(e, clue10203, true)}
              title={clue10203?.clueName}
            >
              <div className="room102-crayon-box">
                <div className="room102-crayon crayon-red"></div>
                <div className="room102-crayon crayon-blue"></div>
              </div>
              {/* ✅ 移除问号遮挡，仅保留画纸背景 */}
              <div className="room102-drawing-paper"></div>
              {activeClueId === '10203' && !isCollected('10203') && (
                <div className="room102-collect-label" onClick={(e) => handleLabelClick(e, clue10203)}>
                  【可收集】
                </div>
              )}
            </div>
          </div>

          <div className="room102-wall-frames">
            {/* 102 可爱的蜡笔画 (10206) - Uncollectable with Puzzle */}
            <div 
              className={`room102-clue-item room102-family-drawing ${puzzleCompleted['10206'] ? 'puzzle-completed' : ''}`}
              onClick={(e) => handleItemClick(e, clue10206, false)}
              title={clue10206?.clueName}
            >
              {/* ✅ 移除问号遮挡，仅保留画纸背景 */}
              <div className="room102-drawing-content"></div>
              <div className="room102-thumbtack pin-top-left"></div>
              <div className="room102-thumbtack pin-top-right"></div>
              {!puzzleCompleted['10206'] && (
                <div className="room102-puzzle-hint">点击拼合</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 拼图模态框 */}
      {isPuzzleOpen && activePuzzleId && (
        <div className="room102-puzzle-overlay" onClick={handleBgClick}>
          <div className={`room102-puzzle-modal room102-puzzle-${activePuzzleId}`} onClick={e => e.stopPropagation()}>
            <div className="room102-puzzle-header">
              <h3>拼合蜡笔画</h3>
              <button className="puzzle-close" onClick={() => {
                setIsPuzzleOpen(false)
                setSelectedPiece(null)
              }}>×</button>
            </div>
            
            <div className="room102-puzzle-instructions">
              点击两块碎片交换位置，还原完整画作
            </div>
            
            <div className="room102-puzzle-grid">
              {puzzlePieces.map((originalIndex, gridIndex) => (
                <div
                  key={gridIndex}
                  className={`room102-puzzle-piece ${selectedPiece === gridIndex ? 'selected' : ''} ${puzzlePieces[gridIndex] === gridIndex ? 'correct' : ''}`}
                  data-piece-index={originalIndex}
                  onClick={() => handlePuzzlePieceClick(gridIndex)}
                  // ✅ 不显示序号，仅通过 background-position 显示图片
                >
                  {/* ✅ 移除序号显示 */}
                </div>
              ))}
            </div>
            
            <div className="room102-puzzle-actions">
              <button className="room102-puzzle-btn room102-puzzle-reset" onClick={resetPuzzle}>
                重置
              </button>
              <button className="puzzle-btn cancel" onClick={() => {
                setIsPuzzleOpen(false)
                setSelectedPiece(null)
              }}>
                取消
              </button>
            </div>
            
            {puzzleCompleted[activePuzzleId] && (
              <div className="puzzle-success">
                ✓ 拼图完成！
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Room102;