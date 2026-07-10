import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SoundOutlined,
  UndoOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SwapOutlined,
  TrophyOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  InboxOutlined
} from "@ant-design/icons";
import vocabApi from "../../api/vocabApi";
import "./flashCardGame.css";

function FlashCardGamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "public";

  // Data State
  const [words, setWords] = useState([]);
  const [originalWords, setOriginalWords] = useState([]); // Keep original order
  const [setName, setSetName] = useState("");
  const [createBy, setCreateBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Playback State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Review Status (wordId -> 'learning' | 'known')
  const [reviewStatus, setReviewStatus] = useState({});

  // Swipe & Drag state
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeClass, setSwipeClass] = useState(""); // "", "swiped-left", "swiped-right"

  // Refs for autoplay
  const autoplayTimerRef = useRef(null);

  useEffect(() => {
    fetchWordSetDetail();
  }, [id, type]);

  // Handle Autoplay timing
  useEffect(() => {
    if (isAutoplay && words.length > 0 && !isFinished) {
      const delay = isFlipped ? 4000 : 3000; // Give more time to read the meaning
      autoplayTimerRef.current = setTimeout(() => {
        if (!isFlipped) {
          // Speak the word first on flip (optional, browser compat)
          speakWord(words[currentIndex]?.name);
          setIsFlipped(true);
        } else {
          // Go to next card
          if (currentIndex < words.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
          } else {
            // Reached the end
            setIsAutoplay(false);
            setIsFinished(true);
          }
        }
      }, delay);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isAutoplay, currentIndex, isFlipped, words, isFinished]);

  // Keyboard Navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || error || isFinished || words.length === 0) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsFlipped(prev => {
            const next = !prev;
            if (next) {
              speakWord(words[currentIndex]?.name);
            }
            return next;
          });
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "Digit1":
        case "Numpad1":
          e.preventDefault();
          handleMarkCard("learning");
          break;
        case "Digit2":
        case "Numpad2":
          e.preventDefault();
          handleMarkCard("known");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, error, isFinished, currentIndex, words, isFlipped]);

  const fetchWordSetDetail = async () => {
    if (!id) {
      setError("Không tìm thấy thông tin bộ từ vựng!");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let detail;
      if (type === "saved") {
        detail = await vocabApi.getSavedWordSetDetail(id);
      } else {
        detail = await vocabApi.getWordSetDetail(id);
      }

      if (detail) {
        setSetName(detail.setName || "Bộ từ vựng");
        setCreateBy(detail.createBy || "");

        // Normalize DTO to get words
        const rawWords = detail.learningWordResponses || detail.words || [];
        const normalized = rawWords.map(w => ({
          ...w,
          id: w.id || w.wordId
        }));

        setWords(normalized);
        setOriginalWords(normalized);

        // Prepopulate reviewStatus for saved words using their EXP
        const initialStatus = {};
        normalized.forEach(w => {
          if (w.exp !== undefined && w.exp > 0) {
            initialStatus[w.id] = w.exp >= 85 ? "known" : "learning";
          }
        });
        setReviewStatus(initialStatus);
      } else {
        setError("Không có dữ liệu trả về từ máy chủ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết bộ từ vựng học flashcard:", err);
      setError("Không thể kết nối máy chủ để tải bộ từ vựng. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech Pronunciation
  const speakWord = (text) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      // Cancel active speaking to avoid overlap
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // Slightly slower for clear learning
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleMarkCard = (status) => {
    const activeWord = words[currentIndex];
    if (!activeWord) return;

    setReviewStatus(prev => ({
      ...prev,
      [activeWord.id]: status
    }));

    // Trigger next card
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsAutoplay(false);
      setIsFinished(true);
    }
  };

  // Drag & Swipe Event Handlers
  const handleDragStart = (clientX, clientY) => {
    if (isAutoplay || isFinished) return;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (clientX, clientY) => {
    if (!isDragging || !dragStart) return;
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging || !dragStart) return;
    setIsDragging(false);
    setDragStart(null);

    const threshold = 120; // swipe threshold in pixels
    const clickThreshold = 6; // click detection threshold

    const isClick = Math.abs(dragOffset.x) < clickThreshold && Math.abs(dragOffset.y) < clickThreshold;

    if (isClick) {
      // Simple click -> Flip the card
      setIsFlipped(!isFlipped);
      if (!isFlipped) speakWord(words[currentIndex]?.name);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (dragOffset.x < -threshold) {
      // Drag left -> Đã thuộc (known)
      triggerSwipe("left");
    } else if (dragOffset.x > threshold) {
      // Drag right -> Chưa thuộc (learning)
      triggerSwipe("right");
    } else {
      // Reset position if swipe threshold not met
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (direction) => {
    setSwipeClass(`swiped-${direction}`);
    
    // Move to next card after fly-out animation (300ms)
    setTimeout(() => {
      const status = direction === "left" ? "learning" : "known";
      const activeWord = words[currentIndex];
      if (activeWord) {
        setReviewStatus(prev => ({
          ...prev,
          [activeWord.id]: status
        }));
      }

      if (currentIndex < words.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }

      // Reset style classes for the next card
      setSwipeClass("");
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const getCardStyle = () => {
    if (!isDragging) return {};
    const rotation = dragOffset.x * 0.05;
    
    if (isFlipped) {
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${-rotation}deg) rotateY(180deg)`,
        transition: "none",
        cursor: "grabbing"
      };
    } else {
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`,
        transition: "none",
        cursor: "grabbing"
      };
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click drag
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX, e.clientY);
  };

  // Touch drag handlers for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  // Toggle Shuffle card list
  const handleToggleShuffle = () => {
    if (isShuffle) {
      // Reset to original order
      setWords(originalWords);
      setIsShuffle(false);
    } else {
      // Shuffle words array
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setIsShuffle(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetLearning = () => {
    setReviewStatus({});
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsAutoplay(false);
  };

  const handleReviewOnlyLearning = () => {
    const difficultWords = originalWords.filter(w => reviewStatus[w.id] === "learning");
    if (difficultWords.length === 0) {
      alert("Tuyệt vời! Bạn không có từ nào xếp vào Pile 'Chưa nhớ'.");
      return;
    }
    setWords(difficultWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsAutoplay(false);
  };

  const handleReviewAll = () => {
    setWords(originalWords);
    setReviewStatus({});
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsAutoplay(false);
  };

  // Stats calculation
  const totalCount = words.length;
  const knownCount = Object.values(reviewStatus).filter(v => v === "known").length;
  const learningCount = Object.values(reviewStatus).filter(v => v === "learning").length;
  const progressPercent = totalCount > 0 ? Math.round(((knownCount + learningCount) / totalCount) * 100) : 0;

  if (!id) {
    return (
      <div className="flashcard-page-wrapper">
        <div className="flashcard-error" style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", margin: "auto" }}>
          <InboxOutlined style={{ fontSize: "50px", color: "#0b4c5c", marginBottom: "20px" }} />
          <h2 style={{ color: "#0b4c5c" }}>Bắt đầu học Flashcard</h2>
          <p style={{ color: "#64748b", maxWidth: "400px", margin: "10px auto 20px auto" }}>
            Vui lòng chọn một bộ từ vựng từ danh sách bộ từ của bạn hoặc thư viện công cộng để bắt đầu học bằng Flashcard.
          </p>
          <button className="btn-ctrl active" onClick={() => navigate("/flash-card")} style={{ margin: "0 auto" }}>
            Chọn bộ từ vựng ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flashcard-page-wrapper">
        <div className="flashcard-loading">
          <LoadingOutlined className="spinner" />
          <p>Đang tải danh sách từ vựng...</p>
        </div>
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="flashcard-page-wrapper">
        <div className="flashcard-error">
          <ExclamationCircleOutlined className="error-icon" />
          <h2>Đã có lỗi xảy ra</h2>
          <p>{error || "Bộ từ vựng này không có từ nào để học."}</p>
          <button className="btn-back" onClick={() => navigate("/flash-card")} style={{ margin: "20px auto 0 auto" }}>
            <ArrowLeftOutlined /> Quay về danh sách bộ từ
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];



  return (
    <div className="flashcard-page-wrapper" style={{ userSelect: isDragging ? "none" : "auto" }}>
      {/* Screen swipe overlays */}
      {isDragging && dragOffset.x < -10 && (
        <div 
          className="screen-overlay left-overlay" 
          style={{ opacity: Math.min(Math.abs(dragOffset.x) / 180, 0.6) }}
        >
          <div className="plus-one-indicator left-plus">+1</div>
        </div>
      )}
      {isDragging && dragOffset.x > 10 && (
        <div 
          className="screen-overlay right-overlay" 
          style={{ opacity: Math.min(Math.abs(dragOffset.x) / 180, 0.6) }}
        >
          <div className="plus-one-indicator right-plus">+1</div>
        </div>
      )}


      {!isFinished ? (
        <>
          {/* Progress Tracker Card */}
          <div className="progress-container">
            <div className="progress-info">
              <span className="progress-label">Tiến trình xem thẻ từ vựng</span>
              <span className="progress-percentage">{progressPercent}% ({knownCount + learningCount}/{totalCount} từ)</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="piles-summary">
              <span className="pile-badge known">
                <CheckOutlined /> Đã nhớ: {knownCount}
              </span>
              <span className="pile-badge learning">
                <CloseOutlined /> Chưa nhớ: {learningCount}
              </span>
            </div>
          </div>


          {/* Flashcard Play Zone */}
          <div className="card-play-area">
            <div
              className={`flashcard ${isFlipped ? "flipped" : ""} ${swipeClass}`}
              style={getCardStyle()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleDragEnd}
            >
              {/* Card Face FRONT (English Word) */}
              <div className="card-face front">
                <span className="card-label">Thuật ngữ tiếng Anh</span>
                <div className="card-main-content">
                  <div className="word-title">{currentWord?.name}</div>
                </div>
                <div className="card-hint">Kéo TRÁI = Chưa thuộc • Kéo PHẢI = Đã thuộc • Nhấp để lật</div>
              </div>

              {/* Card Face BACK (Vietnamese Meaning & Example) */}
              <div className="card-face back">
                <span className="card-label">Định nghĩa & Ví dụ</span>
                <div className="card-main-content">
                  <div className="word-meaning">{currentWord?.definition}</div>
                  {currentWord?.example && (
                    <div className="word-example">
                      "{currentWord.example}"
                    </div>
                  )}
                </div>
                <div className="card-hint">Kéo TRÁI = Chưa thuộc • Kéo PHẢI = Đã thuộc • Nhấp để lật</div>
              </div>
            </div>
          </div>

          {/* Bottom Control Panel */}
          <div className="controls-panel">
            <div className="control-group">
              <button
                className={`btn-ctrl ${isAutoplay ? "active" : ""}`}
                onClick={() => setIsAutoplay(!isAutoplay)}
                title="Tự động lật và chuyển thẻ từ vựng"
              >
                {isAutoplay ? (
                  <><PauseCircleOutlined /> Tạm dừng</>
                ) : (
                  <><PlayCircleOutlined /> Tự động chạy</>
                )}
              </button>
              <button
                className={`btn-ctrl ${isShuffle ? "active" : ""}`}
                onClick={handleToggleShuffle}
                title="Tráo thứ tự các thẻ từ"
              >
                <SwapOutlined /> Tráo thẻ
              </button>
            </div>
            <button className="btn-ctrl" onClick={handleResetLearning}>
              <UndoOutlined /> Làm mới
            </button>
          </div>
        </>
      ) : (
        /* Results / Summary screen */
        <div className="summary-container">
          <div className="summary-icon-wrapper">
            <TrophyOutlined />
          </div>
          <h2>Hoàn thành học Flashcard!</h2>
          <p>Chúc mừng bạn đã hoàn thành duyệt qua tất cả thẻ từ vựng của bộ từ này.</p>

          <div className="stats-circle-row">
            <div className="stat-item">
              <span className="stat-val">{totalCount}</span>
              <span className="stat-lbl">Tổng thẻ</span>
            </div>
            <div className="stat-item">
              <span className="stat-val known">{knownCount}</span>
              <span className="stat-lbl">Đã nhớ</span>
            </div>
            <div className="stat-item">
              <span className="stat-val learning">{learningCount}</span>
              <span className="stat-lbl">Chưa nhớ</span>
            </div>
          </div>

          <div className="summary-actions">
            <button className="btn-summary-act primary" onClick={handleReviewAll}>
              <UndoOutlined /> Học lại toàn bộ từ đầu
            </button>
            {learningCount > 0 && (
              <button className="btn-summary-act secondary" onClick={handleReviewOnlyLearning}>
                Học lại riêng các từ chưa nhớ ({learningCount} từ)
              </button>
            )}
            <button className="btn-summary-act secondary" onClick={() => navigate("/flash-card")}>
              Quay lại danh sách bộ từ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashCardGamePage;
