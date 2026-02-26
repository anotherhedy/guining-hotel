import React, { useState } from 'react'
import cluesData from '../../assets/clues.json'
import Phone from '../Phone/Phone'
import './Room202.css'

const Room202 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const [activeClueId, setActiveClueId] = useState(null)
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)
  const [pillowLifted, setPillowLifted] = useState(false)

  const room202Clues = cluesData.room202.collectable
  const uncollectableClues = cluesData.room202.uncollectable

  const isCollected = (id) => inventory.some(item => item.id === id)
  const isHiddenUnlocked = (id) => unlockedHiddenIds.includes(id)

  // 获取线索对象
  const getClue = (id) => room202Clues.find(c => c.clueId === id) || uncollectableClues.find(c => c.clueId === id)

  // 线索点击逻辑
  const handleClueClick = (e, clueId, isCollectable = true) => {
    e.stopPropagation()
    const clue = getClue(clueId)
    if (!clue) return

    if (isCollected(clueId) || !isCollectable) {
      onShowDetail({
        id: clue.clueId,
        content: clue.clueDesc,
        title: clue.clueName
      })
      return
    }
    setActiveClueId(activeClueId === clueId ? null : clueId)
  }

  const handleLabelClick = (e, clue) => {
    e.stopPropagation()
    if (!clue) return
    onCollect(clue)
    setActiveClueId(null)
  }

  const handleBgClick = () => {
    setActiveClueId(null)
    setIsPhoneOpen(false)
  }

  const handlePillowClick = (e) => {
    e.stopPropagation()
    setPillowLifted(!pillowLifted)
    setActiveClueId(null)
  }

  // 手机配置
  const phone202Config = {
    password: '19791008',
    passwordHint: '',
    apps: ['wechat'],
    chatData: {
      contacts: [
        {
          name: '老谢',
          messages: [
            { type: 'received', text: '老邹，明天那一趟货谁跑？', time: '昨天 18:00' },
            { type: 'sent', text: '明天这一趟我去跑。', time: '昨天 18:30' }
          ],
          isCollectable: true,
          clueId: '20202',
          clueName: '202与老谢的聊天记录'
        }
      ]
    },
    newsData: [],
    driveData: null
  }

  return (
    <div className="room202-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room202-scene">
        {/* 墙面装饰：女儿的照片和日历 */}
        <div className="room202-wall-decor">
          <div className="room202-daughter-photo" title="女儿的照片"></div>
          <div className="room202-calendar"></div>
        </div>

        {/* 窗户区域 */}
        <div className="room202-window-area">
          <div className="room202-window-frame">
            <div className="room202-night-rain"></div>
          </div>
        </div>

        {/* 床铺：凌乱的被褥 */}
        <div className="room202-bed-scene">
          <div className="room202-bed-frame">
            <div className="room202-sheets"></div>
            <div 
              className={`room202-pillow-item ${pillowLifted ? 'lifted' : ''}`}
              onClick={handlePillowClick}
            >
              <div className="room202-pillow-shadow"></div>
            </div>
            
            {/* 隐藏在枕头下的钱包 (20205) */}
            <div 
              className={`room202-wallet-clue ${pillowLifted ? 'visible' : ''}`}
              onClick={(e) => handleClueClick(e, '20205', false)}
            >
              <div className="room202-wallet-shape"></div>
            </div>

            {/* 床尾的老旧手提包 (20201 / 20204) */}
            <div 
              className={`room202-bag-clue ${
                isHiddenUnlocked('20204') 
                  ? (isCollected('20204') ? 'collected' : '') 
                  : (isCollected('20201') ? 'collected' : '')
              }`}
              onClick={(e) => isHiddenUnlocked('20204') ? handleClueClick(e, '20204', true) : handleClueClick(e, '20201', true)}
            >
              <div className="room202-bag-handle"></div>
              {(activeClueId === '20201' && !isCollected('20201')) && (
                <div className="room202-collect-tag left-side" onClick={(e) => handleLabelClick(e, getClue('20201'))}>
                  【可收集】
                </div>
              )}
              {(activeClueId === '20204' && !isCollected('20204')) && (
                <div className="room202-collect-tag left-side" onClick={(e) => handleLabelClick(e, getClue('20204'))}>
                  【可收集】
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 书桌区域：杂乱的桌面 */}
        <div className="room202-desk-scene">
          <div className="room202-desk-surface">
            {/* 手机 (打开手机组件) */}
            <div className="room202-phone-item" onClick={(e) => { e.stopPropagation(); setIsPhoneOpen(true); }}>
              <div className="room202-phone-screen"></div>
            </div>

            {/* 烟灰缸 (20203) */}
            <div 
              className={`room202-ashtray-item ${isCollected('20203') ? 'collected' : ''}`}
              onClick={(e) => handleClueClick(e, '20203', true)}
            >
              <div className="room202-ashtray-smoke"></div>
              {activeClueId === '20203' && !isCollected('20203') && (
                <div className="room202-collect-tag" onClick={(e) => handleLabelClick(e, getClue('20203'))}>
                  【可收集】
                </div>
              )}
            </div>

            {/* 运输单 (20206) */}
            <div 
              className="room202-transport-clue"
              onClick={(e) => handleClueClick(e, '20206', false)}
            >
              <div className="room202-paper-texture"></div>
            </div>
          </div>
          <div className="room202-desk-legs"></div>
        </div>

        {/* 装饰性杂物：增加画面充实度 */}
        <div className="room202-decorations">
          <div className="room202-debris box"></div>
          <div className="room202-debris tire"></div>
          <div className="room202-debris tools"></div>
        </div>
      </div>

      <Phone
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        password={phone202Config.password}
        passwordHint={phone202Config.passwordHint}
        apps={phone202Config.apps}
        chatData={phone202Config.chatData}
        newsData={phone202Config.newsData}
        driveData={phone202Config.driveData}
        inventory={inventory}
        onCollect={(clue) => {
          onCollect(clue)
        }}
        storageKey="room202PhoneUnlocked"
      />
    </div>
  )
}

export default Room202

