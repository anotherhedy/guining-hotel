import { useState, useEffect, useRef } from 'react'
import './App.css'
import RoomManager from './components/rooms/RoomManager'
import cluesData from './assets/clues.json'
import truthStories from './assets/truthStories.json'

function App() {
  const [gameStatus, setGameStatus] = useState('start') // 'start' | 'hotel' | 'room'
  const [currentRoomId, setCurrentRoomId] = useState(null)
  const [isLeftOpen, setIsLeftOpen] = useState(true)
  const [isRightOpen, setIsRightOpen] = useState(true)
  const [isDeathDialogOpen, setIsDeathDialogOpen] = useState(false)
  
  // State for Clue Collection
  const [clueCollected, setClueCollected] = useState(false) // For death clue specifically
  const [inventory, setInventory] = useState([])
  const [notification, setNotification] = useState(null)
  const [selectedClue, setSelectedClue] = useState(null)

  // 203 Room States
  const [isJiangXiaoliTruth1Unlocked, setIsJiangXiaoliTruth1Unlocked] = useState(false) // 蒋晓丽真相1解锁状态 (控制10105显示)

  // Hidden clues unlocked by synthesizing truth1
  const [unlockedHiddenIds, setUnlockedHiddenIds] = useState([])
  const [visitedRooms, setVisitedRooms] = useState([])
  const [hasTriggeredFiveCorpses, setHasTriggeredFiveCorpses] = useState(false)

  // State for Room Verification
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [verificationName, setVerificationName] = useState('')
  const [unlockedRooms, setUnlockedRooms] = useState(['203']) // 203 is unlocked by default

  // Synthesis State
  const [synthesisSlots, setSynthesisSlots] = useState([null, null, null])
  const [synthesisName, setSynthesisName] = useState('')
  const [truthModal, setTruthModal] = useState({ open: false, title: '', content: '' })
  const [truth1CompletedNames, setTruth1CompletedNames] = useState([])
  const [hasTriggeredTruthAll, setHasTriggeredTruthAll] = useState(false)

  // Drag and Drop Handlers
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('clue', JSON.stringify(item))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    const item = JSON.parse(e.dataTransfer.getData('clue'))
    
    // Check if clue is already in slots
    if (synthesisSlots.some(slot => slot && slot.id === item.id)) {
      setNotification('该线索已放入合成栏')
      setTimeout(() => setNotification(null), 2000)
      return
    }

    const newSlots = [...synthesisSlots]
    newSlots[index] = item
    setSynthesisSlots(newSlots)
  }

  const handleRemoveFromSlot = (index) => {
    const newSlots = [...synthesisSlots]
    newSlots[index] = null
    setSynthesisSlots(newSlots)
  }

  // Room ownership mapping
  const roomOwners = {
    '101': '蒋晓丽',
    '102': '蒋一一',
    '103': '赵青',
    '201': '许鹤',
    '202': '邹良生'
  }

  // Truth synthesis mapping
  const truthClueMap = cluesData.truthClueMap
  const roomUserMap = cluesData.roomUserMap

  // State for Death Dialog Chat
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 1, 
      sender: 'death', 
      text: '昨夜归宁旅馆起了一场大火，所有人都死在房间内。', 
      type: 'clue', // 'text' | 'clue'
      clueId: '死神-大火'
    },
    { 
      id: 2, 
      sender: 'death', 
      text: '在探索过程中有问题可以呼唤我，但我不一定会回答你。', 
      type: 'text' 
    }
  ])
  const [displayedMessages, setDisplayedMessages] = useState([])
  const [hasUnread, setHasUnread] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  // Handle message revealing effect
  useEffect(() => {
    if (isDeathDialogOpen) {
      // Clear unread status when dialog is open
      setHasUnread(false)

      // If all messages are already displayed, do nothing
      if (displayedMessages.length === chatHistory.length) return

      // Sequential revealing logic
      const timer = setInterval(() => {
        setDisplayedMessages(prev => {
          if (prev.length < chatHistory.length) {
            return [...prev, chatHistory[prev.length]]
          }
          clearInterval(timer)
          return prev
        })
      }, 800) // 800ms delay between messages

      return () => clearInterval(timer)
    }
  }, [isDeathDialogOpen, chatHistory, displayedMessages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedMessages])

  const handleStartGame = () => {
    setGameStatus('hotel')
  }

  /* 通用线索收集函数 */
  const handleGenericCollectClue = (clue) => {
    // Check if already collected
    if (inventory.some(item => item.id === clue.clueId)) return

    setInventory(prev => [...prev, {
      id: clue.clueId,
      title: `线索：${clue.clueName}`,
      content: clue.clueDesc,
      detail: clue.detail
    }])
    
    setNotification(`已收集线索：${clue.clueName}`)
    setTimeout(() => setNotification(null), 3000)
  }

  /* 死神对话可收集 (保留原有逻辑) */
  const isDeathClueCollected = (clueTextId) => {
    const id = normalizeClueId(clueTextId)
    return inventory.some(item => item.id === id)
  }

  const handleCollectClue = (clueTextId) => {
    const normalized = normalizeClueId(clueTextId)
    if (inventory.some(item => item.id === normalized)) return
    if (normalized === 'XS001') {
      setClueCollected(true)
    }
    const titleMap = { 'XS001': '线索：死神-大火', 'XS002': '线索：死神-亡者复仇' }
    const contentMap = { 
      'XS001': '昨夜归宁旅馆起了一场大火，所有人都死在房间内。', 
      'XS002': '亡者复仇的故事确实存在，但那个死去的灵魂仇恨必须很深才能影响到现实。' 
    }
    setInventory(prev => [...prev, {
      id: normalized,
      title: titleMap[normalized] || '线索：死神线索',
      content: contentMap[normalized] || ''
    }])
    setNotification(`已收集线索：${titleMap[normalized]}`)
    setTimeout(() => setNotification(null), 2000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      text: inputValue,
      type: 'text'
    }

    // Update history directly (user messages appear instantly)
    setChatHistory(prev => [...prev, newMessage])
    setDisplayedMessages(prev => [...prev, newMessage]) // User message shows instantly
    setInputValue('')
    
    // Optional: Death auto-reply logic could go here
  }

  const handleRoomClick = (room) => {
    // Check if room is unlocked
    if (unlockedRooms.includes(room)) {
      setNotification(`进入房间 ${room}...`)
      setTimeout(() => {
        setNotification(null)
        setGameStatus('room')
        setCurrentRoomId(room)
        // 进入房间提示有无尸体
        const roomCorpseMap = { '101': 0, '102': 1, '103': 2, '201': 1, '202': 1, '203': 2 }
        const hasCorpse = roomCorpseMap[room]
        setNotification(
        hasCorpse == 0 ? `提示：房间内无尸体` :
        hasCorpse == 1 ? `提示：房间内有一具男性尸体` :
        hasCorpse == 2 ? `提示：房间内有一具女性尸体` :
        ``
      )
        setTimeout(() => setNotification(null), 2000)
        // 统计已打开房间并触发“5具尸体”死神线索
        if (!visitedRooms.includes(room)) {
          const newVisited = [...visitedRooms, room]
          setVisitedRooms(newVisited)
          const roomsAll = ['101', '102', '103', '201', '202', '203']
          if (!hasTriggeredFiveCorpses && roomsAll.every(r => newVisited.includes(r))) {
            const clue = cluesData.publicClues.find(c => c.clueId === 'XS002')
            const dialogLines = [
              { sender: 'death', text: '进展如何。', type: 'text' },
              { sender: 'user', text: '有一个问题，旅馆之中只有5具尸体。', type: 'text' },
              { sender: 'death', text: '奇怪，我明明抓到了6个灵魂来着……', type: 'text' },
              { sender: 'death', text: '……', type: 'text' },
              { sender: 'death', text: '哦，有一个灵魂是一周前的，没想到啊，藏了这么久。', type: 'text' },
              { sender: 'user', text: '这个灵魂……会不会是来复仇的？', type: 'text' }
            ]
            setChatHistory(prev => {
              let nextId = prev.length + 1
              const appended = dialogLines.map(line => ({
                id: nextId++,
                sender: line.sender === 'death' ? 'death' : 'user',
                text: line.text,
                type: line.type
              }))
              if (clue) {
                appended.push({
                  id: nextId++,
                  sender: 'death',
                  text: clue.clueDesc,
                  type: 'clue',
                  clueId: '死神-亡者复仇'
                })
              }
              return [...prev, ...appended]
            })
            setHasUnread(true)
            setHasTriggeredFiveCorpses(true)
          }
        }
      }, 500)
    } else {
      setSelectedRoom(room)
      setVerificationName('')
    }
  }

  const handleVerifyConfirm = () => {
    if (!verificationName.trim()) {
      alert('请输入姓名')
      return
    }

    const correctName = roomOwners[selectedRoom]
    if (verificationName.trim() === correctName) {
      setUnlockedRooms(prev => [...prev, selectedRoom])
      setNotification(`验证成功！房间 ${selectedRoom} 已解锁`)
      setTimeout(() => setNotification(null), 2000)
      setSelectedRoom(null)
    } else {
      alert('姓名验证失败，请重试')
    }
  }

  // Normalize clue ids for synthesis (support textual death clues)
  const normalizeClueId = (id) => {
    if (id === '死神-大火') return 'XS001'
    if (id === '死神-亡者复仇') return 'XS002'
    return id
  }

  const arraysEqualAsSet = (a, b) => {
    if (a.length !== b.length) return false
    const sa = new Set(a)
    for (const x of b) {
      if (!sa.has(x)) return false
    }
    return true
  }

  const handleSynthesize = () => {
    const name = synthesisName.trim()
    if (!name) {
      alert('请输入人物姓名')
      return
    }
    const config = truthClueMap[name]
    if (!config) {
      alert('姓名不正确或未收集足够线索')
      return
    }
    const slotIds = synthesisSlots.map(s => s && normalizeClueId(s.id)).filter(Boolean)
    if (slotIds.length !== 3) {
      alert('需放入3条线索')
      return
    }
    const isTruth1 = arraysEqualAsSet(slotIds, config.truth1)
    const isTruth2 = arraysEqualAsSet(slotIds, config.truth2)
    if (!isTruth1 && !isTruth2) {
      alert('合成失败')
      return
    }
    const title = isTruth1 ? `【${name}-死亡真相】` : `【${name}-死亡真相2】`
    const storyConfig = truthStories[name]
    const content = storyConfig
      ? (isTruth1 ? storyConfig.truth1Story : storyConfig.truth2Story)
      : '真相已还原'
    setTruthModal({ open: true, title, content })
    if (isTruth1) {
      setTruth1CompletedNames(prev => (prev.includes(name) ? prev : [...prev, name]))
    }
    // clear slots after success
    setSynthesisSlots([null, null, null])
  }

  useEffect(() => {
    if (hasTriggeredTruthAll) return
    const allNames = Object.keys(truthClueMap)
    if (!allNames.every(n => truth1CompletedNames.includes(n))) return
    const allHiddenClues = Object.values(truthClueMap)
      .map(cfg => cfg.hiddenClue)
      .filter(Boolean)
    setUnlockedHiddenIds(prev => {
      const s = new Set(prev)
      allHiddenClues.forEach(id => s.add(id))
      return Array.from(s)
    })
    setIsJiangXiaoliTruth1Unlocked(true)
    const dialogLines = [
      { sender: 'user', text: '我已经知道真相了。', type: 'text' },
      { sender: 'death', text: '还挺快的，不过，我刚刚又复原了一部分线索，你可以去看看有什么遗漏的地方。', type: 'text' }
    ]
    setChatHistory(prev => {
      let nextId = prev.length + 1
      const appended = dialogLines.map(line => ({
        id: nextId++,
        sender: line.sender === 'death' ? 'death' : 'user',
        text: line.text,
        type: line.type
      }))
      return [...prev, ...appended]
    })
    setHasUnread(true)
    setHasTriggeredTruthAll(true)
  }, [truth1CompletedNames, hasTriggeredTruthAll, truthClueMap])

  // Room numbers
  const rooms = ['101', '102', '103', '201', '202', '203']

  return (
    <div className="app-container">
      {/* Start Screen */}
      {gameStatus === 'start' && (
        <div className="start-screen">
          <div className="story-text">
            你是一名灵异小说作家，最近因为没有素材很苦恼，这天，一个自称是“死神”的男人找了过来。他说有一家旅馆在昨天一夜之间起了大火，所有线索都被烧了干净，现在，他必须找到这旅馆中6个灵魂的身份和对应的死因才能把灵魂成功送入轮回。因为他还有别的业务要忙，所以找你来帮忙解决这件事，他会尝试还原大火前的旅馆（只能复原死物，不保证线索的完整度），你需要寻找线索找到所有人的身份和真正死因。
          </div>
          <button className="start-btn" onClick={handleStartGame}>
            开始游戏
          </button>
        </div>
      )}

      {/* Hotel Main Screen */}
      {(gameStatus === 'hotel' || gameStatus === 'room') && (
        <div className="hotel-screen">
          {/* Notification Toast */}
          {notification && (
            <div className="notification-toast">
              {notification}
            </div>
          )}

          {/* Left Sidebar: Inventory (Always visible in hotel & room203) */}
          <div className={`sidebar left-sidebar ${isLeftOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-content">
              <h2 className="sidebar-title">物品栏</h2>
              <div className="inventory-list">
                {inventory.length === 0 ? (
                  <div className="empty-tip">暂无收集的线索</div>
                ) : (
                  inventory.map((item, index) => (
                    /* 物品栏线索详情: Clickable Clue Card */
                    <div 
                      key={index} 
                      className="clue-card"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => setSelectedClue(item)}
                    >
                      {item.title}
                    </div>
                  ))
                )}
              </div>
            </div>
            <button 
              className="sidebar-toggle left-toggle" 
              onClick={() => setIsLeftOpen(!isLeftOpen)}
            >
              {isLeftOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Center Content: Switch between Hotel Doors and Room */}
          {gameStatus === 'hotel' ? (
            <div className="main-content">
              <h1 className="hotel-title">归宁旅馆</h1>
              <div className="room-grid">
                {rooms.map((room) => (
                  <div 
                    key={room} 
                    className={`door ${!unlockedRooms.includes(room) ? 'locked' : ''}`}
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className="room-number">{room}</div>
                    <div className="door-knob"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 房间界面 */
            <RoomManager 
              roomId={currentRoomId}
              onReturn={() => {
                setGameStatus('hotel')
                setCurrentRoomId(null)
              }}
              onCollect={handleGenericCollectClue}
              onShowDetail={(clue) => setSelectedClue(clue)}
              inventory={inventory}
              isTruth1Unlocked={isJiangXiaoliTruth1Unlocked}
              unlockedHiddenIds={unlockedHiddenIds}
            />
          )}

          {/* Right Sidebar: Truth Synthesis */}
          <div className={`sidebar right-sidebar ${isRightOpen ? 'open' : 'closed'}`}>
            <button 
              className="sidebar-toggle right-toggle" 
              onClick={() => setIsRightOpen(!isRightOpen)}
            >
              {isRightOpen ? '▶' : '◀'}
            </button>
            <div className="sidebar-content">
              <h2 className="sidebar-title">合成真相</h2>
              <div className="synthesis-form">
                <input 
                  type="text" 
                  className="name-input" 
                  placeholder="请输入人物姓名" 
                  value={synthesisName}
                  onChange={(e) => setSynthesisName(e.target.value)}
                />
                
                <div className="clue-drop-section">
                  <h3 className="section-subtitle">线索投入（需3个）</h3>
                  <div className="clue-drop-container">
                    {synthesisSlots.map((slot, index) => (
                      <div 
                        key={index} 
                        className={`clue-drop-box ${slot ? 'filled' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => slot && handleRemoveFromSlot(index)}
                        title={slot ? '点击移除' : ''}
                      >
                        {slot ? (
                          <div className="dropped-clue">
                            {slot.title}
                          </div>
                        ) : (
                          '拖入线索'
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button className="synthesize-btn" onClick={handleSynthesize}>合成真相</button>
              </div>
            </div>
          </div>

          {/* Floating Death Icon */}
          <div className="death-icon-container">
            <div 
              className="death-icon" 
              onClick={() => setIsDeathDialogOpen(!isDeathDialogOpen)}
            >
              {/* Red Dot Notification */}
              {hasUnread && !isDeathDialogOpen && <div className="notification-dot"></div>}
              
              <div className="skull-shape">
                <div className="skull-eyes"></div>
                <div className="skull-nose"></div>
                <div className="skull-teeth"></div>
              </div>
            </div>
            
            {/* Death Dialog */}
            {isDeathDialogOpen && (
              <div className="death-dialog">
                <div className="dialog-header">
                  <span className="dialog-title">与死神的对话</span>
                  <span 
                    className="close-btn" 
                    onClick={() => setIsDeathDialogOpen(false)}
                  >×</span>
                </div>
                <div className="dialog-content chat-content">
                  {displayedMessages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.sender}`}>
                      <div className="message-sender">{msg.sender === 'death' ? '死神' : '你'}</div>
                      <div className="message-bubble">
                        {msg.type === 'clue' ? (
                          <>
                            {msg.text}
                            <span 
                              className={isDeathClueCollected(msg.clueId) ? "collected-text" : "collectible-text"}
                              onClick={() => handleCollectClue(msg.clueId)}
                              title={isDeathClueCollected(msg.clueId) ? "已收集" : "点击收集线索"}
                            >
                              {isDeathClueCollected(msg.clueId) ? '【已收集】' : '【可收集】'}
                            </span>
                          </>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-area">
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="输入对话..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="send-btn" onClick={handleSendMessage}>发送</button>
                </div>
              </div>
            )}
          </div>

          {/* Verification Modal */}
          {selectedRoom && (
            <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
              <div className="modal-content verification-modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">身份验证 - {selectedRoom}</h3>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="请输入姓名"
                  value={verificationName}
                  onChange={(e) => setVerificationName(e.target.value)}
                />
                <div className="modal-actions">
                  <button className="modal-btn cancel" onClick={() => setSelectedRoom(null)}>取消</button>
                  <button className="modal-btn confirm" onClick={handleVerifyConfirm}>确认</button>
                </div>
              </div>
            </div>
          )}

          {/* Clue Detail Modal */}
          {selectedClue && (
            <div className="modal-overlay" onClick={() => setSelectedClue(null)}>
              <div className="modal-content clue-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">线索详情</h3>
                  <span className="close-btn" onClick={() => setSelectedClue(null)}>×</span>
                </div>
                <div className="modal-body">
                  <p className="detail-item">线索ID：{selectedClue.id}</p>
                  <p className="detail-item">线索内容：{selectedClue.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* Truth Result Modal */}
          {truthModal.open && (
            <div className="modal-overlay" onClick={() => setTruthModal({ open: false, title: '', content: '' })}>
              <div className="modal-content clue-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">{truthModal.title}</h3>
                  <span className="close-btn" onClick={() => setTruthModal({ open: false, title: '', content: '' })}>×</span>
                </div>
                <div className="modal-body">
                  <p className="detail-item">{truthModal.content}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default App
