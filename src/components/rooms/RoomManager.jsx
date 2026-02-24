import React from 'react'
import Room101 from './Room101'
import Room102 from './Room102'
import Room103 from './Room103'
import Room201 from './Room201'
import Room202 from './Room202'
import Room203 from './Room203'

const RoomManager = ({ roomId, onReturn, onCollect, onShowDetail, inventory, isTruth1Unlocked, unlockedHiddenIds }) => {
  switch (roomId) {
    case '101':
      return <Room101 onReturn={onReturn} onCollect={onCollect} onShowDetail={onShowDetail} inventory={inventory} unlockedHiddenIds={unlockedHiddenIds} />
    case '102':
      return <Room102 onReturn={onReturn} onCollect={onCollect} onShowDetail={onShowDetail} inventory={inventory} unlockedHiddenIds={unlockedHiddenIds} />
    case '103':
      return <Room103 onReturn={onReturn} onCollect={onCollect} onShowDetail={onShowDetail} inventory={inventory} unlockedHiddenIds={unlockedHiddenIds} />
    case '201':
      return <Room201 onReturn={onReturn} onCollect={onCollect} onShowDetail={onShowDetail} inventory={inventory} unlockedHiddenIds={unlockedHiddenIds} />
    case '202':
      return <Room202 onReturn={onReturn} onCollect={onCollect} onShowDetail={onShowDetail} inventory={inventory} unlockedHiddenIds={unlockedHiddenIds} />
    case '203':
      return (
        <Room203 
          onReturn={onReturn}
          onCollect={onCollect}
          onShowDetail={onShowDetail}
          inventory={inventory}
          isTruth1Unlocked={isTruth1Unlocked}
          unlockedHiddenIds={unlockedHiddenIds}
        />
      )
    default:
      return (
        <div style={{ color: 'white', padding: '20px' }}>
          <button className="return-btn" onClick={onReturn}>
            ← 返回旅馆
          </button>
          <h2>未知房间</h2>
        </div>
      )
  }
}

export default RoomManager
