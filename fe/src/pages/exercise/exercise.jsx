import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BookOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  LeftOutlined
} from "@ant-design/icons";
import vocabApi from "../../api/vocabApi";
import "./exercise.css";

function ExercisePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const inputRef = useRef(null);
  // --- State 1: Word Sets List View ---
  const [savedSets, setSavedSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [setsError, setSetsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 6;

  // --- State 2: Word Selection View ---
  const [words, setWords] = useState([]);
  const [setName, setSetName] = useState("");
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // --- State 3: Gameplay View ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Grading & User Action State
  const [selectedOption, setSelectedOption] = useState(null); // for Multiple Choice
  const [inputValue, setInputValue] = useState(""); // for Fill-in-the-blank
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState(false);
  const [learningMode, setLearningMode] = useState("mc");

  // --- State 4: Results Summary ---
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [gradedQuestions, setGradedQuestions] = useState([]); // track which questions were right/wrong

  // Fallback vocabulary list for distractors if the set is too small
  const fallbackWords = [
    "Apple", "Perspective", "Enthusiastic", "Vibrant", "Evaluate",
    "Challenge", "Determine", "Accomplish", "Influence", "Significant",
    "Patience", "Beautiful", "Creativity", "Empower", "Aesthetic",
    "Harmony", "Resilience", "Integrity", "Optimistic", "Vanguard"
  ];

  // Fetch saved sets list if ID is not on URL
  useEffect(() => {
    if (!id) {
      fetchSavedSets(currentPage);
    }
  }, [id, currentPage]);

  // Fetch words in the set if ID is present
  useEffect(() => {
    if (id) {
      fetchWordSetDetail(id);
    } else {
      // Clear selection states when returning to list
      setWords([]);
      setSetName("");
      setSelectedWordIds(new Set());
      setIsPlaying(false);
      setIsFinished(false);
    }
  }, [id, type]);

  // --- API Handlers ---
  const fetchSavedSets = async (page) => {
    setSetsLoading(true);
    setSetsError(null);
    try {
      const data = await vocabApi.getSavedWordSets(page, PAGE_SIZE);
      if (data) {
        setSavedSets(data.content || []);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      console.error("Lỗi khi tải bộ từ đã lưu:", err);
      setSetsError("Không thể tải danh sách bộ từ đã lưu. Vui lòng thử lại!");
    } finally {
      setSetsLoading(false);
    }
  };

  const fetchWordSetDetail = async (setId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      let detail;
      if (type === "saved") {
        detail = await vocabApi.getSavedWordSetDetail(setId);
      } else if (type === "public") {
        detail = await vocabApi.getWordSetDetail(setId);
      } else {
        // Fallback for URLs without explicit type param
        try {
          detail = await vocabApi.getSavedWordSetDetail(setId);
        } catch (savedError) {
          console.warn("Could not load saved word set detail, trying public set detail...", savedError);
          detail = await vocabApi.getWordSetDetail(setId);
        }
      }

      if (detail) {
        setSetName(detail.setName || "Bộ từ vựng");
        const rawWords = detail.learningWordResponses || detail.words || [];
        const normalized = rawWords.map((w) => {
          const wId = w.id || w.wordId;
          const exp = w.exp !== undefined ? w.exp : getWordExp(wId);
          return {
            ...w,
            id: wId,
            exp
          };
        });

        // Sắp xếp:
        // 1. Cấp độ 5 (EXP >= 435, màu cầu vồng) cho xuống cuối cùng.
        // 2. Những từ còn lại xếp theo thứ tự giảm dần của EXP (EXP cao trước).
        // 3. Nếu cùng EXP thì xếp theo bảng chữ cái A-Z.
        normalized.sort((a, b) => {
          const expA = Number(a.exp) || 0;
          const expB = Number(b.exp) || 0;
          const isLvl5A = expA >= 435;
          const isLvl5B = expB >= 435;

          if (isLvl5A !== isLvl5B) {
            return isLvl5A ? 1 : -1;
          }

          if (expA !== expB) {
            return expB - expA; // Xếp giảm dần
          }

          return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
        });

        setWords(normalized);
        // Set default to deselect all (empty selection)
        setSelectedWordIds(new Set());
      } else {
        setDetailError("Không thể lấy chi tiết bộ từ vựng.");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết bộ từ:", err);
      setDetailError("Lỗi kết nối máy chủ khi tải từ vựng.");
    } finally {
      setDetailLoading(false);
    }
  };

  // --- LocalStorage Level Helpers ---
  const getWordExp = (wordId) => {
    const key = `word_exp_${wordId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return parseInt(stored, 10);
    }
    const mockExps = [0, 5, 12, 45, 110, 260, 450];
    const exp = mockExps[wordId % mockExps.length];
    localStorage.setItem(key, exp.toString());
    return exp;
  };

  const getLevelInfo = (exp) => {
    let level = 0;
    let color = "#94a3b8"; // Slate
    let bg = "#f8fafc";
    let name = "Đồng";
    let progress = 0;
    let expDisplay = "";

    if (exp >= 435) {
      level = 5;
      color = "#a0c4ff"; // Mythical
      bg = "#fef2f2";
      name = "Thần thoại";
      progress = 100;
      expDisplay = `${exp}`;
    } else if (exp >= 185) {
      level = 4;
      color = "#eb2f48"; // Diamond/Pink
      bg = "rgba(235, 47, 72, 0.05)";
      name = "Kim cương";
      progress = Math.round(((exp - 185) / 250) * 100);
      expDisplay = `${exp} / 435`;
    } else if (exp >= 85) {
      level = 3;
      color = "#ba68c8"; // Platinum/Purple
      bg = "#faf5ff";
      name = "Bạch kim";
      progress = Math.round(((exp - 85) / 100) * 100);
      expDisplay = `${exp} / 185`;
    } else if (exp >= 35) {
      level = 2;
      color = "#42a5f5"; // Gold/Blue
      bg = "#eff6ff";
      name = "Vàng";
      progress = Math.round(((exp - 35) / 50) * 100);
      expDisplay = `${exp} / 85`;
    } else if (exp >= 10) {
      level = 1;
      color = "#66bb6a"; // Silver/Green
      bg = "#f0fdf4";
      name = "Bạc";
      progress = Math.round(((exp - 10) / 25) * 100);
      expDisplay = `${exp} / 35`;
    } else {
      level = 0;
      color = "#94a3b8"; // Bronze/Slate
      bg = "#f8fafc";
      name = "Đồng";
      progress = Math.round((exp / 10) * 100);
      expDisplay = `${exp} / 10`;
    }

    return { level, color, bg, name, progress, expDisplay };
  };

  // --- Interaction Handlers ---
  const handleToggleWord = (wordId) => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedWordIds(new Set(words.map((w) => w.id)));
  };

  const handleDeselectAll = () => {
    setSelectedWordIds(new Set());
  };

  // Speak word TTS
  const speakWord = (text) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Question Generation & Game Setup ---
  const handleStartLearning = (mode) => {
    if (selectedWordIds.size === 0) return;

    const selectedWords = words.filter((w) => selectedWordIds.has(w.id));
    const generatedQuestions = [];

    // Helper to generate an MCQ question with shuffled distractors and shuffled options
    const createMcqQuestion = (word) => {
      const setWordNames = words.map((w) => w.name);
      const distractorsPool = setWordNames.filter(
        (name) => name.toLowerCase() !== word.name.toLowerCase()
      );

      // Mix in fallback list if not enough words in this set
      let finalPool = [...distractorsPool];
      let fallbackIdx = 0;
      while (finalPool.length < 3 && fallbackIdx < fallbackWords.length) {
        const fallbackVal = fallbackWords[fallbackIdx];
        if (
          !finalPool.some((n) => n.toLowerCase() === fallbackVal.toLowerCase()) &&
          fallbackVal.toLowerCase() !== word.name.toLowerCase()
        ) {
          finalPool.push(fallbackVal);
        }
        fallbackIdx++;
      }

      // Shuffle distractors pool and take 3 random ones
      const sortedPool = finalPool.sort(() => Math.random() - 0.5);
      const chosenDistractors = sortedPool.slice(0, 3);

      // Combine and shuffle correct answer and distractors so the order is random
      const allOptions = [word.name, ...chosenDistractors].sort(
        () => Math.random() - 0.5
      );

      return {
        wordId: word.id,
        type: "mc",
        question: word.definition,
        correctAnswer: word.name,
        wordObj: word,
        options: allOptions
      };
    };

    // Helper to generate a FITB question
    const createFitbQuestion = (word) => {
      return {
        wordId: word.id,
        type: "fitb",
        question: word.definition,
        correctAnswer: word.name,
        wordObj: word
      };
    };

    // Generate exactly 2 questions per selected word of the chosen mode
    selectedWords.forEach((word) => {
      if (mode === "mc") {
        generatedQuestions.push(createMcqQuestion(word));
        generatedQuestions.push(createMcqQuestion(word));
      } else {
        generatedQuestions.push(createFitbQuestion(word));
        generatedQuestions.push(createFitbQuestion(word));
      }
    });

    // Shuffle the final list of questions
    const shuffledQuestions = generatedQuestions.sort(() => Math.random() - 0.5);

    setQuestions(shuffledQuestions);
    setLearningMode(mode);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setInputValue("");
    setIsAnswered(false);
    setIsCurrentAnswerCorrect(false);
    setScore(0);
    setGradedQuestions([]);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // --- Grading Logic ---
  const handleOptionSelect = (optionName) => {
    if (isAnswered) return;

    const currentQ = questions[currentQuestionIndex];
    setSelectedOption(optionName);
    setIsAnswered(true);

    const isCorrect = optionName.toLowerCase() === currentQ.correctAnswer.toLowerCase();
    setIsCurrentAnswerCorrect(isCorrect);

    // Auto speak
    speakWord(currentQ.correctAnswer);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Update exp: +1 for MCQ
      const wordId = currentQ.wordId;
      const storedExp = getWordExp(wordId);
      localStorage.setItem(`word_exp_${wordId}`, (storedExp + 1).toString());
    }

    setGradedQuestions((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: optionName,
        isCorrect
      }
    ]);
  };

  const handleCheckFitb = () => {
    if (isAnswered) return;
    if (!inputValue.trim()) return;

    const currentQ = questions[currentQuestionIndex];
    setIsAnswered(true);

    const isCorrect = inputValue.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    setIsCurrentAnswerCorrect(isCorrect);

    // Auto speak
    speakWord(currentQ.correctAnswer);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Update exp: +2 for FITB
      const wordId = currentQ.wordId;
      const storedExp = getWordExp(wordId);
      localStorage.setItem(`word_exp_${wordId}`, (storedExp + 2).toString());
    }

    setGradedQuestions((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: inputValue.trim(),
        isCorrect
      }
    ]);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setInputValue("");
      setIsAnswered(false);
      setIsCurrentAnswerCorrect(false);
    } else {
      setIsFinished(true);
      setIsPlaying(false);

      // Đồng bộ tiến trình EXP lên backend database
      try {
        const expMap = {};
        gradedQuestions.forEach((g) => {
          if (g.isCorrect) {
            const wId = g.question.wordId;
            const points = g.question.type === "mc" ? 1 : 2;
            expMap[wId] = (expMap[wId] || 0) + points;
          }
        });

        const wordUpdateRequests = Object.keys(expMap).map((wId) => ({
          savedWordId: parseInt(wId, 10),
          expAdded: expMap[wId]
        }));

        if (wordUpdateRequests.length > 0) {
          console.log("Đang đồng bộ kết quả luyện tập lên backend:", wordUpdateRequests);
          await vocabApi.submitTestResults({ wordUpdateRequests });
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ kết quả luyện tập lên máy chủ:", err);
      }
    }
  };

  useEffect(() => {
    if (!isPlaying || !isAnswered) return;

    const handleGlobalTrigger = (e) => {
      // Bỏ qua nếu bấm vào nút phát âm thanh
      const audioBtn = document.querySelector(".question-audio-btn");
      if (audioBtn && audioBtn.contains(e.target)) {
        return;
      }

      if (e.type === "keydown" && e.key !== "Enter") {
        return;
      }

      handleNextQuestion();
    };

    // Đăng ký sự kiện sau 150ms để tránh việc click chọn đáp án/nút check trước đó bùng nổ chuyển câu ngay
    const timer = setTimeout(() => {
      window.addEventListener("click", handleGlobalTrigger);
      window.addEventListener("keydown", handleGlobalTrigger);
    }, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleGlobalTrigger);
      window.removeEventListener("keydown", handleGlobalTrigger);
    };
  }, [isPlaying, isAnswered, handleNextQuestion]);

  // Tự động focus vào ô input khi chuyển sang câu điền từ mới
  useEffect(() => {
    if (isPlaying && !isAnswered && !isFinished && questions.length > 0) {
      const currentQ = questions[currentQuestionIndex];
      if (currentQ && currentQ.type === "fitb" && inputRef.current) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, isAnswered, isFinished, currentQuestionIndex, questions]);

  // --- Reset & Back Handlers ---
  const handleRetrySameWords = () => {
    handleStartLearning(learningMode);
  };

  const handleBackToSelection = () => {
    setIsPlaying(false);
    setIsFinished(false);
    // Reload set detail to see updated EXPs
    fetchWordSetDetail(id);
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  // --- Render Functions ---

  // Render 1: Saved word sets listing
  const renderSetsList = () => {
    if (setsLoading) {
      return (
        <div className="exercise-loading-wrapper">
          <LoadingOutlined className="exercise-spinner" />
          <p>Đang tải danh sách bộ từ vựng đã lưu...</p>
        </div>
      );
    }

    if (setsError) {
      return (
        <div className="exercise-error-wrapper">
          <ExclamationCircleOutlined className="exercise-error-icon" />
          <p>{setsError}</p>
          <button className="btn-action-outline" onClick={() => fetchSavedSets(currentPage)}>
            Thử lại
          </button>
        </div>
      );
    }

    if (savedSets.length === 0) {
      return (
        <div className="exercise-empty-wrapper">
          <InboxOutlined className="exercise-empty-icon" />
          <p>Bạn chưa lưu bộ từ vựng nào.</p>
          <p className="empty-sub">Hãy lưu bộ từ ở Thư viện trước khi bắt đầu luyện tập.</p>
          <button className="btn-action-primary" onClick={() => navigate("/library")}>
            Đến Thư viện
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="exercise-grid">
          {savedSets.map((set) => {
            const setNameVal = set?.setName || set?.wordSetName || "Bộ từ vựng";
            const description = set?.description || "Không có mô tả.";
            const count = set?.wordCount !== undefined ? set.wordCount : 0;
            const setId = set.savedWordSetId || set.id;

            return (
              <div key={setId} className="exercise-set-card" onClick={() => setSearchParams({ id: setId, type: "saved" })}>
                <div className="set-card-top">
                  <div className="set-card-header">
                    <span className="word-count-tag">
                      <BookOutlined /> {count} từ
                    </span>
                  </div>
                  <h3 className="set-card-title">{setNameVal}</h3>
                  <p className="set-card-desc">{description}</p>
                </div>
                <button className="btn-select-set">
                  <PlayCircleOutlined /> Luyện tập bộ này
                </button>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="exercise-pagination-wrapper">
            <button
              className="btn-page-ctrl"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ArrowLeftOutlined /> <span className="pagination-text">Trước</span>
            </button>
            <span className="page-indicator-text">
              Trang <strong>{currentPage + 1}</strong> / {totalPages}
            </span>
            <button
              className="btn-page-ctrl"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <span className="pagination-text">Tiếp theo</span> <ArrowRightOutlined />
            </button>
          </div>
        )}
      </>
    );
  };

  // Render 2: Words Selection Grid
  const renderWordsSelection = () => {
    if (detailLoading) {
      return (
        <div className="exercise-loading-wrapper">
          <LoadingOutlined className="exercise-spinner" />
          <p>Đang tải chi tiết danh sách từ vựng...</p>
        </div>
      );
    }

    if (detailError) {
      return (
        <div className="exercise-error-wrapper">
          <ExclamationCircleOutlined className="exercise-error-icon" />
          <p>{detailError}</p>
          <button className="btn-action-outline" onClick={handleBackToList}>
            Quay lại danh sách
          </button>
        </div>
      );
    }

    return (
      <div className="selection-view-container">
        <div className="selection-dashboard">
          <div className="dashboard-meta">
            <button className="btn-back-arrow" onClick={handleBackToList} title="Quay lại">
              <ArrowLeftOutlined />
            </button>
            <h2>{setName}</h2>
            <p>Chọn các từ vựng bạn muốn đưa vào bài làm luyện tập. Nhấn vào thẻ từ để bật/tắt lựa chọn.</p>
          </div>
          <div className="dashboard-controls">
            <div className="control-actions">
              <button className="btn-action-outline" onClick={handleSelectAll}>Chọn tất cả ({words.length})</button>
              <button className="btn-action-outline" onClick={handleDeselectAll}>Bỏ chọn tất cả</button>
              <span className="selected-count-badge">Đã chọn {selectedWordIds.size} từ</span>
            </div>
            <div className="learning-buttons-group">
              <button
                className="btn-action-primary"
                onClick={() => handleStartLearning("mc")}
                disabled={selectedWordIds.size === 0}
              >
                Trắc nghiệm
              </button>
              <button
                className="btn-action-primary"
                onClick={() => handleStartLearning("fitb")}
                disabled={selectedWordIds.size === 0}
              >
                Điền từ
              </button>
            </div>
          </div>
        </div>

        <div className="exercise-words-grid">
          {words.map((word, idx) => {
            const isSelected = selectedWordIds.has(word.id);
            const wordExp = word.exp !== undefined ? word.exp : getWordExp(word.id);
            const levelInfo = getLevelInfo(wordExp);

            const fontStyle = {
              fontSize: word.name.length > 25
                ? "11px"
                : word.name.length > 18
                  ? "13.5px"
                  : "16px"
            };

            return (
              <div
                key={word.id || idx}
                className={`exercise-word-card level-${levelInfo.level} ${isSelected ? "selected" : ""}`}
                style={{ color: levelInfo.color }}
                onClick={() => handleToggleWord(word.id)}
              >
                <div
                  className="exercise-word-level-badge"
                  style={{
                    color: levelInfo.color,
                    backgroundColor: levelInfo.bg,
                    borderColor: levelInfo.color
                  }}
                  title={`Cấp độ ${levelInfo.level} (EXP: ${wordExp})`}
                >
                  {levelInfo.level}
                </div>

                <div className="exercise-word-name-container">
                  <div className="exercise-word-name" style={fontStyle}>
                    {word.name}
                  </div>
                </div>

                <div className="exercise-word-progress-section">
                  <div className="exercise-word-progress-bar-bg">
                    <div
                      className="exercise-word-progress-bar-fill"
                      style={{
                        width: `${levelInfo.progress}%`,
                        backgroundColor: levelInfo.color
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render 3: Gameplay screen
  const renderGameplay = () => {
    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;
    const progressPercent = Math.round(((currentQuestionIndex) / totalQ) * 100);

    return (
      <div className="gameplay-wrapper">
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
          <button
            onClick={handleBackToSelection}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: "#0ca6c6",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              padding: "0"
            }}
          >
            <ArrowLeftOutlined /> Thoát luyện tập
          </button>
        </div>
        <div className="game-progress-container">
          <div className="game-progress-info">
            <span className="game-progress-label">Tiến trình luyện tập</span>
            <span className="game-progress-percentage">
              Câu {currentQuestionIndex + 1} / {totalQ} ({Math.round(((currentQuestionIndex + 1) / totalQ) * 100)}%)
            </span>
          </div>
          <div className="game-progress-bar-bg">
            <div className="game-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="question-section">
          <span className="question-type-badge">
            {currentQ.type === "mc" ? "Trắc nghiệm" : "Điền từ"}
          </span>
          <h2 className="question-title">{currentQ.question}</h2>
        </div>

        {currentQ.type === "mc" ? (
          /* Trắc nghiệm xếp dọc */
          <>
            <div className="options-list">
              {currentQ.options.map((option, idx) => {
                const isCorrectOpt = option.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                const isSelectedOpt = selectedOption?.toLowerCase() === option.toLowerCase();

                let optClass = "";
                if (isAnswered) {
                  if (isCorrectOpt) {
                    optClass = "correct";
                  } else if (isSelectedOpt) {
                    optClass = "incorrect";
                  }
                }

                return (
                  <button
                    key={idx}
                    className={`option-button ${optClass}`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrectOpt && (
                      <span className="option-icon" style={{ color: "#22c55e" }}><CheckOutlined /></span>
                    )}
                    {isAnswered && isSelectedOpt && !isCorrectOpt && (
                      <span className="option-icon" style={{ color: "#ef4444" }}><CloseOutlined /></span>
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className={`fitb-feedback ${isCurrentAnswerCorrect ? "correct" : "incorrect"}`} style={{ marginTop: "16px", marginBottom: "20px" }}>
                {isCurrentAnswerCorrect ? (
                  <>
                    <CheckCircleOutlined />
                    <span>
                      Chính xác! Bạn được <strong>+1 EXP</strong>
                      <span className="feedback-word-val">({currentQ.correctAnswer})</span>
                      <button className="inline-audio-btn" onClick={() => speakWord(currentQ.correctAnswer)} title="Phát âm">
                        <SoundOutlined />
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <CloseCircleOutlined />
                    <span>
                      Sai rồi! Đáp án đúng là: 
                      <span className="fitb-correct-reveal">
                        {currentQ.correctAnswer}
                        <button className="inline-audio-btn" onClick={() => speakWord(currentQ.correctAnswer)} title="Phát âm">
                          <SoundOutlined />
                        </button>
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          /* Câu hỏi điền từ */
          <div className="fitb-container">
            <input
              ref={inputRef}
              type="text"
              className={`fitb-input ${isAnswered ? (isCurrentAnswerCorrect ? "correct" : "incorrect") : ""}`}
              placeholder={isAnswered ? "" : "Gõ tên từ vựng tiếng Anh tương ứng..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAnswered}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAnswered && inputValue.trim()) {
                  handleCheckFitb();
                }
              }}
            />

            {!isAnswered ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn-game-submit"
                  disabled={!inputValue.trim()}
                  onClick={handleCheckFitb}
                >
                  Kiểm tra
                </button>
              </div>
            ) : null}

            {isAnswered && (
              <div className={`fitb-feedback ${isCurrentAnswerCorrect ? "correct" : "incorrect"}`}>
                {isCurrentAnswerCorrect ? (
                  <>
                    <CheckCircleOutlined />
                    <span>
                      Chính xác! Bạn được <strong>+2 EXP</strong>
                      <span className="feedback-word-val">({currentQ.correctAnswer})</span>
                      <button className="inline-audio-btn" onClick={() => speakWord(currentQ.correctAnswer)} title="Phát âm">
                        <SoundOutlined />
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <CloseCircleOutlined />
                    <span>
                      Sai rồi! Đáp án đúng là:
                      <span className="fitb-correct-reveal">
                        {currentQ.correctAnswer}
                        <button className="inline-audio-btn" onClick={() => speakWord(currentQ.correctAnswer)} title="Phát âm">
                          <SoundOutlined />
                        </button>
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isAnswered && (
          <div className="gameplay-footer">
            <button className="btn-game-submit" onClick={handleNextQuestion}>
              Tiếp tục <ArrowRightOutlined />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render 4: Summary / Results
  const renderSummary = () => {
    const totalQ = questions.length;
    const correctCount = score;
    const incorrectCount = totalQ - score;
    const percent = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    return (
      <div className="exercise-summary-container">
        <div className="exercise-summary-icon">
          <TrophyOutlined />
        </div>
        <h2>Hoàn thành bài luyện tập!</h2>
        <p>Tuyệt vời! Bạn đã hoàn thành tất cả các câu hỏi được chuẩn bị từ bộ từ vựng.</p>

        <div className="exercise-stats-grid">
          <div className="exercise-stat-card">
            <span className="exercise-stat-val score">{percent}%</span>
            <span className="exercise-stat-lbl">Tỷ lệ đúng</span>
          </div>
          <div className="exercise-stat-card">
            <span className="exercise-stat-val correct">{correctCount}</span>
            <span className="exercise-stat-lbl">Trả lời đúng</span>
          </div>
          <div className="exercise-stat-card">
            <span className="exercise-stat-val incorrect">{incorrectCount}</span>
            <span className="exercise-stat-lbl">Trả lời sai</span>
          </div>
        </div>

        <div className="exercise-actions-panel">
          <button className="btn-summary-action primary" onClick={handleRetrySameWords}>
            <ReloadOutlined /> Luyện tập lại
          </button>
          <button className="btn-summary-action secondary" onClick={handleBackToSelection}>
            Chọn từ khác
          </button>
          <button className="btn-summary-action secondary" onClick={handleBackToList}>
            Học bộ từ khác
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="exercise-container">
      {!isPlaying && !isFinished && !id && (
        <div className="back-nav-container" style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: "#0ca6c6",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              padding: "0"
            }}
          >
            <ArrowLeftOutlined /> Quay lại trang chủ
          </button>
        </div>
      )}

      {/* Main Flow Router based on states */}
      {isPlaying
        ? renderGameplay()
        : isFinished
          ? renderSummary()
          : id
            ? renderWordsSelection()
            : renderSetsList()}
    </div>
  );
}

export default ExercisePage;
