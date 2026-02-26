import { useState, useEffect, useRef } from 'react'
import './App.css'
import RoomManager from './components/rooms/RoomManager'
import cluesData from './assets/clues.json'
import truthStories from './assets/truthStories.json'
import TruthFlashback from './components/TruthFlashback'

// Typewriter Component moved outside to prevent unmounting/remounting on every App render
const TypewriterText = ({ text, delay = 50, startDelay = 0, onComplete, forceComplete = false }) => {
  const [displayedText, setDisplayedText] = useState(forceComplete ? text : '')
  const [currentIndex, setCurrentIndex] = useState(forceComplete ? text.length : 0)
  const [isReady, setIsReady] = useState(forceComplete)

  // 监听 forceComplete 变化，确保文字立即显示且不被后续逻辑清空
  useEffect(() => {
    if (forceComplete) {
      setDisplayedText(text)
      setCurrentIndex(text.length)
      setIsReady(true)
    }
  }, [forceComplete, text])

  // 只有在非强制完成且 text 真正变化时才重置
  useEffect(() => {
    if (!forceComplete) {
      setDisplayedText('')
      setCurrentIndex(0)
      setIsReady(false)
      
      const startTimeout = setTimeout(() => {
        setIsReady(true)
      }, startDelay)
      return () => clearTimeout(startTimeout)
    }
  }, [text, startDelay]) // 注意这里去掉了 forceComplete，防止触发时闪烁

  useEffect(() => {
    if (forceComplete) return

    if (isReady && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1))
        setCurrentIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timeout)
    } else if (isReady && currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [isReady, currentIndex, delay, text, onComplete, forceComplete])

  return <span>{displayedText}</span>
}

function App() {
  const [gameStatus, setGameStatus] = useState(() => localStorage.getItem('gameStatus') || 'start')
  const [isStarting, setIsStarting] = useState(false)
  const [showStartBtn, setShowStartBtn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState(null)
  const [isLeftOpen, setIsLeftOpen] = useState(true)
  const [isRightOpen, setIsRightOpen] = useState(true)
  const [isDeathDialogOpen, setIsDeathDialogOpen] = useState(false)
  
  // State for Clue Collection
  const [clueCollected, setClueCollected] = useState(false)
  const [inventory, setInventory] = useState(() => JSON.parse(localStorage.getItem('inventory')) || [])
  const [notification, setNotification] = useState(null)
  const [selectedClue, setSelectedClue] = useState(null)
  
  // 203 Room States
  const [isJiangXiaoliTruth1Unlocked, setIsJiangXiaoliTruth1Unlocked] = useState(() => JSON.parse(localStorage.getItem('isJiangXiaoliTruth1Unlocked')) || false)
  const [unlockedHiddenIds, setUnlockedHiddenIds] = useState(() => JSON.parse(localStorage.getItem('unlockedHiddenIds')) || [])
  const [visitedRooms, setVisitedRooms] = useState(() => JSON.parse(localStorage.getItem('visitedRooms')) || [])
  const [hasTriggeredFiveCorpses, setHasTriggeredFiveCorpses] = useState(() => JSON.parse(localStorage.getItem('hasTriggeredFiveCorpses')) || false)
  const [hasTriggeredDialogue1_5, setHasTriggeredDialogue1_5] = useState(() => JSON.parse(localStorage.getItem('hasTriggeredDialogue1_5')) || false)
  const [canTriggerDialogue1_5, setCanTriggerDialogue1_5] = useState(() => JSON.parse(localStorage.getItem('canTriggerDialogue1_5')) || false)
  const [showGameTips, setShowGameTips] = useState(false)
  
  // State for Room Verification
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [verificationName, setVerificationName] = useState('')
  const [unlockedRooms, setUnlockedRooms] = useState(() => JSON.parse(localStorage.getItem('unlockedRooms')) || ['203'])
  
  // Synthesis State
  const [synthesisSlots, setSynthesisSlots] = useState([null, null, null])
  const [synthesisName, setSynthesisName] = useState('')
  const [truthFlashbackData, setTruthFlashbackData] = useState(null)
  const [truth1CompletedNames, setTruth1CompletedNames] = useState(() => JSON.parse(localStorage.getItem('truth1CompletedNames')) || [])
  const [truth2CompletedNames, setTruth2CompletedNames] = useState(() => JSON.parse(localStorage.getItem('truth2CompletedNames')) || [])
  const [hasTriggeredTruthAll, setHasTriggeredTruthAll] = useState(() => JSON.parse(localStorage.getItem('hasTriggeredTruthAll')) || false)
  const [hasTriggeredTruth2All, setHasTriggeredTruth2All] = useState(() => JSON.parse(localStorage.getItem('hasTriggeredTruth2All')) || false)
  const [finalChoice, setFinalChoice] = useState(null)

  // State for Death Dialog Chat
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chatHistory')) || [
    {
      id: 1,
      sender: 'death',
      text: '昨夜归宁旅馆起了一场大火，所有人都死在房间内。',
      type: 'clue',
      clueId: '死神 - 大火'
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

  // Auto-save useEffect
  useEffect(() => {
    localStorage.setItem('gameStatus', gameStatus === 'ending' ? 'hotel' : gameStatus) // Keep 'hotel' if refresh on ending
    localStorage.setItem('inventory', JSON.stringify(inventory))
    localStorage.setItem('isJiangXiaoliTruth1Unlocked', JSON.stringify(isJiangXiaoliTruth1Unlocked))
    localStorage.setItem('unlockedHiddenIds', JSON.stringify(unlockedHiddenIds))
    localStorage.setItem('visitedRooms', JSON.stringify(visitedRooms))
    localStorage.setItem('hasTriggeredFiveCorpses', JSON.stringify(hasTriggeredFiveCorpses))
    localStorage.setItem('hasTriggeredDialogue1_5', JSON.stringify(hasTriggeredDialogue1_5))
    localStorage.setItem('canTriggerDialogue1_5', JSON.stringify(canTriggerDialogue1_5))
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    localStorage.setItem('unlockedRooms', JSON.stringify(unlockedRooms))
    localStorage.setItem('truth1CompletedNames', JSON.stringify(truth1CompletedNames))
    localStorage.setItem('truth2CompletedNames', JSON.stringify(truth2CompletedNames))
    localStorage.setItem('hasTriggeredTruthAll', JSON.stringify(hasTriggeredTruthAll))
    localStorage.setItem('hasTriggeredTruth2All', JSON.stringify(hasTriggeredTruth2All))
  }, [gameStatus, inventory, isJiangXiaoliTruth1Unlocked, unlockedHiddenIds, visitedRooms, hasTriggeredFiveCorpses, hasTriggeredDialogue1_5, canTriggerDialogue1_5, chatHistory, unlockedRooms, truth1CompletedNames, truth2CompletedNames, hasTriggeredTruthAll, hasTriggeredTruth2All])

  const clearSave = () => {
    localStorage.clear()
    window.location.reload()
  }
  
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
  
  
  

  // Dragging State for Death Icon and Dialog
  const [iconPos, setIconPos] = useState({ x: 20, y: window.innerHeight - 80 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  const handleMouseDown = (e) => {
    // Start dragging from the icon container
    if (e.target.closest('.death-icon')) {
      setIsDragging(true)
      hasMoved.current = false
      const rect = e.currentTarget.getBoundingClientRect()
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        hasMoved.current = true
        setIconPos({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])
  
  // Handle message revealing effect
  useEffect(() => {
    if (isDeathDialogOpen) {
      setHasUnread(false)
      if (displayedMessages.length >= chatHistory.length) return
      
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => {
          if (prev.length < chatHistory.length) {
            return [...prev, chatHistory[prev.length]]
          }
          return prev
        })
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isDeathDialogOpen, chatHistory, displayedMessages.length])
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedMessages])
  
  const handleStartGame = () => {
    setIsStarting(true)
    setTimeout(() => {
      setIsLoading(true)
      setGameStatus('hotel')
      setIsStarting(false)
      
      // Simulate resource loading/initialization
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }, 1500)
  }

  const handleShowTips = () => {
  setShowGameTips(true)
  }

  /* 通用线索收集函数 */
  const handleGenericCollectClue = (clue) => {
    if (inventory.some(item => item.id === clue.clueId)) return
    const newClue = {
      id: clue.clueId,
      title: `${clue.clueName}`,
      content: clue.clueDesc,
      detail: clue.detail
    };
    setInventory(prev => {
      const newInventory = [...prev, newClue];
      
      // Trigger Dialogue 1.5 red dot after collecting specific clues
      const hasDuiBuQi = newInventory.some(item => item.id === '20101');
      const hasCheHuo = newInventory.some(item => item.id === '20105');
      const alreadyInChat = chatHistory.some(msg => msg.clueId === '死神 - 亡者复仇');
      
      if (!hasTriggeredDialogue1_5 && !canTriggerDialogue1_5 && hasDuiBuQi && hasCheHuo && !alreadyInChat) {
        setCanTriggerDialogue1_5(true);
        setHasUnread(true);
      }
      
      return newInventory;
    })
    
    setNotification(`已收集线索：${clue.clueName}`)
    setTimeout(() => setNotification(null), 3000)
  }
  
  /* 死神对话可收集 */
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
    
    const titleMap = { 'XS001': '死神 - 大火', 'XS002': '死神 - 亡者复仇' }
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
  
  const handleTriggerDialogue1_5 = () => {
    if (hasTriggeredDialogue1_5) return;
    setHasTriggeredDialogue1_5(true);
    setCanTriggerDialogue1_5(false);
    
    const dialogLines = [
      { sender: 'user', text: '还在吗？', type: 'text' },
      { sender: 'user', text: '这个灵魂……会不会是来复仇的？', type: 'text' },
      { sender: 'death', text: '亡者复仇的故事确实存在，但那个死去的灵魂仇恨必须很深才能影响到现实。', type: 'clue', clueId: '死神 - 亡者复仇' }
    ];
    
    setChatHistory(prevChat => {
      let nextId = prevChat.length + 1;
      const appended = dialogLines.map(line => ({
        id: nextId++,
        sender: line.sender,
        text: line.text,
        type: line.type,
        clueId: line.clueId
      }));
      return [...prevChat, ...appended];
    });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const newMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      text: inputValue,
      type: 'text'
    }
    
    setChatHistory(prev => [...prev, newMessage])
    setDisplayedMessages(prev => [...prev, newMessage])
    setInputValue('')
  }
  
  const handleRoomClick = (room) => {
    if (unlockedRooms.includes(room)) {
      setNotification(`进入房间 ${room}...`)
      setTimeout(() => {
        setNotification(null)
        setGameStatus('room')
        setCurrentRoomId(room)
        
        const roomCorpseMap = { '101': 0, '102': 1, '103': 2, '201': 1, '202': 1, '203': 2 }
        const hasCorpse = roomCorpseMap[room]
        
        setNotification(
          hasCorpse === 0 ? `提示：房间内无尸体` :
          hasCorpse === 1 ? `提示：房间内有一具男性尸体` :
          hasCorpse === 2 ? `提示：房间内有一具女性尸体` :
          ``
        )
        setTimeout(() => setNotification(null), 2000)
        
        if (!visitedRooms.includes(room)) {
          const newVisited = [...visitedRooms, room]
          setVisitedRooms(newVisited)
          const roomsAll = ['101', '102', '103', '201', '202', '203']
          
          if (!hasTriggeredFiveCorpses && roomsAll.every(r => newVisited.includes(r))) {
            const dialogLines = [
              { sender: 'death', text: '进展如何？', type: 'text' },
              { sender: 'user', text: '有一个问题，旅馆之中只有 5 具尸体。', type: 'text' },
              { sender: 'death', text: '奇怪，我明明抓到了 6 个灵魂来着……', type: 'text' },
              { sender: 'death', text: '……', type: 'text' },
              { sender: 'death', text: '哦，有一个灵魂是一周前的，没想到啊，藏了这么久。', type: 'text' }
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
  
  const normalizeClueId = (id) => {
    if (id === '死神 - 大火') return 'XS001'
    if (id === '死神 - 亡者复仇') return 'XS002'
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
      alert('需放入 3 条线索')
      return
    }
    const isTruth1 = arraysEqualAsSet(slotIds, config.truth1)
    const isTruth2 = arraysEqualAsSet(slotIds, config.truth2)
    
    if (!isTruth1 && !isTruth2) {
      alert('合成失败')
      return
    }
    
    const title = isTruth1 ? `【${name}-死亡真相】` : `【${name}-死亡真相 2】`
    const storyConfig = truthStories[name]
    const content = storyConfig
      ? (isTruth1 ? storyConfig.truth1Story : storyConfig.truth2Story)
      : '真相已还原'
    
    setTruthFlashbackData({ title, content })
    
    if (isTruth1) {
      setTruth1CompletedNames(prev => (prev.includes(name) ? prev : [...prev, name]))
    } else {
      setTruth2CompletedNames(prev => (prev.includes(name) ? prev : [...prev, name]))
    }
    
    setSynthesisSlots([null, null, null])
  }
  
  const getGroupedInventory = () => {
    const groups = {}
    inventory.forEach(item => {
      let groupKey = '其他'
      if (item.id.startsWith('XS')) groupKey = '死神线索'
      else if (/^\d{3}/.test(item.id)) groupKey = item.id.substring(0, 3) + '房间'
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(item)
    })
    return groups
  }
  
  const handleShowTruthReview = (name, type) => {
    const storyConfig = truthStories[name]
    if (!storyConfig) return
    const title = type === 1 ? `【${name}-死亡真相】` : `【${name}-死亡真相 2】`
    const content = type === 1 ? storyConfig.truth1Story : storyConfig.truth2Story
    setTruthFlashbackData({ title, content })
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
      { sender: 'user', text: '喂。', type: 'text' },
      { sender: 'user', text: '我已经知道真相了。', type: 'text' },
      { sender: 'death', text: '哦？怎样的真相？', type: 'text' },
      { sender: 'user', text: '……非异人作恶，非异人受苦报，自业自得果。', type: 'text' },
      { sender: 'user', text: '做过的事，总是要还的。', type: 'text' },
      { sender: 'death', text: '看来你挺有感触的。', type: 'text' },
      { sender: 'death', text: '我刚刚又复原了一部分线索，你可以去看看有什么遗漏的地方。', type: 'text' }
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

  useEffect(() => {
    if (hasTriggeredTruth2All) return
    const allNames = Object.keys(truthClueMap)
    if (!allNames.every(n => truth2CompletedNames.includes(n))) return

    const dialogLines = [
      { sender: 'user', text: '为什么……', type: 'text' },
      { sender: 'death', text: '看来，你有了新的发现。', type: 'text' },
      { sender: 'user', text: '我找到了一些新的线索，但这些线索指向的，是完全截然不同的故事。', type: 'text' },
      { sender: 'user', text: '我不明白，两种真相都说得通，到底哪个才是正确的？', type: 'text' },
      { sender: 'death', text: '不管真相是哪一种，对我来说都无所谓，只要能符合逻辑，我就可以交差了。', type: 'text' },
      { sender: 'death', text: '既然两种都能说通。', type: 'text' },
      { sender: 'death', text: '那你就选一种给我吧。', type: 'text' }
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
    setHasTriggeredTruth2All(true)
  }, [truth2CompletedNames, hasTriggeredTruth2All, truthClueMap])
  
  const handleFinalChoice = (choice) => {
    setFinalChoice(choice)
    setGameStatus('ending')
  }

  const handleReturnFromEnding = () => {
    setFinalChoice(null)
    setGameStatus('hotel')
  }

  const rooms = ['101', '102', '103', '201', '202', '203']
  
  // 辅助函数：生成灰烬粒子 (使用 memo 避免重渲染时位置跳变)
  const ashParticles = useRef([])
  if (ashParticles.current.length === 0) {
    for (let i = 0; i < 30; i++) {
      ashParticles.current.push({
        id: i,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 4 + 2}px`,
        height: `${Math.random() * 4 + 2}px`,
        duration: `${Math.random() * 5 + 5}s`,
        delay: `${Math.random() * 5}s`
      })
    }
  }

  const renderAshParticles = () => {
    return ashParticles.current.map(p => (
      <div 
        key={p.id} 
        className="ash" 
        style={{
          left: p.left,
          width: p.width,
          height: p.height,
          animationDuration: p.duration,
          animationDelay: p.delay
        }}
      />
    ))
  }

  return (
    <div className={`app-container ${isStarting ? 'game-starting' : ''}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在还原大火前的场景...</div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameStatus === 'start' && (
        <div className={`start-screen ${isStarting ? 'fade-out' : ''}`}>
          {/* 背景粒子与环境效果 */}
          <div className="ash-container">
            {renderAshParticles()}
          </div>
          <div className="fire-glow"></div>
          <div className="mist-overlay"></div>
          
          {/* 标题区域 */}
          <div className="title-wrapper">
            <h1 className="start-title">归宁旅馆</h1>
            <div className="start-subtitle">死亡档案 · 编号 2026-0223</div>
          </div>
          
          {/* 剧情文本区域 */}
          <div className="story-text">
            <p>
              <TypewriterText 
                text="你是一名灵异小说作家，最近因为没有素材很苦恼。" 
                delay={40}
                startDelay={1000}
                forceComplete={showStartBtn}
              />
            </p>
            <p>
              <TypewriterText 
                text="这天，一个自称是“死神”的男人找了过来。" 
                delay={40}
                startDelay={3000}
                forceComplete={showStartBtn}
              />
            </p>
            <p>
              <TypewriterText 
                text="他说有一家旅馆在昨天一夜之间起了大火，所有线索都被烧了干净，现在，他必须找到这旅馆中 6 个灵魂的身份和对应的死因才能把灵魂成功送入轮回。" 
                delay={40}
                startDelay={5000}
                forceComplete={showStartBtn}
              />
            </p>
            <p>
              <TypewriterText 
                text="因为他还有别的业务要忙，所以找你来帮忙解决这件事。" 
                delay={40}
                startDelay={9000}
                forceComplete={showStartBtn}
              />
            </p>
            <p>
              <TypewriterText 
                text="他会尝试还原大火前的旅馆，但只能复原死物，且不保证线索的完整度，你需要寻找线索找到所有人的身份和真正死因。" 
                delay={40}
                startDelay={12000}
                onComplete={() => {
                  setShowStartBtn(true);
                  setShowGameTips(true);
                }}
                forceComplete={showStartBtn}
              />
            </p>
          </div>
          
          {/* 开始按钮 */}
          <div className={`btn-container ${showStartBtn ? 'visible' : ''}`}>
            <button className="start-btn" onClick={handleStartGame}>
              接受委托
            </button>
          </div>

          {/* 跳过按钮 */}
          {!showStartBtn && (
            <div className="skip-btn" onClick={() => {
              setShowStartBtn(true);
              setShowGameTips(true);
            }}>
              跳过剧情
            </div>
          )}
        </div>
      )}

      {/* 游玩提示弹窗 - 移出 start-screen 容器，防止布局干扰 */}
      {showGameTips && (
        <div className="modal-overlay tips-modal-overlay">
          <div className="modal-content tips-modal-content">
            <h3 className="modal-title">游玩提示</h3>
            <div className="tips-list">
              <p>1.主要玩法是收集线索合成真相，每个真相需要 3 个线索碎片；</p>
              <p>2.一般情况下，1 个线索碎片仅对应 1 个人；</p>
              <p>3.旅馆房间需要输入对应住户名称解锁，203 未上锁；</p>
              <p>4.房间内可交互物品点击会有提示，收集的线索会在右侧线索栏展示。</p>
            </div>
            <button className="modal-btn confirm" onClick={() => setShowGameTips(false)}>
              我已知晓
            </button>
          </div>
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
          
          {/* Left Sidebar: Inventory */}
          <div className={`sidebar left-sidebar ${isLeftOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-content">
              <h2 className="sidebar-title">物品栏</h2>
              <div className="inventory-list">
                {inventory.length === 0 ? (
                  <div className="empty-tip">暂无收集的线索</div>
                ) : (
                  Object.entries(getGroupedInventory()).map(([groupName, items]) => (
                    <div key={groupName} className="inventory-group">
                      <h3 className="inventory-group-title">{groupName}</h3>
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="clue-card"
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, item)}
                          onClick={() => setSelectedClue(item)}
                        >
                          {item.title}
                        </div>
                      ))}
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
              {/* Final Choice Prompt (Appears after Truth 2 All and dialogue complete) */}
              {hasTriggeredTruth2All && !finalChoice && displayedMessages.length >= chatHistory.length && (
                <div className="final-choice-overlay">
                    <div className="final-choice-content">
                        <h2 className="final-choice-title">最终的抉择</h2>
                        <p className="final-choice-desc">死神正在等待你的答案。大火烧尽了一切，唯有你的笔尖能决定他们的终局。</p>
                        <div className="final-choice-buttons">
                            <button className="final-btn choice-1" onClick={() => handleFinalChoice('truth1')}>
                                提交【真相1】
                                <span className="btn-subtext">真相 1：执念造就的因果</span>
                            </button>
                            <button className="final-btn choice-2" onClick={() => handleFinalChoice('truth2')}>
                                提交【真相2】
                                <span className="btn-subtext">真相 2：无可奈何的意外</span>
                            </button>
                        </div>
                    </div>
                </div>
              )}
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
              <div className="hotel-controls">
                <button className="clear-save-btn" onClick={clearSave}>清除所有存档</button>
                <button className="clear-save-btn" onClick={handleShowTips} style={{ marginLeft: '1rem' }}>
                  游玩提示
                </button>
              </div>
            </div>
          ) : (
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
                  <h3 className="section-subtitle">线索投入（需 3 个）</h3>
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
              
              {/* Truth Review Section */}
              {(truth1CompletedNames.length > 0 || truth2CompletedNames.length > 0) && (
                <div className="truth-review-section">
                  <h2 className="sidebar-title" style={{ marginTop: '2rem' }}>已还原真相</h2>
                  <div className="truth-list">
                    {truth1CompletedNames.map(name => (
                      <button
                        key={`${name}-1`}
                        className="truth-review-btn"
                        onClick={() => handleShowTruthReview(name, 1)}
                      >
                        {name} - 真相
                      </button>
                    ))}
                    {truth2CompletedNames.map(name => (
                      <button
                        key={`${name}-2`}
                        className="truth-review-btn"
                        onClick={() => handleShowTruthReview(name, 2)}
                      >
                        {name} - 真相 2
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Floating Death Icon */}
          <div 
            className={`death-icon-container ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            style={{
              left: `${iconPos.x}px`,
              top: `${iconPos.y}px`,
              position: 'fixed'
            }}
          >
              <div
                className="death-icon"
                onClick={() => {
                  // Only toggle if we haven't been dragging
                  if (!hasMoved.current) {
                    setIsDeathDialogOpen(!isDeathDialogOpen)
                  }
                }}
              >
                {(hasUnread || canTriggerDialogue1_5) && !isDeathDialogOpen && <div className="notification-dot"></div>}
              
              <div className="skull-shape">
                <div className="skull-eyes"></div>
                <div className="skull-nose"></div>
                <div className="skull-teeth"></div>
              </div>
            </div>
          </div>
            
          {/* Death Dialog */}
          {isDeathDialogOpen && (
            <div 
              className="death-dialog"
              style={{
                left: `${iconPos.x}px`,
                top: `${iconPos.y - 460}px`, // Fixed offset above the icon
                position: 'fixed'
              }}
            >
              <div className="dialog-header">
                <span className="dialog-title">与死神的对话</span>
                <span
                  className="close-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeathDialogOpen(false)
                  }}
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
                {displayedMessages.length < chatHistory.length && chatHistory[displayedMessages.length].sender === 'death' && (
                  <div className="chat-message death thinking">
                    <div className="message-sender">死神</div>
                    <div className="message-bubble">
                      ...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 对话触发选项 */}
              {canTriggerDialogue1_5 && (displayedMessages.length >= chatHistory.length) && (
                <div className="dialog-options">
                  <button 
                    className="dialog-option-btn" 
                    onClick={handleTriggerDialogue1_5}
                  >
                    一周前的灵魂难道是来复仇的？（点击发送）
                  </button>
                </div>
              )}

              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="输入对话..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking input
                />
                <button 
                  className="send-btn" 
                  onClick={handleSendMessage}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking button
                >发送</button>
              </div>
            </div>
          )}
          
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
                  <p className="detail-item">线索 ID：{selectedClue.id}</p>
                  <p className="detail-item">线索内容：{selectedClue.content}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Truth Flashback Overlay */}
          {truthFlashbackData && (
            <TruthFlashback
              title={truthFlashbackData.title}
              content={truthFlashbackData.content}
              onClose={() => setTruthFlashbackData(null)}
            />
          )}
        </div>
      )}

      {/* Ending Screen */}
      {gameStatus === 'ending' && (
        <div className="ending-screen">
          <div className="ash-container">
            {renderAshParticles()}
          </div>
          <div className="ending-content">
            <h1 className="ending-title">结案：{finalChoice === 'truth1' ? '罪恶与惩罚' : '遗憾与安宁'}</h1>
            <div className="ending-text">
              {finalChoice === 'truth1' ? (
                <>
                  <p><TypewriterText text="死神走了，带着那份充满罪恶的档案。" delay={50} startDelay={500} /></p>
                  <p><TypewriterText text="蒋晓丽是杀人犯，许鹤是谋杀者，邹良生是勒索者……" delay={50} startDelay={2500} /></p>
                  <p><TypewriterText text="这是一个完美的悬疑故事，有动机，有手法，有人性的黑暗。" delay={50} startDelay={5500} /></p>
                  <p><TypewriterText text="我知道，这可能不是真相。" delay={50} startDelay={9000} /></p>
                  <p><TypewriterText text="也许蒋晓丽只是想去拿灭火器，也许许鹤只是过度自责，也许邹良生只是来还钱。" delay={50} startDelay={11000} /></p>
                  <p><TypewriterText text="但谁在乎呢？大火烧尽了一切，死人无法辩解。" delay={50} startDelay={15500} /></p>
                  <p><TypewriterText text="我最初只是为了找素材才接下这个委托。" delay={50} startDelay={18500} /></p>
                  <p><TypewriterText text="现在，我得到了最好的素材。" delay={50} startDelay={21000} /></p>
                </>
              ) : (
                <>
                  <p><TypewriterText text="死神走了，带着那份充满遗憾的档案。" delay={50} startDelay={500} /></p>
                  <p><TypewriterText text="蒋晓丽是善良的母亲，许鹤是自责的朋友，邹良生是知恩图报的陌生人……" delay={50} startDelay={2500} /></p>
                  <p><TypewriterText text="这是一个平淡的悲剧故事，没有反转，只有无奈和意外。" delay={50} startDelay={6500} /></p>
                  <p><TypewriterText text="我知道，这可能也不是真相。" delay={50} startDelay={10000} /></p>
                  <p><TypewriterText text="也许他们真的犯过罪，真的有过恶念，真的互相伤害过。" delay={50} startDelay={12000} /></p>
                  <p><TypewriterText text="但谁在乎呢？大火烧尽了一切，死人需要安宁。" delay={50} startDelay={15500} /></p>
                  <p><TypewriterText text="我最初只是为了找素材才接下这个委托。" delay={50} startDelay={18500} /></p>
                  <p><TypewriterText text="现在，我亲手毁掉了最好的素材。" delay={50} startDelay={21000} /></p>
                  <p><TypewriterText text="但当我写下“意外”二字时，我仿佛看到他们松了一口气。" delay={50} startDelay={23500} /></p>
                  <p><TypewriterText text="归宁旅馆的火灭了，记忆随风逝去。" delay={50} startDelay={27000} /></p>
                  <p><TypewriterText text="愿你们在另一个世界安好。" delay={50} startDelay={30000} /></p>
                </>
              )}
            </div>
            <div className="ending-actions">
              <button className="restart-btn" onClick={handleReturnFromEnding}>返回</button>
              <button className="restart-btn secondary" onClick={clearSave}>清除存档并重置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
