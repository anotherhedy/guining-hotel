import React, { useState } from 'react'
import cluesData from '../../assets/clues.json'
import Phone from '../../components/Phone/Phone'  // ✅ 新增：导入 Phone 组件
import './Room103.css'

const Room103 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const [activeClueId, setActiveClueId] = useState(null)
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)  // ✅ 保留：手机打开状态
  const [paintingFlipped, setPaintingFlipped] = useState(false)
  
  const room103Clues = cluesData.room103.collectable
  const uncollectableClues = cluesData.room103.uncollectable
  
  const isCollected = (id) => inventory.some(item => item.id === id)
  const isHiddenUnlocked = (id) => unlockedHiddenIds.includes(id)
  
  // 处理线索点击
  const handleClueClick = (e, clueId, isCollectable = true) => {
    e.stopPropagation()
    const clue = room103Clues.find(c => c.clueId === clueId)
    
    if (!clue) return
    
    if (isCollected(clueId)) {
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
  
  // ✅ 修改：打开手机
  const handlePhoneClick = (e) => {
    e.stopPropagation()
    setIsPhoneOpen(true)
  }
  
  // 翻转画作
  const handlePaintingClick = (e) => {
    e.stopPropagation()
    setPaintingFlipped(!paintingFlipped)
    handleClueClick(e, '10302', true)
  }
  
  // 点击背景关闭
  const handleBgClick = () => {
    setActiveClueId(null)
    setIsPhoneOpen(false)  // ✅ 新增：关闭手机
  }
  
  // ✅ 新增：手机数据配置（根据文档）
  const phone103Config = {
    password: 'r',
    passwordHint: '世界的中心是什么',
    apps: ['wechat'],  // 赵青手机只有微信
    chatData: {
      contacts: [
        {
          name: '爸爸',
          avatar: '👨',
          messages: [
            { type: 'received', text: '青青，回家吧，读研的事我们可以再商量。', time: '2 月 20 日 09:00' },
            { type: 'sent', text: '绘画就是我的生命，我不会放弃的。', time: '2 月 20 日 09:30' },
            { type: 'received', text: '我们只是担心你……罢了，你自己想清楚吧。', time: '2 月 20 日 10:00' }
          ]
        },
        {
          name: '妈妈',
          avatar: '👩',
          messages: [
            { type: 'received', text: '你什么时候回来？妈妈很想你。', time: '2 月 21 日 14:00' },
            { type: 'sent', text: '等我完成这幅画就回去。', time: '2 月 21 日 14:30' }
          ]
        }
      ],
      moments: [
        { 
          time: '2 月 22 日 18:30', 
          text: '为了完成作品，我可以不惜一切代价！🎨', 
          likes: 23, 
          comments: 5 
        },
        { 
          time: '2 月 21 日 10:00', 
          text: '这家山上的旅馆很有感觉，神秘的故事感正是我想要的。', 
          likes: 45, 
          comments: 12 
        }
      ]
    },
    newsData: [],
    driveData: null,
    albumData: [],
    showHiddenApps: false
  }
  
  // 获取不可收集线索内容（备用）
  const getUncollectableContent = (id) => {
    const clue = uncollectableClues.find(c => c.clueId === id)
    return clue ? clue.clueDesc : ''
  }
  
  // 获取线索对象
  const getClue = (id) => room103Clues.find(c => c.clueId === id)
  
  return (
    <div className="room103-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room103-content">
        {/* 左侧区域：窗户与房门 */}
        <div className="room103-zone-left">
          <div 
            className={`room103-doorwin room103-clue-item ${isCollected('10301') ? 'collected' : ''}`}
            onClick={(e) => handleClueClick(e, '10301', true)}
          >
            <div className="room103-window">
              <div className="room103-window-dust"></div>
            </div>
            {activeClueId === '10301' && !isCollected('10301') && (
              <div className="room103-collect-tag" onClick={(e) => handleLabelClick(e, getClue('10301'))}>
                【可收集】
              </div>
            )}
          </div>
        </div>

        {/* 中间区域：画架、书桌、墙面 */}
        <div className="room103-zone-middle">
          {/* 墙面画作 */}
          <div className="room103-wall">
            <div className="room103-wall-texture"></div>
            <div className="room103-painting"></div>
            <div className="room103-painting"></div>
            
            {/* 可翻转的画作 (10302) */}
            <div 
              className={`room103-painting room103-painting-flippable room103-clue-item ${isCollected('10302') ? 'collected' : ''} ${paintingFlipped ? 'flipped' : ''}`}
              onClick={handlePaintingClick}
            >
              <div className="room103-painting-front"></div>
              <div className="room103-painting-back">
                这家山上的旅馆跟我的作品主题很契合...
              </div>
              {activeClueId === '10302' && !isCollected('10302') && (
                <div 
                  className="room103-collect-tag" 
                  style={paintingFlipped ? { left: '110%' } : {}}
                  onClick={(e) => handleLabelClick(e, getClue('10302'))}
                >
                  【可收集】
                </div>
              )}
            </div>
            
            <div className="room103-painting"></div>
          </div>

          {/* 画架 */}
          <div className="room103-easel">
            <div className="room103-easel-stand"></div>
            <div className="room103-canvas"></div>
          </div>

          {/* 书桌 */}
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

            {/* 隐藏的松节油 (10303) */}
            <div 
              className={`room103-turpentine room103-clue-item ${isHiddenUnlocked('10303') ? 'visible' : ''} ${isCollected('10303') ? 'collected' : ''}`}
              onClick={(e) => isHiddenUnlocked('10303') && handleClueClick(e, '10303', true)}
              style={{ display: isHiddenUnlocked('10303') ? 'block' : 'none' }}
            >
              {activeClueId === '10303' && !isCollected('10303') && (
                <div className="room103-collect-tag" onClick={(e) => handleLabelClick(e, getClue('10303'))}>
                  【可收集】
                </div>
              )}
            </div>

            {/* ✅ 修改：手机 - 简化为点击区域，实际 UI 由 Phone 组件渲染 */}
            <div className="room103-phone" onClick={handlePhoneClick}>
              <div className="room103-phone-screen"></div>
            </div>
          </div>
        </div>

        {/* 右侧区域：床、箱子 */}
        <div className="room103-zone-right">
          <div className="room103-bed">
            <div className="room103-bed-mattress"></div>
          </div>
          
          <div className="room103-box">
            <div className="room103-box-lid"></div>
          </div>
        </div>
      </div>

      {/* ✅ 修改：使用 Phone 组件替换原有 phone-ui */}
      <Phone
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        password={phone103Config.password}
        passwordHint={phone103Config.passwordHint}
        apps={phone103Config.apps}
        chatData={phone103Config.chatData}
        newsData={phone103Config.newsData}
        driveData={phone103Config.driveData}
        albumData={phone103Config.albumData}
        showHiddenApps={phone103Config.showHiddenApps}
      />
    </div>
  )
}

export default Room103