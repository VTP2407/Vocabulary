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

  const fetchData = async (tab = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "created") {
        const data = await vocabApi.getMyWordSet();
        const listData = data && (data.content || data);
        setPersonalSets(Array.isArray(listData) ? listData : []);
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
    try {
      const detail = await vocabApi.getWordSetDetail(set.id);
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

  const handleCloseDetail = () => {
    setSelectedSet(null);
    setWordSetDetail(null);
  };

  const handleStudy = (e, id) => {
    e.stopPropagation();
    navigate(`/flash-card?id=${id}`);
  };

  const handleExercise = (e, id) => {
    e.stopPropagation();
    navigate(`/exercise?id=${id}`);
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
      {/* Tiêu đề & Mô tả */}
      <div className="my-vocab-header">
        <div className="header-text-section">
          <h1>Bộ từ của tôi</h1>
          <p>Quản lý và ôn tập các bộ từ vựng cá nhân của riêng bạn hoặc các bộ từ bạn đã lưu</p>
        </div>
        {activeTab === "created" && (
          <button className="btn-create-set" onClick={() => navigate("/vocabulary")}>
            <PlusOutlined /> Tạo bộ từ mới
          </button>
        )}
      </div>

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

        <div className="search-bar-wrapper">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                  <button className="btn-action btn-study" onClick={(e) => handleStudy(e, set.id)}>
                    Học ngay
                  </button>
                  <button className="btn-action btn-exercise" onClick={(e) => handleExercise(e, set.id)}>
                    Luyện tập
                  </button>
                  {activeTab === "saved" && (
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
                <h2>{selectedSet?.setName || selectedSet?.wordSetName || "Chi tiết bộ từ"}</h2>
                <span className={`visibility-badge ${selectedSet.visibility.toLowerCase()}`}>
                  {selectedSet.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
                </span>
              </div>
              <button className="btn-close-modal" onClick={handleCloseDetail}>
                <CloseOutlined />
              </button>
            </div>

            <div className="detail-modal-body">
              {(selectedSet.description || wordSetDetail?.createBy) && (
                <div className="detail-description">
                  {wordSetDetail?.createBy && (
                    <div style={{ marginBottom: selectedSet.description ? "6px" : "0" }}>
                      <strong>Người tạo: </strong> {wordSetDetail.createBy}
                    </div>
                  )}
                  {selectedSet.description && (
                    <div>
                      <strong>Mô tả: </strong> {selectedSet.description}
                    </div>
                  )}
                </div>
              )}

              {detailLoading ? (
                <div className="detail-loading">
                  <LoadingOutlined className="spinner" />
                  <p>Đang tải chi tiết các từ vựng...</p>
                </div>
              ) : wordSetDetail && wordSetDetail.words && wordSetDetail.words.length > 0 ? (
                <div className="modal-words-list">
                  <h3>Danh sách từ vựng ({wordSetDetail.words.length} từ)</h3>
                  <table className="detail-words-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>STT</th>
                        <th style={{ width: "200px" }}>Từ vựng</th>
                        <th>Định nghĩa</th>
                        {wordSetDetail.words.some(w => w.example) && <th>Ví dụ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {wordSetDetail.words.map((word, idx) => (
                        <tr key={word.id || idx}>
                          <td className="text-center font-bold">{idx + 1}</td>
                          <td className="word-name-cell">{word.name}</td>
                          <td>{word.definition}</td>
                          {wordSetDetail.words.some(w => w.example) && (
                            <td className="word-example-cell">{word.example || "-"}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default MyWordSetsPage;
