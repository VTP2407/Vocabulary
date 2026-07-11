import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpenOutlined,
  BookOutlined,
  GlobalOutlined,
  LockOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  InboxOutlined,
  LoginOutlined,
  CloseOutlined
} from "@ant-design/icons";
import vocabApi from "../../api/vocabApi";
import "./myWordSets.css";

function MyWordSetsPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("created"); // 'created' | 'saved'
  const [personalSets, setPersonalSets] = useState([]);
  const [savedSets, setSavedSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Trạng thái modal xem chi tiết
  const [selectedSet, setSelectedSet] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [wordSetDetail, setWordSetDetail] = useState(null);
  const [expandedWordIds, setExpandedWordIds] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchData(activeTab);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, [activeTab]);

  const fetchSavedSetsOnly = async () => {
    try {
      const data = await vocabApi.getSavedWordSets();
      const listData = data && (data.content || data);
      setSavedSets(Array.isArray(listData) ? listData : []);
    } catch (err) {
      console.error("Lỗi khi tải bộ từ đã lưu phụ trợ:", err);
    }
  };

  const checkIsSaved = (setId) => {
    return savedSets.some(s => s.id === setId);
  };

  const handleSave = async (e, wordSetId) => {
    e.stopPropagation();
    try {
      await vocabApi.saveWordSet(wordSetId);
      await fetchSavedSetsOnly();
      alert("Lưu bộ từ vựng vào Tiến trình học thành công!");
    } catch (err) {
      console.error("Lỗi khi lưu bộ từ:", err);
      alert("Lưu bộ từ thất bại!");
    }
  };

  const fetchData = async (tab = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "created") {
        const data = await vocabApi.getMyWordSet();
        const listData = data && (data.content || data);
        setPersonalSets(Array.isArray(listData) ? listData : []);
        // Also fetch saved sets to check saved status of created sets
        await fetchSavedSetsOnly();
      } else {
        const data = await vocabApi.getSavedWordSets();
        const listData = data && (data.content || data);
        setSavedSets(Array.isArray(listData) ? listData : []);
      }
    } catch (err) {
      console.error(`Lỗi khi tải danh sách bộ từ ${tab === "created" ? "đã tạo" : "đã lưu"}:`, err);
      setError("Không thể tải danh sách bộ từ. Vui lòng kiểm tra lại kết nối hoặc thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e, id) => {
    e.stopPropagation(); // Tránh kích hoạt sự kiện click của Card
    if (!window.confirm("Bạn có chắc chắn muốn bỏ lưu bộ từ này không?")) return;

    try {
      await vocabApi.unsaveWordSet(id);
      setSavedSets(prev => prev.filter(set => set.id !== id));
      if (selectedSet && selectedSet.id === id) {
        setSelectedSet(null);
        setWordSetDetail(null);
      }
    } catch (err) {
      console.error("Lỗi khi bỏ lưu bộ từ:", err);
      alert("Bỏ lưu thất bại, vui lòng thử lại!");
    }
  };

  const handleOpenDetail = async (set) => {
    setSelectedSet(set);
    setDetailLoading(true);
    setWordSetDetail(null);
    setExpandedWordIds(new Set());
    try {
      const detail = activeTab === "saved"
        ? await vocabApi.getSavedWordSetDetail(set.savedWordSetId || set.id)
        : await vocabApi.getWordSetDetail(set.id);

      if (activeTab === "saved" && detail) {
        // Chuẩn hóa dữ liệu trả về từ backend và sắp xếp theo tiến trình học
        const rawWords = detail.learningWordResponses || detail.words || [];
        const normalized = rawWords.map(w => {
          const wId = w.id || w.wordId;
          const exp = (w.exp !== undefined && w.exp !== null) ? Number(w.exp) : Number(getWordExp(wId) || 0);
          return {
            ...w,
            id: wId,
            exp
          };
        });

        // Sắp xếp: EXP từ thấp lên trên (chưa học), EXP cao xuống dưới (đã học)
        normalized.sort((a, b) => {
          if (a.exp !== b.exp) {
            return a.exp - b.exp;
          }
          return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
        });

        detail.words = normalized;
      }

      setWordSetDetail(detail);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết bộ từ:", err);
      // Fallback hiển thị thông tin cơ bản nếu API chi tiết lỗi hoặc chưa hoàn thiện đầy đủ
      setWordSetDetail({
        ...set,
        words: []
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleWord = (wordId) => {
    setExpandedWordIds(prev => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const handleToggleAllWords = () => {
    if (!wordSetDetail || !wordSetDetail.words) return;
    const allWordIds = wordSetDetail.words.map(w => w.id);
    const areAllExpanded = allWordIds.every(id => expandedWordIds.has(id));
    if (areAllExpanded) {
      setExpandedWordIds(new Set());
    } else {
      setExpandedWordIds(new Set(allWordIds));
    }
  };

  const handleCloseDetail = () => {
    setSelectedSet(null);
    setWordSetDetail(null);
    setExpandedWordIds(new Set());
  };

  const getWordExp = (wordId) => {
    const key = `word_exp_${wordId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return parseInt(stored, 10);
    }
    // Sinh EXP giả lập cố định để giao diện hiển thị đủ 6 cấp độ (0 -> 5)
    const mockExps = [0, 5, 12, 45, 110, 260, 450];
    const exp = mockExps[wordId % mockExps.length];
    localStorage.setItem(key, exp.toString());
    return exp;
  };

  const getLevelInfo = (exp) => {
    let level = 0;
    let color = '#94a3b8'; // Đồng (Xám Pastel)
    let bg = '#f8fafc';
    let name = 'Đồng';
    let progress = 0;
    let expDisplay = "";

    if (exp >= 435) {
      level = 5;
      color = '#a0c4ff'; // Thần thoại (Xanh pastel / Cầu vồng)
      bg = '#fef2f2';
      name = 'Thần thoại';
      progress = 100;
      expDisplay = `${exp}`;
    } else if (exp >= 185) {
      level = 4;
      color = '#eb2f48'; // Kim cương (Hồng/Đỏ Pastel)
      bg = 'rgba(235, 47, 72, 0.05)';
      name = 'Kim cương';
      progress = Math.round(((exp - 185) / 250) * 100);
      expDisplay = `${exp} / 435`;
    } else if (exp >= 85) {
      level = 3;
      color = '#ba68c8'; // Bạch kim (Tím Pastel)
      bg = '#faf5ff';
      name = 'Bạch kim';
      progress = Math.round(((exp - 85) / 100) * 100);
      expDisplay = `${exp} / 185`;
    } else if (exp >= 35) {
      level = 2;
      color = '#42a5f5'; // Vàng (Xanh dương Pastel)
      bg = '#eff6ff';
      name = 'Vàng';
      progress = Math.round(((exp - 35) / 50) * 100);
      expDisplay = `${exp} / 85`;
    } else if (exp >= 10) {
      level = 1;
      color = '#66bb6a'; // Bạc (Xanh lá Pastel)
      bg = '#f0fdf4';
      name = 'Bạc';
      progress = Math.round(((exp - 10) / 25) * 100);
      expDisplay = `${exp} / 35`;
    } else {
      level = 0;
      color = '#94a3b8'; // Đồng (Xám Pastel)
      bg = '#f8fafc';
      name = 'Đồng';
      progress = Math.round((exp / 10) * 100);
      expDisplay = `${exp} / 10`;
    }

    return { level, color, bg, name, progress, expDisplay };
  };

  const handleStudy = (e, id, savedWordSetId) => {
    e.stopPropagation();
    const queryId = savedWordSetId || id;
    const type = savedWordSetId ? "saved" : "public";
    navigate(`/flash-card-game?id=${queryId}&type=${type}`);
  };

  const handleExercise = (e, id, savedWordSetId) => {
    e.stopPropagation();
    const queryId = savedWordSetId || id;
    const type = savedWordSetId ? "saved" : "public";
    navigate(`/exercise?id=${queryId}&type=${type}`);
  };

  // Lọc bộ từ theo tìm kiếm
  const currentSets = activeTab === "created" ? personalSets : savedSets;
  const filteredSets = Array.isArray(currentSets) ? currentSets.filter(set => {
    const name = set?.setName || set?.wordSetName || "";
    const desc = set?.description || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  if (!isLoggedIn) {
    return (
      <div className="my-vocab-page-wrapper">
        <div className="login-prompt-card">
          <ExclamationCircleOutlined className="prompt-icon" />
          <h2>Yêu Cầu Đăng Nhập</h2>
          <p>Vui lòng đăng nhập tài khoản của bạn để quản lý các bộ từ vựng cá nhân và danh sách bộ từ đã lưu.</p>
          <button className="btn-prompt-login" onClick={() => navigate("/login")}>
            <LoginOutlined /> Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-vocab-page-wrapper">
      {/* Bộ điều khiển (Nút bấm chuyển đổi & Thanh tìm kiếm) */}
      <div className="my-vocab-controls">
        <div className="tab-buttons-group">
          <button
            className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("created");
              setSearchQuery("");
            }}
          >
            <FolderOpenOutlined />
            <span>Bộ từ đã tạo</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("saved");
              setSearchQuery("");
            }}
          >
            <BookOutlined />
            <span>Bộ từ đã lưu</span>
          </button>
        </div>

        <div className="controls-right-section">
          <div className="search-bar-wrapper">
            <SearchOutlined className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ từ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === "created" && (
            <button className="btn-create-set" onClick={() => navigate("/vocabulary")}>
              <PlusOutlined /> Tạo bộ từ mới
            </button>
          )}
        </div>
      </div>

      {/* Hiển thị Loading / Lỗi / Nội dung */}
      {loading ? (
        <div className="my-vocab-loading">
          <LoadingOutlined className="spinner" />
          <p>Đang tải danh sách bộ từ...</p>
        </div>
      ) : error ? (
        <div className="my-vocab-error">
          <ExclamationCircleOutlined className="error-icon" />
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchData}>Thử lại</button>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="my-vocab-empty">
          <InboxOutlined className="empty-icon" />
          {searchQuery ? (
            <p>Không tìm thấy bộ từ nào khớp với từ khóa "{searchQuery}"</p>
          ) : activeTab === "created" ? (
            <div className="empty-action">
              <p>Bạn chưa tạo bộ từ vựng nào.</p>
              <button className="btn-create-set-empty" onClick={() => navigate("/vocabulary")}>
                Tạo bộ từ đầu tiên <ArrowRightOutlined />
              </button>
            </div>
          ) : (
            <p>Bạn chưa lưu bộ từ vựng nào. Bạn có thể lưu các bộ từ công khai từ Thư viện!</p>
          )}
        </div>
      ) : (
        /* Grid Card danh sách bộ từ */
        <div className="my-vocab-grid">
          {filteredSets.map((set) => {
            const visibility = set?.visibility || "PUBLIC";
            const setName = set?.setName || set?.wordSetName || "Không có tên bộ từ";
            const description = set?.description || "Không có mô tả cho bộ từ này.";
            return (
              <div key={set?.id} className="vocab-set-card" onClick={() => handleOpenDetail(set)}>
                <div className="card-top">
                  <div className="card-badge-row">
                    <span className={`visibility-badge ${visibility.toLowerCase()}`}>
                      {visibility === "PUBLIC" ? (
                        <><GlobalOutlined /> Công khai</>
                      ) : (
                        <><LockOutlined /> Riêng tư</>
                      )}
                    </span>
                    {set?.wordCount !== undefined && set?.wordCount !== null && (
                      <span className="word-count-badge">
                        {set.wordCount} từ
                      </span>
                    )}
                  </div>
                  <h3 className="card-title">{setName}</h3>
                  <p className="card-desc">{description}</p>
                </div>

                <div className="card-actions">
                  {activeTab === "created" ? (
                    <>
                      <button
                        className="btn-action btn-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vocabulary?id=${set.id}`, {
                            state: {
                              setName: set.setName || set.wordSetName,
                              description: set.description,
                              visibility: set.visibility
                            }
                          });
                        }}
                      >
                        Sửa
                      </button>
                      {checkIsSaved(set.id) ? (
                        <button
                          className="btn-action btn-unsave"
                          onClick={(e) => handleUnsave(e, set.id)}
                          title="Bỏ lưu bộ từ"
                        >
                          <DeleteOutlined /> Bỏ lưu
                        </button>
                      ) : (
                        <button
                          className="btn-action btn-save"
                          onClick={(e) => handleSave(e, set.id)}
                          title="Lưu bộ từ"
                        >
                          Lưu
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn-action btn-unsave"
                      onClick={(e) => handleUnsave(e, set.id)}
                      title="Bỏ lưu bộ từ"
                    >
                      <DeleteOutlined /> Bỏ lưu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT TỪ VỰNG TRONG BỘ TỪ */}
      {selectedSet && (
        <div className="detail-modal-overlay" onClick={handleCloseDetail}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="header-titles">
                <div className="title-row" style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0 }}>{selectedSet?.setName || selectedSet?.wordSetName || "Chi tiết bộ từ"}</h2>
                  {wordSetDetail?.createBy && (
                    <span className="modal-creator-name" style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>by {wordSetDetail.createBy}</span>
                  )}
                </div>
                {selectedSet.description && (
                  <p className="modal-description-text" style={{ margin: "6px 0 0", fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>{selectedSet.description}</p>
                )}
              </div>
              <button className="btn-close-modal" onClick={handleCloseDetail}>
                <CloseOutlined />
              </button>
            </div>

            <div className="detail-modal-body">

              {detailLoading ? (
                <div className="detail-loading">
                  <LoadingOutlined className="spinner" />
                  <p>Đang tải chi tiết các từ vựng...</p>
                </div>
              ) : wordSetDetail && wordSetDetail.words && wordSetDetail.words.length > 0 ? (
                <div className="modal-words-list">
                  <div className="modal-words-list-header">
                    <h3>Danh sách từ vựng ({wordSetDetail.words.length} từ)</h3>
                    <button className="btn-toggle-all" onClick={handleToggleAllWords}>
                      {wordSetDetail.words.every(w => expandedWordIds.has(w.id)) ? "Ẩn tất cả nghĩa" : "Hiện tất cả nghĩa"}
                    </button>
                  </div>
                  <div className="words-grid">
                    {wordSetDetail.words.map((word, idx) => {
                      const isExpanded = expandedWordIds.has(word.id);
                      const fontStyle = {
                        fontSize: word.name.length > 25
                          ? "11px"
                          : word.name.length > 18
                            ? "13.5px"
                            : "16px"
                      };

                      // Tính toán EXP và Level (chỉ hiển thị khi đang ở tab bộ từ đã lưu)
                      const wordExp = activeTab === "saved" ? (word.exp !== undefined ? word.exp : getWordExp(word.id)) : 0;
                      const levelInfo = activeTab === "saved" ? getLevelInfo(wordExp) : null;

                      return (
                        <div
                          key={word.id || idx}
                          className={`word-card ${isExpanded ? "flipped" : ""} ${activeTab === "saved" ? `has-level level-${levelInfo.level}` : ""}`}
                          onClick={() => handleToggleWord(word.id)}
                        >
                          <div className="word-card-inner">
                            {/* Mặt trước: Từ vựng & Tiến trình */}
                            <div className="word-card-front">
                              {activeTab === "saved" ? (
                                <div
                                  className="word-level-badge"
                                  style={{
                                    color: levelInfo.color,
                                    backgroundColor: levelInfo.bg,
                                    borderColor: levelInfo.color
                                  }}
                                  title={`EXP tích lũy của từ: ${wordExp}`}
                                >
                                  {levelInfo.level}
                                </div>
                              ) : (
                                <div className="word-card-index">{idx + 1}</div>
                              )}
                              <div className="card-face-body">
                                <div className="word-name" style={fontStyle}>
                                  {word.name}
                                </div>
                              </div>
                              {activeTab === "saved" && (
                                <div className="word-progress-section" onClick={(e) => e.stopPropagation()}>
                                  <div className="word-progress-bar-wrapper">
                                    <div className="word-progress-bar-bg">
                                      <div
                                        className="word-progress-bar-fill"
                                        style={{
                                          width: `${levelInfo.progress}%`,
                                          backgroundColor: levelInfo.color
                                        }}
                                      />
                                    </div>
                                    <span className="word-exp-text">{levelInfo.expDisplay}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Mặt sau: Nghĩa & Ví dụ */}
                            <div className="word-card-back">
                              <div className="card-face-body">
                                <div className="word-definition">
                                  {word.definition}
                                </div>
                                {word.example && (
                                  <div className="word-example">
                                    <em>{word.example}</em>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="detail-empty">
                  <InboxOutlined className="empty-icon" />
                  <p>Bộ từ vựng này hiện chưa có từ nào trong danh sách.</p>
                </div>
              )}
            </div>

            <div className="detail-modal-footer">
              {activeTab === "created" ? (
                <>
                  <button
                    className="btn-footer-edit"
                    onClick={() => {
                      navigate(`/vocabulary?id=${selectedSet.id}`, {
                        state: {
                          setName: selectedSet.setName || selectedSet.wordSetName,
                          description: selectedSet.description,
                          visibility: selectedSet.visibility
                        }
                      });
                      handleCloseDetail();
                    }}
                  >
                    Chỉnh sửa bộ từ
                  </button>
                  {checkIsSaved(selectedSet.id) ? (
                    <button
                      className="btn-footer-unsave"
                      onClick={(e) => {
                        handleUnsave(e, selectedSet.id);
                        handleCloseDetail();
                      }}
                    >
                      Bỏ lưu bộ từ
                    </button>
                  ) : (
                    <button
                      className="btn-footer-save"
                      onClick={(e) => {
                        handleSave(e, selectedSet.id);
                        handleCloseDetail();
                      }}
                    >
                      Lưu bộ từ
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="btn-footer-study"
                    onClick={(e) => {
                      handleStudy(e, selectedSet.id, selectedSet.savedWordSetId || selectedSet.id);
                      handleCloseDetail();
                    }}
                  >
                    flashCard
                  </button>
                  <button
                    className="btn-footer-exercise"
                    onClick={(e) => {
                      handleExercise(e, selectedSet.id, selectedSet.savedWordSetId || selectedSet.id);
                      handleCloseDetail();
                    }}
                  >
                    Luyện tập
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyWordSetsPage;
