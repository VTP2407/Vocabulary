import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  LockOutlined,
  GlobalOutlined,
  BookOutlined,
  InboxOutlined
} from "@ant-design/icons";
import vocabApi from "../../api/vocabApi";
import "./vocabulary.css";

function VocabularyPage() {
  const navigate = useNavigate();
  const [setName, setSetName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  
  // Khởi tạo danh sách từ với 3 dòng trống ban đầu để người dùng dễ nhập liệu
  const [words, setWords] = useState([
    { id: 1, name: "", definition: "", example: "" },
    { id: 2, name: "", definition: "", example: "" },
    { id: 3, name: "", definition: "", example: "" }
  ]);
  
  const [isExampleVisible, setIsExampleVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });

  // Hàm thêm một hàng nhập từ mới
  const handleAddWord = () => {
    const newWord = {
      id: Date.now() + Math.random(),
      name: "",
      definition: "",
      example: ""
    };
    setWords((prevWords) => [...prevWords, newWord]);
    
    // Cuộn mượt mà tới chân bảng từ vựng (nơi hàng mới vừa xuất hiện)
    setTimeout(() => {
      const footerElement = document.querySelector(".vocab-table-footer") || document.querySelector(".vocab-form-actions");
      if (footerElement) {
        footerElement.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 80);
  };

  // Hàm xóa hàng nhập từ theo ID
  const handleDeleteWord = (id) => {
    setWords((prevWords) => prevWords.filter((word) => word.id !== id));
  };

  // Thay đổi thông tin trên từng ô nhập liệu của bảng từ vựng
  const handleWordChange = (id, field, value) => {
    setWords((prevWords) =>
      prevWords.map((word) => (word.id === id ? { ...word, [field]: value } : word))
    );
  };

  // Xử lý gửi biểu mẫu tạo bộ từ vựng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", text: "" });

    // 1. Kiểm tra tính hợp lệ của tên bộ từ
    if (!setName.trim()) {
      setAlert({ type: "error", text: "Vui lòng nhập tên bộ từ vựng!" });
      return;
    }

    // 2. Lọc danh sách từ vựng hợp lệ (bỏ qua những dòng trống hoàn toàn)
    const activeWords = words.filter(
      (word) => word.name.trim() !== "" || word.definition.trim() !== "" || word.example.trim() !== ""
    );

    if (activeWords.length === 0) {
      setAlert({ type: "error", text: "Vui lòng nhập ít nhất một từ vựng trong danh sách!" });
      return;
    }

    // Kiểm tra xem có từ nào bị khuyết tên hoặc định nghĩa không
    const invalidWord = activeWords.find(
      (word) => !word.name.trim() || !word.definition.trim()
    );

    if (invalidWord) {
      setAlert({ type: "error", text: "Tất cả các từ vựng phải điền đầy đủ cả Từ vựng và Định nghĩa!" });
      return;
    }

    // 3. Chuẩn bị payload gửi lên API
    
    // Ánh xạ danh sách từ sang dạng gửi lên backend
    // Nếu cột Ví dụ bị ẩn (isExampleVisible = false), lược bỏ trường example khỏi payload gửi đi
    const formattedWords = activeWords.map((word) => {
      const wordPayload = {
        name: word.name.trim(),
        definition: word.definition.trim()
      };
      
      if (isExampleVisible) {
        wordPayload.example = word.example.trim();
      }
      
      return wordPayload;
    });

    const payload = {
      setName: setName.trim(),
      description: description.trim(),
      visibility: visibility,
      words: formattedWords
    };

    console.log("=== Payload gửi lên API tạo bộ từ mới ===");
    console.log(JSON.stringify(payload, null, 2));

    setIsSaving(true);
    try {
      await vocabApi.createWordSet(payload);
      setAlert({ type: "success", text: "Tạo bộ từ vựng mới thành công! Đang chuyển về bộ từ của tôi..." });
      
      // Reset form
      setSetName("");
      setDescription("");
      setWords([
        { id: 1, name: "", definition: "", example: "" },
        { id: 2, name: "", definition: "", example: "" },
        { id: 3, name: "", definition: "", example: "" }
      ]);

      // Chuyển hướng về trang bộ từ của tôi sau 2 giây
      setTimeout(() => {
        navigate("/my-sets");
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi tạo bộ từ vựng:", error);
      const errorMsg = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi tạo bộ từ vựng. Vui lòng thử lại!";
      setAlert({ type: "error", text: `Lỗi: ${errorMsg}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="vocab-page-container">
      {/* Tiêu đề trang */}
      <div className="vocab-page-header">
        <h1 className="vocab-title">Tạo Bộ Từ Vựng Mới</h1>
        <p className="vocab-subtitle">Xây dựng bộ thẻ từ thông minh theo chủ đề của riêng bạn</p>
      </div>

      {/* Hiển thị Alert thông báo */}
      {alert.text && (
        <div className={`vocab-alert ${alert.type}`}>
          {alert.type === "success" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Thẻ chứa biểu mẫu nhập liệu */}
      <form onSubmit={handleSubmit} className="vocab-card">
        
        {/* Phần thông tin bộ từ */}
        <div className="vocab-section-title">
          <BookOutlined /> Thông tin bộ từ
        </div>

        <div className="vocab-form-grid">
          {/* Tên bộ từ */}
          <div className="vocab-form-group">
            <label htmlFor="set-name">
              Tên bộ từ <span className="required-dot">*</span>
            </label>
            <input
              type="text"
              id="set-name"
              className="vocab-input"
              placeholder="Ví dụ: Từ vựng IELTS Topic Education"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          {/* Phạm vi */}
          <div className="vocab-form-group">
            <label>Phạm vi</label>
            <div className="visibility-single-toggle">
              <button
                type="button"
                className={`visibility-toggle-btn ${visibility === "PUBLIC" ? "public" : "private"}`}
                onClick={() => !isSaving && setVisibility(prev => prev === "PUBLIC" ? "PRIVATE" : "PUBLIC")}
                title="Bấm để đổi giữa Công khai và Riêng tư"
              >
                {visibility === "PUBLIC" ? (
                  <>
                    <GlobalOutlined /> Công khai
                  </>
                ) : (
                  <>
                    <LockOutlined /> Riêng tư
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mô tả bộ từ */}
          <div className="vocab-form-group vocab-full-width">
            <label htmlFor="set-desc">Mô tả bộ từ</label>
            <div className="vocab-desc-container">
              <div className="vocab-desc-textarea-wrapper">
                <textarea
                  id="set-desc"
                  className="vocab-input vocab-textarea"
                  placeholder="Ghi chú hoặc mô tả ngắn gọn về bộ từ vựng này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phần danh sách từ */}
        <div className="vocab-list-section">
          <div className="vocab-list-header-bar">
            <h2 className="vocab-list-title">Danh sách từ vựng</h2>
            <div className="vocab-list-header-actions">
              <span className="vocab-list-count">Số lượng: {words.length} từ</span>
              
              {/* Dropdown Thêm cột */}
              <div className="add-column-dropdown-container">
                <button
                  type="button"
                  className="btn-add-column"
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                  disabled={isSaving}
                >
                  <PlusOutlined /> Thêm cột
                </button>
                {isDropdownOpen && (
                  <div className="add-column-dropdown-menu">
                    {!isExampleVisible ? (
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setIsExampleVisible(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Ví dụ
                      </div>
                    ) : (
                      <div className="dropdown-item disabled" title="Cột ví dụ đã được thêm vào bảng">
                        Ví dụ (đã thêm)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="vocab-table-wrapper">
            {words.length === 0 ? (
              <div className="empty-table-placeholder">
                <InboxOutlined className="empty-icon" />
                <p>Chưa có từ vựng nào trong danh sách. Hãy nhấn nút "Thêm từ mới" ở dưới để bắt đầu!</p>
              </div>
            ) : (
              <table className="vocab-table">
                <thead>
                  <tr>
                    <th className="col-stt">STT</th>
                    <th className="col-word">Từ vựng</th>
                    <th className="col-def">Định nghĩa</th>
                    {isExampleVisible && (
                      <th className="col-example">
                        <div className="example-header-content">
                          <span>Ví dụ</span>
                          <button
                            type="button"
                            className="btn-remove-column"
                            onClick={() => setIsExampleVisible(false)}
                            title="Xóa cột ví dụ"
                          >
                            <CloseOutlined />
                          </button>
                        </div>
                      </th>
                    )}
                    <th className="col-action">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word, index) => (
                    <tr key={word.id}>
                      <td className="col-stt">
                        <span className="stt-badge">{index + 1}</span>
                      </td>
                      <td className="col-word">
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Nhập từ..."
                          value={word.name}
                          onChange={(e) => handleWordChange(word.id, "name", e.target.value)}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="col-def">
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Nhập nghĩa..."
                          value={word.definition}
                          onChange={(e) => handleWordChange(word.id, "definition", e.target.value)}
                          disabled={isSaving}
                        />
                      </td>
                      {isExampleVisible && (
                        <td className="col-example">
                          <input
                            type="text"
                            className="table-input"
                            placeholder="Nhập ví dụ minh họa..."
                            value={word.example}
                            onChange={(e) => handleWordChange(word.id, "example", e.target.value)}
                            disabled={isSaving}
                          />
                        </td>
                      )}
                      <td className="col-action">
                        <button
                          type="button"
                          className="btn-delete-row"
                          onClick={() => handleDeleteWord(word.id)}
                          disabled={isSaving}
                          title="Xóa từ này"
                        >
                          <MinusOutlined />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Nút thêm từ ở dưới danh sách bảng */}
          {words.length > 0 && (
            <div className="vocab-table-footer">
              <button
                type="button"
                className="btn-add-row-bottom"
                onClick={handleAddWord}
                disabled={isSaving}
              >
                <PlusOutlined /> Thêm từ mới
              </button>
            </div>
          )}
        </div>

        {/* Nút gửi form */}
        <div className="vocab-form-actions">
          <button
            type="button"
            className="btn-vocab-cancel"
            onClick={() => navigate(-1)}
            disabled={isSaving}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn-vocab-submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoadingOutlined /> Đang xử lý...
              </>
            ) : (
              "Tạo bộ từ vựng"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default VocabularyPage;
