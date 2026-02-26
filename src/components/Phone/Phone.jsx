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
  albumData = [],
  showHiddenApps = false
}) => {
  const [isLocked, setIsLocked] = useState(true)
  const [inputPassword, setInputPassword] = useState('')
  const [currentApp, setCurrentApp] = useState(null)
  const [showAlbum, setShowAlbum] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showMoments, setShowMoments] = useState(false) // 是否显示朋友圈

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
    setIsLocked(true)
    setCurrentApp(null)
    setShowAlbum(false)
    setShowMoments(false) // 重置朋友圈状态
    setInputPassword('')
    onClose()
  }

  // 打开应用
  const handleAppClick = (app) => {
    if (app === 'album') {
      if (!showHiddenApps) return
      setShowAlbum(true)
      return
    }
    setCurrentApp(app)
    setShowMoments(false) // 打开应用时关闭朋友圈
  }

  // 微信：打开朋友圈
  const handleOpenMoments = () => {
    setShowMoments(true)
  }

  if (!isOpen) return null

  // 应用图标配置
  const appIcons = {
    wechat: { emoji: '💬', name: '微信', color: 'linear-gradient(135deg, #07c160 0%, #06ad56 100%)' },
    news: { emoji: '📰', name: '新闻', color: 'linear-gradient(135deg, #ff2d55 0%, #ff3b30 100%)' },
    drive: { emoji: '🗺️', name: '行车记录', color: 'linear-gradient(135deg, #007aff 0%, #0056b3 100%)' },
    album: { emoji: '🖼️', name: '相册', color: 'linear-gradient(135deg, #ff9500 0%, #ff6b00 100%)' }
  }

  return (
    <div className="phone-overlay" onClick={handleClose}>
      <div className="phone-container" onClick={e => e.stopPropagation()}>
        {/* 手机外壳 */}
        <div className="phone-frame">
          {/* 听筒 */}
          <div className="phone-earpiece"></div>
          {/* 前置摄像头 */}
          <div className="phone-camera"></div>
          
          {/* 屏幕区域 */}
          <div className="phone-screen">
            {/* 锁屏界面 */}
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
              /* 主屏幕/应用界面 */
              <div className="phone-home-screen">
                {/* 状态栏 */}
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

                {/* 应用界面 */}
                {!currentApp && !showAlbum ? (
                  /* 主屏幕 - 应用图标 */
                  <div className="app-grid">
                    {apps.map(app => {
                      // 相册需要隐藏线索解锁才显示
                      if (app === 'album' && !showHiddenApps) return null
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
                ) : showAlbum ? (
                  /* 相册界面 */
                  <div className="album-interface">
                    <div className="app-header">
                      <button className="app-back-btn" onClick={() => setShowAlbum(false)}>
                        ← 返回
                      </button>
                      <span className="app-title">相册</span>
                      <div className="app-header-spacer"></div>
                    </div>
                    <div className="album-grid">
                      {albumData.map((img, idx) => (
                        <div key={idx} className="album-item">
                          <div className="album-thumbnail">
                            <img src={img.src || img} alt={img.caption || `图片 ${idx + 1}`} />
                          </div>
                          {img.caption && (
                            <div className="album-caption">{img.caption}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* 应用内容 */
                  <div className="app-content">
                    {/* 返回按钮 */}
                    <div className="app-header">
                      <button className="app-back-btn" onClick={() => {
                        if (currentApp === 'wechat' && showMoments) {
                          setShowMoments(false)
                        } else {
                          setCurrentApp(null)
                        }
                      }}>
                        ← 返回
                      </button>
                      <span className="app-title">
                        {currentApp === 'wechat' && (showMoments ? '朋友圈' : '微信')}
                        {currentApp === 'news' && '新闻'}
                        {currentApp === 'drive' && '行车记录'}
                      </span>
                      {currentApp === 'wechat' && !showMoments ? (
                        <button 
                          className="app-back-btn" 
                          style={{ padding: 0, width: '50px' }}
                          onClick={handleOpenMoments}
                        >
                          朋友圈
                        </button>
                      ) : (
                        <div className="app-header-spacer"></div>
                      )}
                    </div>

                    {/* 微信主界面 */}
                    {currentApp === 'wechat' && !showMoments && (
                      <div className="wechat-interface">
                        <div className="wechat-chat-list">
                          {chatData.contacts.map((contact, idx) => (
                            <div 
                              key={idx} 
                              className="wechat-chat-item no-click"
                            >
                              <div className="wechat-avatar">{contact.avatar}</div>
                              <div className="wechat-chat-info">
                                <div className="wechat-chat-name">{contact.name}</div>
                                <div className="wechat-chat-last">
                                  {contact.messages?.length > 0 
                                    ? contact.messages[contact.messages.length - 1].text 
                                    : '暂无消息'}
                                </div>
                              </div>
                              <div className="wechat-chat-time">
                                {contact.messages?.length > 0 
                                  ? contact.messages[contact.messages.length - 1].time 
                                  : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 微信朋友圈界面 */}
                    {currentApp === 'wechat' && showMoments && (
                      <div className="wechat-moments-interface">
                        {chatData.moments.map((moment, idx) => (
                          <div key={idx} className="moments-item">
                            <div className="moments-time">{moment.time}</div>
                            <div className="moments-text">{moment.text}</div>
                            <div className="moments-interact">
                              <span className="moments-like">{moment.likes}</span>
                              <span className="moments-comment">{moment.comments}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 新闻界面 */}
                    {currentApp === 'news' && (
                      <div className="news-interface">
                        {newsData.map((news, idx) => (
                          <div key={idx} className="news-item">
                            <div className="news-title">{news.title}</div>
                            <div className="news-time">{news.time}</div>
                            <div className="news-content">{news.content}</div>
                            {news.update && (
                              <div className="news-update">
                                <strong>更新：</strong>{news.update}
                              </div>
                            )}
                          </div>
                        ))}
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
                      </div>
                    )}
                  </div>
                )}

                {/* 底部 Home 条 */}
                <div className="phone-home-bar" onClick={() => {
                  setCurrentApp(null)
                  setActiveContact(null)
                  setShowAlbum(false)
                  setShowMoments(false)
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