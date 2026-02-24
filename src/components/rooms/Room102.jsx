import React, { useState } from 'react'
import cluesData from '../../assets/clues.json'

const Room102 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const collectable = cluesData.room102.collectable
  const uncollectable = cluesData.room102.uncollectable
  const [activeClueId, setActiveClueId] = useState(null)

  const isCollected = (id) => inventory.some(item => item.id === id)
  const isVisible = (clue) => !clue.isHidden || unlockedHiddenIds.includes(clue.clueId)

  const getCollectable = (id) => collectable.find(c => c.clueId === id)
  const getUncollectable = (id) => uncollectable.find(c => c.clueId === id)

  const handleItemClick = (e, clue, isCollectable) => {
    e.stopPropagation()
    if (!clue || !isVisible(clue)) return
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
  }

  const clue10201 = getCollectable('10201')
  const clue10202 = getCollectable('10202')
  const clue10203 = getCollectable('10203')

  const clue10204 = getUncollectable('10204')
  const clue10205 = getUncollectable('10205')
  const clue10206 = getUncollectable('10206')

  return (
    <div className="room-203-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room-203-content">
        <div className="zone left-zone">
          <div
            className={`clue-item clue-bed ${isCollected('10202') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue10202, true)}
            title={clue10202?.clueName}
          >
            {activeClueId === '10202' && !isCollected('10202') && (
              <div className="collect-label" onClick={(e) => handleLabelClick(e, clue10202)}>
                【可收集】
              </div>
            )}
          </div>

          <div
            className={`clue-item clue-toys`}
            onClick={(e) => handleItemClick(e, clue10204, false)}
            title={clue10204?.clueName}
          />
        </div>

        <div className="zone middle-zone">
          <div
            className={`clue-item clue-keys ${isCollected('10201') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue10201, true)}
            title={clue10201?.clueName}
          >
            {activeClueId === '10201' && !isCollected('10201') && (
              <div className="collect-label" onClick={(e) => handleLabelClick(e, clue10201)}>
                【可收集】
              </div>
            )}
          </div>

          <div
            className={`clue-item clue-candy`}
            onClick={(e) => handleItemClick(e, clue10205, false)}
            title={clue10205?.clueName}
          />
        </div>

        <div className="zone right-zone">
          <div
            className={`clue-item clue-crayon ${isCollected('10203') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue10203, true)}
            title={clue10203?.clueName}
          >
            {activeClueId === '10203' && !isCollected('10203') && (
              <div className="collect-label" onClick={(e) => handleLabelClick(e, clue10203)}>
                【可收集】
              </div>
            )}
          </div>

          <div
            className="clue-item clue-family-drawing"
            onClick={(e) => handleItemClick(e, clue10206, false)}
            title={clue10206?.clueName}
          />
        </div>
      </div>
    </div>
  )
}

export default Room102
