import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOutlined,
  GlobalOutlined,
  SearchOutlined,
  InboxOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  StarOutlined,
  StarFilled,
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import vocabApi from "../../api/vocabApi";
import "./library.css";

function LibraryPage() {
  const navigate = useNavigate();
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 12; // Hiển thị tối đa 12 bộ từ mỗi trang

  // Tìm kiếm & Lưu trữ
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSetMap, setSavedSetMap] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Modal xem chi tiết
  const [selectedSet, setSelectedSet] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [wordSetDetail, setWordSetDetail] = useState(null);
  const [expandedWordIds, setExpandedWordIds] = useState(new Set());

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPublicSets(currentPage, searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchSavedSetsList();
  }, []);

  // Tải danh sách bộ từ đã lưu của user để đồng bộ trạng thái nút "Lưu"
  const fetchSavedSetsList = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const savedList = await vocabApi.getSavedWordSets(0, 1000);
      const listData = savedList && (savedList.content || savedList);
      if (Array.isArray(listData)) {
        const mapping = {};
        listData.forEach(item => {
          mapping[item.id] = item.savedWordSetId || item.id;
        });
        setSavedSetMap(mapping);
      }
    } catch (err) {
      console.warn("Không thể tải trạng thái đồng bộ các bộ từ đã lưu:", err);
    }
  };

  const fetchPublicSets = async (page, query = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (query.trim()) {
        data = await vocabApi.searchPublicWordSets(query, page, PAGE_SIZE);
      } else {
        data = await vocabApi.getPublicWordSets(page, PAGE_SIZE);
      }
      // Backend trả về đối tượng Page
      if (data) {
        setPublicSets(data.content || []);
        setTotalPages(data.totalPages ?? data.page?.totalPages ?? 0);
        setTotalElements(data.totalElements ?? data.page?.totalElements ?? 0);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách thư viện công khai:", err);
      setError("Không thể kết nối API thư viện công khai. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }

  };

  const handleSaveSet = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để lưu bộ từ vựng!");
      navigate("/login");
      return;
    }

    setSavingId(id);
    try {
      await vocabApi.saveWordSet(id);
      await fetchSavedSetsList();
    } catch (err) {
      console.error("Lỗi khi lưu bộ từ:", err);
      alert("Lưu bộ từ thất bại, vui lòng thử lại!");
    } finally {
      setSavingId(null);
    }
  };

  const handleUnsaveSet = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Bạn có chắc chắn muốn bỏ lưu bộ từ này không?")) return;

    setSavingId(id);
    try {
      await vocabApi.unsaveWordSet(id);
      setSavedSetMap(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error("Lỗi khi bỏ lưu bộ từ:", err);
      alert("Bỏ lưu thất bại, vui lòng thử lại!");
    } finally {
      setSavingId(null);
    }
  };
  const handleOpenDetail = async (set) => {
    setSelectedSet(set);
    setDetailLoading(true);
    setWordSetDetail(null);
    setExpandedWordIds(new Set());
    try {
      const detail = await vocabApi.getWordSetDetail(set.id);
      setWordSetDetail(detail);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết bộ từ:", err);
      setWordSetDetail({
        ...set,
        words: []
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const speakWord = (text) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // Slightly slower for clear learning
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleWord = (wordId) => {
    const word = wordSetDetail?.words?.find(w => w.id === wordId);
    setExpandedWordIds(prev => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
        if (word && word.name) {
          speakWord(word.name);
        }
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

  const handleStudy = (e, id) => {
    e.stopPropagation();
    const isSaved = !!savedSetMap[id];
    if (isSaved) {
      navigate(`/flash-card-game?id=${savedSetMap[id]}&type=saved`);
    } else {
      navigate(`/flash-card-game?id=${id}&type=public`);
    }
  };

  const handleExercise = (e, id) => {
    e.stopPropagation();
    const isSaved = !!savedSetMap[id];
    if (isSaved) {
      navigate(`/exercise?id=${savedSetMap[id]}&type=saved`);
    } else {
      navigate(`/exercise?id=${id}&type=public`);
    }
  };

  // Dữ liệu bộ từ đã được lọc và phân trang từ Server-side
  const filteredSets = publicSets;

  const getPageNumbers = () => {
    const maxButtons = 5;
    let startPage = Math.max(0, currentPage - 2);
    let endPage = startPage + maxButtons - 1;

    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - maxButtons + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="library-page-wrapper">
      {/* Header */}
      <div className="library-header">
        <div className="search-bar-wrapper">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>

      {/* Hiển thị Loading / Lỗi / Nội dung */}
      {loading ? (
        <div className="library-loading">
          <LoadingOutlined className="spinner" />
          <p>Đang tải tài liệu thư viện...</p>
        </div>
      ) : error ? (
        <div className="library-error">
          <ExclamationCircleOutlined className="error-icon" />
          <p>{error}</p>
          <button className="btn-retry" onClick={() => fetchPublicSets(currentPage)}>Thử lại</button>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="library-empty">
          <InboxOutlined className="empty-icon" />
          {searchQuery ? (
            <p>Không tìm thấy bộ từ nào khớp với từ khóa "{searchQuery}" trên trang này</p>
          ) : (
            <p>Hiện tại chưa có bộ từ vựng công khai nào trong hệ thống.</p>
          )}
        </div>
      ) : (
        <>
          {/* Grid danh sách bộ từ */}
          <div className="library-grid">
            {filteredSets.map((set) => {
              const setName = set?.setName || set?.wordSetName || "Không có tên bộ từ";
              const description = set?.description || "Không có mô tả cho bộ từ này.";
              const isSaved = !!savedSetMap[set.id];

              return (
                <div key={set.id} className="library-card" onClick={() => handleOpenDetail(set)}>
                  <div className="card-top">
                    <div className="card-badge-row">
                      <span className="visibility-badge public">
                        <GlobalOutlined /> Công khai
                      </span>
                      {set.wordCount !== undefined && set.wordCount !== null && (
                        <span className="word-count-badge">
                          {set.wordCount} từ
                        </span>
                      )}
                    </div>
                    <h3 className="card-title">{setName}</h3>
                    <p className="card-desc">{description}</p>
                  </div>

                  <div className="card-actions">
                    {isSaved ? (
                      <>
                        <button className="btn-action btn-study" onClick={(e) => handleStudy(e, set.id)}>
                          flashCard
                        </button>
                        <button className="btn-action btn-exercise" onClick={(e) => handleExercise(e, set.id)}>
                          Luyện tập
                        </button>
                        <button
                          className="btn-action btn-unsave"
                          onClick={(e) => handleUnsaveSet(e, set.id)}
                          disabled={savingId === set.id}
                          title="Bỏ lưu bộ từ"
                        >
                          {savingId === set.id ? (
                            <LoadingOutlined />
                          ) : (
                            <><DeleteOutlined /> Bỏ lưu</>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-action btn-bookmark"
                        onClick={(e) => handleSaveSet(e, set.id)}
                        disabled={savingId === set.id}
                        title="Lưu bộ từ vựng"
                      >
                        {savingId === set.id ? (
                          <LoadingOutlined />
                        ) : (
                          <><StarOutlined /> Lưu</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Điều khiển phân trang (Pagination) */}
          {totalPages > 0 && (
            <div className="pagination-container">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ArrowLeftOutlined /> Trước
              </button>

              <div className="pagination-numbers">
                {getPageNumbers().map((index) => (
                  <button
                    key={index}
                    className={`pagination-num-btn ${currentPage === index ? "active" : ""}`}
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Sau <ArrowRightOutlined />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL CHI TIẾT TỪ VỰNG TRONG BỘ TỪ */}
      {selectedSet && (
        <div className="detail-modal-overlay" onClick={handleCloseDetail}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="header-titles">
                <div className="title-row" style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0 }}>{selectedSet.setName || selectedSet.wordSetName || "Chi tiết bộ từ"}</h2>
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
                      return (
                        <div
                          key={word.id || idx}
                          className={`word-card ${isExpanded ? "flipped" : ""}`}
                          onClick={() => handleToggleWord(word.id)}
                        >
                          <div className="word-card-inner">
                            {/* Mặt trước: Từ vựng */}
                            <div className="word-card-front">
                              <div className="word-card-index">{idx + 1}</div>
                              <div className="card-face-body">
                                <div className="word-name" style={fontStyle}>
                                  {word.name}
                                </div>
                              </div>
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
              <button className="btn-footer-study" onClick={(e) => { handleStudy(e, selectedSet.id); handleCloseDetail(); }}>
                Học bằng Flash Card
              </button>
              <button className="btn-footer-exercise" onClick={(e) => { handleExercise(e, selectedSet.id); handleCloseDetail(); }}>
                Luyện tập bài tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryPage;
