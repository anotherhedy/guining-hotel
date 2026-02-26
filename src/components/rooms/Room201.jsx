import React, { useState } from 'react'
import cluesData from '../../assets/clues.json'
import './Room201.css'

const Room201 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const collectable = cluesData.room201.collectable
  const uncollectable = cluesData.room201.uncollectable
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

  const clue20101 = getCollectable('20101')
  const clue20102 = getCollectable('20102')
  const clue20103 = getCollectable('20103')
  const clue20104 = getCollectable('20104')
  const clue20105 = getCollectable('20105')
  const clue20106 = getCollectable('20106')

  const clue20107 = getUncollectable('20107')
  const clue20108 = getUncollectable('20108')
  const clue20109 = getUncollectable('20109')

  return (
    <div className="room201-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room201-content">
        <div className="room201-zone">
          <div
            className="room201-clue-item room201-clue-bathroom"
            onClick={(e) => handleItemClick(e, clue20101, true)}
            title={clue20101?.clueName}
          >
            {activeClueId === '20101' && !isCollected('20101') && (
              <div className="room201-collect-label" onClick={(e) => handleLabelClick(e, clue20101)}>
                【可收集】
              </div>
            )}
          </div>
        </div>

        <div className="room201-zone">
          <div
            className={`room201-clue-item room201-clue-pills ${isCollected('20102') ? 'collected' : ''}`}
            onClick={(e) => handleItemClick(e, clue20102, true)}
            title={clue20102?.clueName}
          >
            {activeClueId === '20102' && !isCollected('20102') && (
              <div className="room201-collect-label" onClick={(e) => handleLabelClick(e, clue20102)}>
                【可收集】
              </div>
            )}
          </div>

          <div
            className="room201-clue-item room201-clue-idcard"
            onClick={(e) => handleItemClick(e, clue20108, false)}
            title={clue20108?.clueName}
          />
        </div>

        <div className="room201-zone">
          <div
            className="room201-clue-item room201-clue-phone"
            onClick={(e) => handleItemClick(e, clue20103, true)}
            title={clue20103?.clueName}
          >
            {activeClueId === '20103' && !isCollected('20103') && (
              <div className="room201-collect-label" onClick={(e) => handleLabelClick(e, clue20103)}>
                【可收集】
              </div>
            )}
          </div>

          <div
            className="room201-clue-item room201-clue-news"
            onClick={(e) => handleItemClick(e, clue20105, true)}
            title={clue20105?.clueName}
          >
            {activeClueId === '20105' && !isCollected('20105') && (
              <div className="room201-collect-label" onClick={(e) => handleLabelClick(e, clue20105)}>
                【可收集】
              </div>
            )}
          </div>

          {isVisible(clue20106) && (
            <div
              className="room201-clue-item room201-clue-news-updated"
              onClick={(e) => handleItemClick(e, clue20106, true)}
              title={clue20106?.clueName}
            >
              {activeClueId === '20106' && !isCollected('20106') && (
                <div className="room201-collect-label" onClick={(e) => handleLabelClick(e, clue20106)}>
                  【可收集】
                </div>
              )}
            </div>
          )}

          {isVisible(clue20104) && (
            <div
              className="room201-clue-item room201-clue-photo"
              onClick={(e) => handleItemClick(e, clue20104, true)}
              title={clue20104?.clueName}
            >
              {activeClueId === '20104' && !isCollected('20104') && (
                <div className="room201-collect-label" onClick={(e) => handleLabelClick(e, clue20104)}>
                  【可收集】
                </div>
              )}
            </div>
          )}

          <div
            className="room201-clue-item room201-clue-chat"
            onClick={(e) => handleItemClick(e, clue20107, false)}
            title={clue20107?.clueName}
          />

          <div
            className="room201-clue-item room201-clue-form"
            onClick={(e) => handleItemClick(e, clue20109, false)}
            title={clue20109?.clueName}
          />
        </div>
      </div>
    </div>
  )
}

export default Room201
