import React, { useState } from 'react'
import cluesData from '../../assets/clues.json'

const Room202 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const collectable = cluesData.room202.collectable
  const uncollectable = cluesData.room202.uncollectable
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

  const clue20201 = getCollectable('20201')
  const clue20202 = getCollectable('20202')
  const clue20203 = getCollectable('20203')
  const clue20204 = getCollectable('20204')

  const clue20205 = getUncollectable('20205')
  const clue20206 = getUncollectable('20206')

  return (
    <div className="room-203-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room-203-content">
        <div className="zone left-zone">
          <div
            className={`clue-item clue-bag ${isCollected('20201') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue20201, true)}
            title={clue20201?.clueName}
          >
            {activeClueId === '20201' && !isCollected('20201') && (
              <div className="collect-label" onClick={(e) => handleLabelClick(e, clue20201)}>
                【可收集】
              </div>
            )}
          </div>

          {isVisible(clue20204) && (
            <div
              className={`clue-item clue-bag-note ${isCollected('20204') ? 'collected' : ''}`}
              onClick={(e) => handleItemClick(e, clue20204, true)}
              title={clue20204?.clueName}
            >
              {activeClueId === '20204' && !isCollected('20204') && (
                <div className="collect-label" onClick={(e) => handleLabelClick(e, clue20204)}>
                  【可收集】
                </div>
              )}
            </div>
          )}

          <div
            className="clue-item clue-wallet"
            onClick={(e) => handleItemClick(e, clue20205, false)}
            title={clue20205?.clueName}
          />
        </div>

        <div className="zone middle-zone">
          <div
            className={`clue-item clue-phone-trucker ${isCollected('20202') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue20202, true)}
            title={clue20202?.clueName}
          >
            {activeClueId === '20202' && !isCollected('20202') && (
              <div className="collect-label" onClick={(e) => handleLabelClick(e, clue20202)}>
                【可收集】
              </div>
            )}
          </div>

          <div
            className="clue-item clue-transport"
            onClick={(e) => handleItemClick(e, clue20206, false)}
            title={clue20206?.clueName}
          />
        </div>

        <div className="zone right-zone">
          <div
            className={`clue-item clue-ashtray ${isCollected('20203') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue20203, true)}
            title={clue20203?.clueName}
          >
            {activeClueId === '20203' && !isCollected('20203') && (
              <div className="collect-label" onClick={(e) => handleLabelClick(e, clue20203)}>
                【可收集】
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room202
