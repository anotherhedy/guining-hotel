import React, { useState, useEffect, useRef } from 'react'
import cluesData from '../../assets/clues.json'
import Phone from '../Phone/Phone'
import './Room201.css'

const Room201 = ({ onReturn, onCollect, onShowDetail, inventory, unlockedHiddenIds }) => {
  const [activeClueId, setActiveClueId] = useState(null)
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)
  const [wipedPercent, setWipedPercent] = useState(0)
  const mirrorCanvasRef = useRef(null)
  const isWiping = useRef(false)

  const room201Clues = cluesData.room201.collectable
  const uncollectableClues = cluesData.room201.uncollectable

  const isCollected = (id) => inventory.some(item => item.id === id)
  const isHiddenUnlocked = (id) => unlockedHiddenIds.includes(id)

  // 获取线索对象
  const getClue = (id) => room201Clues.find(c => c.clueId === id) || uncollectableClues.find(c => c.clueId === id)

  // 初始化镜子
  useEffect(() => {
    const canvas = mirrorCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // 填充灰色灰尘
    ctx.fillStyle = '#444'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 添加灰尘纹理
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.3})`
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  // 镜子擦拭逻辑
  const startWiping = () => { isWiping.current = true }
  const stopWiping = () => { isWiping.current = false }
  
  const handleMirrorWipe = (e) => {
    if (!isWiping.current) return
    const canvas = mirrorCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()

    // 增加擦拭进度感官（简单计数）
    if (wipedPercent < 100) {
      setWipedPercent(prev => Math.min(prev + 0.5, 100))
    }
  }

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

  // 手机配置
  const phone201Config = {
    password: '19980607',
    passwordHint: '',
    apps: ['wechat', 'news', 'drive'],
    chatData: {
      contacts: [
        {
          name: '周主管',
          messages: [
            { type: 'received', text: '最近新组长的人选就在你和沈江河之中，虽然沈江河业绩更好，但我认为你也是个不错的苗子，要好好努力啊。', time: '2月20日 10:00' }
          ]
        }
      ]
    },
    newsData: [
      {
        title: '海湾路发生一起车祸',
        time: '一周前',
        content: '昨夜海湾路发生一起车祸，受害人沈某当场死亡，目前警方还在寻找肇事车辆。',
        isCollectable: true,
        clueId: '20105',
        clueName: '201海湾路车祸'
      },
      ...(isHiddenUnlocked('20106') ? [{
        title: '海湾路发生一起车祸 (更新)',
        time: '三天前',
        content: '警方已找到肇事车辆，嫌疑人王某声称自己当晚喝多才导致悲剧的发生……小编这里呼吁大家，开车不喝酒，喝酒不开车，行车不规范，亲人两行泪啊。',
        isCollectable: true,
        clueId: '20106',
        clueName: '201海湾路车祸二'
      }] : [])
    ],
    driveData: {
      route: '公司 → 海湾路',
      date: '一周前的晚上',
      note: '一周前的晚上出现在海湾路。',
      isCollectable: true,
      clueId: '20103',
      clueName: '201行车记录'
    }
  }

  // 如果隐藏线索已解锁，且 20105 已收集，则可以收集 20106
  const canCollect20106 = isHiddenUnlocked('20106') && isCollected('20105') && !isCollected('20106')

  return (
    <div className="room201-container" onClick={handleBgClick}>
      <button className="return-btn" onClick={onReturn}>
        ← 返回旅馆
      </button>

      <div className="room201-content">
        {/* 左侧：浴室区域 */}
        <div className="room201-zone room201-bathroom">
          <div className="room201-mirror-frame">
            <div className="room201-mirror-surface">
              <div className={`room201-blood-text ${wipedPercent > 40 ? 'visible' : ''}`}>
                对不起
              </div>
              <canvas
                ref={mirrorCanvasRef}
                className="room201-mirror-canvas"
                width={180}
                height={220}
                onMouseDown={startWiping}
                onMouseMove={handleMirrorWipe}
                onMouseUp={stopWiping}
                onMouseLeave={stopWiping}
              />
            </div>
            {wipedPercent > 60 && !isCollected('20101') && (
              <div 
                className="room201-collect-tag mirror-label" 
                onClick={(e) => handleLabelClick(e, getClue('20101'))}
              >
                【可收集】
              </div>
            )}
          </div>
        </div>

        {/* 中间：书桌区域 */}
        <div className="room201-zone room201-desk-area">
          <div className="room201-desk">
            {/* 手机 */}
            <div className="room201-item room201-phone-item" onClick={(e) => { e.stopPropagation(); setIsPhoneOpen(true); }}>
              <div className="room201-phone-screen-glow"></div>
            </div>

            {/* 身份证 */}
            <div 
              className="room201-item room201-idcard-item"
              onClick={(e) => handleClueClick(e, '20108', false)}
              title="许鹤的身份证"
            />

            {/* 晋升申请表 */}
            <div 
              className="room201-item room201-form-item"
              onClick={(e) => handleClueClick(e, '20109', false)}
              title="晋升申请表"
            />
          </div>
        </div>

        {/* 右侧：床与地铺区域 */}
        <div className="room201-zone room201-bed-area">
          <div className="room201-bed">
            <div className="room201-pillow"></div>
          </div>
          
          {/* 安眠药 - 散落在床边地上 */}
          <div 
            className={`room201-item room201-pills-item ${isCollected('20102') ? 'collected' : ''}`}
            onClick={(e) => handleClueClick(e, '20102', true)}
          >
            {activeClueId === '20102' && !isCollected('20102') && (
              <div className="room201-collect-tag" onClick={(e) => handleLabelClick(e, getClue('20102'))}>
                【可收集】
              </div>
            )}
          </div>

          {/* 背包 - 含有隐藏合照 */}
          <div 
            className={`room201-item room201-backpack-item ${isHiddenUnlocked('20104') ? 'unlocked' : ''}`}
            onClick={(e) => isHiddenUnlocked('20104') && handleClueClick(e, '20104', true)}
          >
            {isHiddenUnlocked('20104') && !isCollected('20104') && activeClueId === '20104' && (
              <div className="room201-collect-tag" onClick={(e) => handleLabelClick(e, getClue('20104'))}>
                【可收集】
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 装饰性细节：填满画面 */}
      <div className="room201-decorations">
        <div className="room201-debris paper"></div>
        <div className="room201-debris stain"></div>
      </div>

      <Phone
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        password={phone201Config.password}
        passwordHint={phone201Config.passwordHint}
        apps={phone201Config.apps}
        chatData={phone201Config.chatData}
        newsData={phone201Config.newsData}
        driveData={phone201Config.driveData}
        inventory={inventory}
        onCollect={(clue) => {
          // 处理 20106 的特殊逻辑（如果需要）
          onCollect(clue)
        }}
      />
    </div>
  )
}

export default Room201

