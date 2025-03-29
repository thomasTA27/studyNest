"use client"

import React, { useState, useEffect, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import "./pomodoro-widget.css"

// Mock socket implementation - replace with actual socket.io implementation
const mockSocket = {
  emit: (event, data) => {
    console.log(`Emitted ${event}:`, data)
  },
  on: (event, callback) => {
    console.log(`Listening to ${event}`)
    // For demo purposes, we'll simulate some events
    if (event === "userJoined") {
      setTimeout(() => {
        callback({ username: "Jane", sessionId: "demo-session" })
      }, 2000)
    }
    if (event === "emojiReaction") {
      setTimeout(() => {
        callback({ emoji: "👍", username: "John" })
      }, 3000)
    }
  },
  disconnect: () => {
    console.log("Disconnected from socket")
  },
}

const DEFAULT_TIMES = {
  work: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
}

const EMOJIS = ["👍", "👏", "🎉", "💪", "🔥", "⚡", "🧠", "☕"]

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.work)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState("work")
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [username, setUsername] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [sessionName, setSessionName] = useState("")
  const [recentEmojis, setRecentEmojis] = useState([])
  const [showSessionControls, setShowSessionControls] = useState(false)
  const [activeTab, setActiveTab] = useState("create")

  const timerRef = useRef(null)
  const audioRef = useRef(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")

    // Cleanup on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (sessionInfo) {
        mockSocket.disconnect()
      }
    }
  }, [])

  // Socket event listeners
  useEffect(() => {
    if (sessionInfo) {
      mockSocket.on("userJoined", (data) => {
        showToast("New friend joined!", `${data.username} joined your nest`)

        setSessionInfo((prev) => {
          if (!prev) return null
          return {
            ...prev,
            participants: [...prev.participants, { id: uuidv4(), name: data.username }],
          }
        })
      })

      mockSocket.on("emojiReaction", (data) => {
        handleEmojiReceived(data.emoji, data.username)
      })
    }
  }, [sessionInfo])

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current)
            playNotification()
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive])

  const showToast = (title, message) => {
    // Simple toast implementation
    const toast = document.createElement("div")
    toast.className = "toast"
    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    `
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("show")
    }, 100)

    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  const handleTimerComplete = () => {
    if (mode === "work") {
      setCompletedPomodoros((prev) => prev + 1)

      // After 4 pomodoros, take a long break
      if ((completedPomodoros + 1) % 4 === 0) {
        setMode("longBreak")
        setTimeLeft(DEFAULT_TIMES.longBreak)
      } else {
        setMode("shortBreak")
        setTimeLeft(DEFAULT_TIMES.shortBreak)
      }

      showToast("Break time!", "Great job! Take a well-deserved break.")
    } else {
      // After a break, go back to work
      setMode("work")
      setTimeLeft(DEFAULT_TIMES.work)

      showToast("Back to work!", "Break's over. Let's get back to being productive!")
    }

    setIsActive(false)
  }

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Error playing notification:", err))
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(DEFAULT_TIMES[mode])
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const createSession = () => {
    if (!username || !sessionName) return

    const newSessionId = uuidv4().slice(0, 8)
    const newSession = {
      id: newSessionId,
      name: sessionName,
      participants: [{ id: uuidv4(), name: username }],
      createdBy: username,
    }

    setSessionInfo(newSession)
    setShowSessionControls(false)

    // In a real implementation, you would emit this to the server
    mockSocket.emit("createSession", newSession)

    showToast("Nest created!", `Your nest ID is ${newSessionId}. Invite your study buddies!`)
  }

  const joinSession = () => {
    if (!username || !sessionId) return

    // In a real implementation, you would verify this with the server
    mockSocket.emit("joinSession", { sessionId, username })

    // For demo purposes, we'll create a mock session
    setSessionInfo({
      id: sessionId,
      name: "Study Nest",
      participants: [
        { id: uuidv4(), name: "Host" },
        { id: uuidv4(), name: username },
      ],
      createdBy: "Host",
    })

    setShowSessionControls(false)

    showToast("Joined the nest!", "You've successfully joined the study session!")
  }

  const sendEmoji = (emoji) => {
    if (!sessionInfo) return

    mockSocket.emit("emojiReaction", {
      sessionId: sessionInfo.id,
      emoji,
      username: username,
    })

    handleEmojiReceived(emoji, username)
  }

  const handleEmojiReceived = (emoji, fromUsername) => {
    const newEmoji = {
      emoji,
      username: fromUsername,
      timestamp: Date.now(),
    }

    setRecentEmojis((prev) => [newEmoji, ...prev].slice(0, 3))

    // Animate the emoji
    const emojiElement = document.createElement("div")
    emojiElement.innerText = emoji
    emojiElement.className = "floating-emoji"
    emojiElement.style.left = `${Math.random() * 80 + 10}%`
    document.getElementById("emoji-container")?.appendChild(emojiElement)

    setTimeout(() => {
      emojiElement.remove()
    }, 2000)
  }

  return (
    <><div className="study-nest-widget"></div><div className="widget-container">
      <div className="widget-header">
        <div className="header-left">
          <span className="widget-logo">🐦</span>
          <h2 className="widget-title">Study Nest</h2>
        </div>

        {sessionInfo && (
          <div className="session-badge">
            <span className="participant-count">{sessionInfo.participants.length}</span>
            <span className="participant-icon">👥</span>
          </div>
        )}
      </div>

      <div className="timer-section">
        <div className={`timer-display ${mode === "work" ? "work-mode" : "break-mode"} ${isActive ? "active" : ""}`}>
          <span className="time-text">{formatTime(timeLeft)}</span>
        </div>

        <div className="mode-buttons">
          <button
            className={`mode-button ${mode === "work" ? "active" : ""}`}
            onClick={() => {
              setMode("work")
              setTimeLeft(DEFAULT_TIMES.work)
              setIsActive(false)
            } }
          >
            Work
          </button>
          <button
            className={`mode-button ${mode === "shortBreak" ? "active" : ""}`}
            onClick={() => {
              setMode("shortBreak")
              setTimeLeft(DEFAULT_TIMES.shortBreak)
              setIsActive(false)
            } }
          >
            Short
          </button>
          <button
            className={`mode-button ${mode === "longBreak" ? "active" : ""}`}
            onClick={() => {
              setMode("longBreak")
              setTimeLeft(DEFAULT_TIMES.longBreak)
              setIsActive(false)
            } }
          >
            Long
          </button>
        </div>

        <div className="control-buttons">
          <button className={`control-button ${isActive ? "pause" : "play"}`} onClick={toggleTimer}>
            {isActive ? "⏸️" : "▶️"}
          </button>
          <button className="control-button reset" onClick={resetTimer}>
            🔄
          </button>
        </div>
      </div>

      {!sessionInfo ? (
        <div className="session-section">
          {!showSessionControls ? (
            <div className="session-create">
              <button className="create-session-button" onClick={() => setShowSessionControls(true)}>
                Create or Join Nest
              </button>
            </div>
          ) : (
            <div className="session-tabs">
              <div className="tabs-header">
                <button
                  className={`tab-button ${activeTab === "create" ? "active" : ""}`}
                  onClick={() => setActiveTab("create")}
                >
                  Create
                </button>
                <button
                  className={`tab-button ${activeTab === "join" ? "active" : ""}`}
                  onClick={() => setActiveTab("join")}
                >
                  Join
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === "create" ? (
                  <div className="tab-panel">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Nest name"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)} />
                    <button
                      className="action-button create-button"
                      onClick={createSession}
                      disabled={!username || !sessionName}
                    >
                      ➕ Create Nest
                    </button>
                  </div>
                ) : (
                  <div className="tab-panel">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Nest ID"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)} />
                    <button
                      className="action-button join-button"
                      onClick={joinSession}
                      disabled={!username || !sessionId}
                    >
                      🔗 Join Nest
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="emoji-section">
          <div className="emoji-buttons">
            {EMOJIS.map((emoji) => (
              <button key={emoji} className="emoji-button" onClick={() => sendEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>

          <div id="emoji-container" className="emoji-container">
            {/* Floating emojis will appear here */}
          </div>

          {recentEmojis.length > 0 && (
            <div className="recent-emojis">
              {recentEmojis.map((item, index) => (
                <div key={index} className="emoji-reaction">
                  <span className="emoji">{item.emoji}</span>
                  <span className="username">{item.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div></>
  )
}
