import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined
} from "@ant-design/icons";
import vocabApi from "../../api/vocabApi";
import "./flashCard.css";

function FlashCardPage() {
  const navigate = useNavigate();
  const [savedSets, setSavedSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for backend API
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 6; // Display 6 sets per page for a balanced grid

  useEffect(() => {
    fetchSavedSets(currentPage);
  }, [currentPage]);

  const fetchSavedSets = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vocabApi.getSavedWordSets(page, PAGE_SIZE);
      if (data) {
        setSavedSets(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bộ từ đã lưu:", err);
      setError("Không thể tải danh sách bộ từ đã lưu. Vui lòng kiểm tra lại kết nối hoặc thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleStudy = (setId) => {
    navigate(`/flash-card-game?id=${setId}&type=saved`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flashcard-list-wrapper">
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

      {loading ? (
        <div className="flashcard-list-loading">
          <LoadingOutlined className="spinner" />
          <p>Đang tải danh sách bộ từ đã lưu...</p>
        </div>
      ) : error ? (
        <div className="flashcard-list-error">
          <ExclamationCircleOutlined className="error-icon" />
          <p>{error}</p>
          <button className="btn-retry" onClick={() => fetchSavedSets(currentPage)}>
            Thử lại
          </button>
        </div>
      ) : savedSets.length === 0 ? (
        <div className="flashcard-list-empty">
          <InboxOutlined className="empty-icon" />
          <p>Bạn chưa lưu bộ từ vựng nào.</p>
          <p className="empty-sub">Hãy vào Thư viện công khai để khám phá và lưu các bộ từ yêu thích trước nhé!</p>
          <button className="btn-go-library" onClick={() => navigate("/library")}>
            Đến Thư viện ngay
          </button>
        </div>
      ) : (
        <>
          <div className="flashcard-grid">
            {savedSets.map((set) => {
              const setName = set?.setName || set?.wordSetName || "Không có tên bộ từ";
              const description = set?.description || "Không có mô tả.";
              const wordCount = set?.wordCount !== undefined ? set.wordCount : 0;
              return (
                <div key={set.id} className="flashcard-set-card" onClick={() => handleStudy(set.savedWordSetId || set.id)}>
                  <div className="card-card-top">
                    <span className="word-count-tag">
                      <BookOutlined /> {wordCount} từ
                    </span>
                    <h3 className="set-card-title">{setName}</h3>
                    <p className="set-card-desc">{description}</p>
                  </div>
                  <div className="card-card-bottom">
                    <button
                      className="btn-study-now"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudy(set.savedWordSetId || set.id);
                      }}
                    >
                      <PlayCircleOutlined /> Học ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                className="btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ArrowLeftOutlined /> Trước
              </button>
              <span className="page-indicator">
                Trang <strong>{currentPage + 1}</strong> / {totalPages}
              </span>
              <button
                className="btn-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Tiếp theo <ArrowRightOutlined />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FlashCardPage;
