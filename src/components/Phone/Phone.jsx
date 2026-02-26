import React, { useState, useEffect } from 'react'
import './Phone.css'

const Phone = ({
  isOpen,
  onClose,
  password,
  passwordHint,
  apps = ['wechat'],
  chatData = { contacts: [], moments: [] },
  newsData = [],
  driveData = null,
  inventory = [],
  onCollect,
  isLocked: externalIsLocked,
  setIsLocked: externalSetIsLocked
}) => {
  const [internalIsLocked, setInternalIsLocked] = useState(true)
  const [inputPassword, setInputPassword] = useState('')
  
  // 决定使用外部状态还是内部状态
  const isLocked = externalIsLocked !== undefined ? externalIsLocked : (password ? internalIsLocked : false)
  const setIsLocked = externalSetIsLocked || setInternalIsLocked

  const [currentApp, setCurrentApp] = useState(null)
  const [activeContact, setActiveContact] = useState(null)
  const [wechatTab, setWechatTab] = useState('chat') // 'chat' or 'moments'
  const [currentTime, setCurrentTime] = useState(new Date())
  const [collectedInPhone, setCollectedInPhone] = useState([])

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 处理密码提交
  const handlePasswordSubmit = () => {
    if (inputPassword === password) {
      setIsLocked(false)
      setInputPassword('')
    } else {
      alert('密码错误')
      setInputPassword('')
    }
  }

  // 处理按键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit()
    }
  }

  // 关闭手机
  const handleClose = () => {
    setCurrentApp(null)
    setActiveContact(null)
    setWechatTab('chat')
    setInputPassword('')
    onClose()
  }

  // 打开应用
  const handleAppClick = (app) => {
    setCurrentApp(app)
    setWechatTab('chat')
  }

  // 检查是否已收集
  const isCollected = (id) => {
    return inventory.some(item => item.id === id) || collectedInPhone.includes(id)
  }

  // 处理手机内收集
  const handlePhoneCollect = (e, clue) => {
    e.stopPropagation()
    if (!clue || isCollected(clue.clueId)) return
    onCollect(clue)
    setCollectedInPhone([...collectedInPhone, clue.clueId])
  }

  if (!isOpen) return null

  // 应用图标配置（✅ 移除相册）
  const appIcons = {
    wechat: { emoji: '💬', name: '微信', color: 'linear-gradient(135deg, #07c160 0%, #06ad56 100%)' },
    news: { emoji: '📰', name: '新闻', color: 'linear-gradient(135deg, #ff2d55 0%, #ff3b30 100%)' },
    drive: { emoji: '🗺️', name: '行车记录', color: 'linear-gradient(135deg, #007aff 0%, #0056b3 100%)' }
  }

  return (
    <div className="phone-overlay" onClick={handleClose}>
      <div className="phone-container" onClick={e => e.stopPropagation()}>
        <div className="phone-frame">
          <div className="phone-earpiece"></div>
          <div className="phone-camera"></div>
          
          <div className="phone-screen">
            {isLocked ? (
              <div className="phone-lock-screen">
                <div className="lock-time">
                  {currentTime.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                  })}
                </div>
                <div className="lock-date">
                  {currentTime.toLocaleDateString('zh-CN', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
                <div className="lock-hint">{passwordHint}</div>
                <input
                  type="password"
                  className="lock-password-input"
                  placeholder="密码"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <button className="lock-unlock-btn" onClick={handlePasswordSubmit}>
                  解锁
                </button>
              </div>
            ) : (
              <div className="phone-home-screen">
                <div className="phone-status-bar">
                  <span className="status-carrier">中国移动</span>
                  <span className="status-time">
                    {currentTime.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false
                    })}
                  </span>
                  <div className="status-icons">
                    <span className="icon-signal">📶</span>
                    <span className="icon-wifi">📶</span>
                    <span className="icon-battery">🔋</span>
                  </div>
                </div>

                {!currentApp ? (
                  <div className="app-grid">
                    {apps.map(app => {
                      const icon = appIcons[app]
                      return (
                        <div 
                          key={app} 
                          className={`app-icon ${app}-icon`}
                          onClick={() => handleAppClick(app)}
                        >
                          <div className="app-icon-bg" style={{ background: icon.color }}>
                            {icon.emoji}
                          </div>
                          <span className="app-name">{icon.name}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="app-content">
                    <div className="app-header">
                      <button className="app-back-btn" onClick={() => {
                        setCurrentApp(null)
                        setActiveContact(null)
                      }}>
                        ← 返回
                      </button>
                      <span className="app-title">
                        {currentApp === 'wechat' && '微信'}
                        {currentApp === 'news' && '新闻'}
                        {currentApp === 'drive' && '行车记录'}
                      </span>
                      <div className="app-header-spacer"></div>
                    </div>

                    {/* 微信界面 */}
                    {currentApp === 'wechat' && (
                      <div className="wechat-interface">
                        {!activeContact ? (
                          <>
                            {wechatTab === 'chat' ? (
                              <div className="chat-list">
                                {chatData.contacts?.map((contact, idx) => {
                                  const clue = contact.clueId ? { 
                                    clueId: contact.clueId, 
                                    clueName: contact.clueName || contact.name, 
                                    clueDesc: contact.messages[contact.messages.length - 1]?.text 
                                  } : null
                                  
                                  const collected = isCollected(contact.clueId);

                                  return (
                                    <div key={idx} className="chat-contact-container">
                                      <div 
                                        className="chat-contact"
                                        onClick={() => setActiveContact(contact)}
                                      >
                                        <div className="contact-avatar">
                                          {contact.name.charAt(0)}
                                        </div>
                                        <div className="contact-info">
                                          <span className="contact-name">{contact.name}</span>
                                          <span className="contact-last-message">
                                            {contact.messages[contact.messages.length - 1]?.text.substring(0, 20)}...
                                          </span>
                                        </div>
                                      </div>
                                      {contact.isCollectable && clue && (
                                        collected ? (
                                          <div className="phone-collected-status chat-status">已收集“{clue.clueName}”线索</div>
                                        ) : (
                                          <div 
                                            className="phone-collect-tag chat-tag"
                                            onClick={(e) => handlePhoneCollect(e, clue)}
                                          >
                                            【可收集】
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="moments-interface">
                                <div className="moments-header">
                                  <div className="moments-header-bg"></div>
                                  <div className="moments-user-profile">
                                    <span className="profile-name">我</span>
                                    <div className="profile-avatar">我</div>
                                  </div>
                                </div>
                                <div className="moments-list">
                                  {chatData.moments?.map((moment, idx) => {
                                    const clue = moment.clueId ? { 
                                      clueId: moment.clueId, 
                                      clueName: moment.clueName || '朋友圈线索', 
                                      clueDesc: moment.text 
                                    } : null
                                    
                                    const collected = isCollected(moment.clueId);

                                    return (
                                      <div key={idx} className="moments-post">
                                        <div className="moments-user">
                                          <div className="moments-avatar">👤</div>
                                          <div className="moments-info">
                                            <span className="moments-name">我</span>
                                            <span className="moments-time">{moment.time}</span>
                                          </div>
                                        </div>
                                        <div className="moments-content">
                                          {moment.text}
                                        </div>
                                        <div className="moments-actions">
                                          <span className="moments-like">❤️ {moment.likes}</span>
                                          <span className="moments-comment">💬 {moment.comments}</span>
                                        </div>
                                        {moment.isCollectable && clue && (
                                          collected ? (
                                            <div className="phone-collected-status">已收集“{clue.clueName}”线索</div>
                                          ) : (
                                            <div 
                                              className="phone-collect-tag"
                                              onClick={(e) => handlePhoneCollect(e, clue)}
                                            >
                                              【可收集】
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* 微信底部导航栏 */}
                            <div className="wechat-tab-bar">
                              <div 
                                className={`wechat-tab-item ${wechatTab === 'chat' ? 'active' : ''}`}
                                onClick={() => setWechatTab('chat')}
                              >
                                <span className="tab-icon">💬</span>
                                <span className="tab-text">微信</span>
                              </div>
                              <div 
                                className={`wechat-tab-item ${wechatTab === 'moments' ? 'active' : ''}`}
                                onClick={() => setWechatTab('moments')}
                              >
                                <span className="tab-icon">⭕</span>
                                <span className="tab-text">朋友圈</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="chat-detail">
                            <div className="chat-messages">
                              {activeContact.messages.map((msg, idx) => (
                                <div key={idx} className={`chat-message ${msg.type}`}>
                                  <div className="message-avatar">
                                    {msg.type === 'received' ? activeContact.name.charAt(0) : '我'}
                                  </div>
                                  <div className="message-content">
                                    <div className="message-bubble">
                                      {msg.text}
                                    </div>
                                    <div className="message-time">{msg.time}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 新闻界面 - 集成收集逻辑 */}
                    {currentApp === 'news' && (
                      <div className="news-interface">
                        {newsData.map((news, idx) => {
                          const clue = news.clueId ? { 
                            clueId: news.clueId, 
                            clueName: news.clueName || news.title, 
                            clueDesc: news.content 
                          } : null
                          
                          const collected = isCollected(news.clueId);

                          return (
                            <div key={idx} className="news-item">
                              <div className="news-title">{news.title}</div>
                              <div className="news-time">{news.time}</div>
                              <div className="news-content">{news.content}</div>
                              {news.update && (
                                <div className="news-update">
                                  <strong>更新：</strong>{news.update}
                                </div>
                              )}
                              {news.isCollectable && clue && (
                                collected ? (
                                  <div className="phone-collected-status">已收集“{clue.clueName}”线索</div>
                                ) : (
                                  <div 
                                    className="phone-collect-tag"
                                    onClick={(e) => handlePhoneCollect(e, clue)}
                                  >
                                    【可收集】
                                  </div>
                                )
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* 行车记录界面 */}
                    {currentApp === 'drive' && driveData && (
                      <div className="drive-interface">
                        <div className="drive-map">
                          <div className="drive-route">
                            <div className="route-point start">📍 {driveData.route.split('→')[0]}</div>
                            <div className="route-line"></div>
                            <div className="route-point end">📍 {driveData.route.split('→')[1]}</div>
                          </div>
                        </div>
                        <div className="drive-info">
                          <div className="drive-date">📅 {driveData.date}</div>
                          <div className="drive-note">{driveData.note}</div>
                        </div>
                        {driveData.isCollectable && driveData.clueId && (
                          isCollected(driveData.clueId) ? (
                            <div className="phone-collected-status">已收集“{driveData.clueName || '行车记录'}”线索</div>
                          ) : (
                            <div 
                              className="phone-collect-tag"
                              onClick={(e) => handlePhoneCollect(e, { 
                                clueId: driveData.clueId, 
                                clueName: driveData.clueName || '行车记录', 
                                clueDesc: driveData.note 
                              })}
                            >
                              【可收集】
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="phone-home-bar" onClick={() => {
                  setCurrentApp(null)
                  setActiveContact(null)
                }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Phone