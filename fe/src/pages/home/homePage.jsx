import { Link } from "react-router-dom";
import helloOwlImg from "../../assets/Hello_owl.webp";
import cardIcon from "../../assets/card_icon.webp";
import documentIcon from "../../assets/document_icon.webp";
import testIcon from "../../assets/test_icon.webp";
import newSetIcon from "../../assets/new_set_icon.webp";
import pageIcon from "../../assets/page_icon.webp";
import "./homePage.css";

function HomePage() {
  return (
    <div className="homepage-wrapper">
      {/* BANNER SECTION */}
      <section className="banner-section">
        <h1 className="banner-title">Khám phá hành trình từ vựng của bạn</h1>
        <p className="banner-subtitle">
          Chào mừng bạn đến với VTP Vocabulary. Hãy chọn một cách học để bắt đầu!
        </p>

        {/* ILLUSTRATION CENTER CONTAINER */}
        <div className="illustration-center-container">
          {/* Left flying book */}
          <img src={pageIcon} alt="Decor Book Left" className="decor-img decor-book-left" />
          
          {/* Main Mascot Owl */}
          <div className="mascot-wrapper">
            <img src={helloOwlImg} alt="Hello Owl Mascot" className="main-mascot" />
            <div className="sparkle-spark">✦</div>
            <div className="sparkle-spark-alt">✦</div>
          </div>

          {/* Right flying book */}
          <img src={pageIcon} alt="Decor Book Right" className="decor-img decor-book-right" />
        </div>
      </section>

      {/* LEARNING MODES GRID */}
      <section className="modes-grid-section">
        <div className="cards-grid">
          {/* Card 1: Flash Card */}
          <div className="mode-card">
            <div className="card-icon-wrapper">
              <img src={cardIcon} alt="Flash Card Icon" className="card-icon" />
            </div>
            <h2 className="card-title">Học bằng Flash Card</h2>
            <p className="card-description">
              Học từ vựng nhanh chóng qua từ thông minh.
            </p>
            <Link to="/flash-card" className="card-btn">
              BẮT ĐẦU NGAY
            </Link>
          </div>

          {/* Card 2: Exercise */}
          <div className="mode-card">
            <div className="card-icon-wrapper">
              <img src={documentIcon} alt="Exercise Icon" className="card-icon" />
            </div>
            <h2 className="card-title">Bài luyện tập</h2>
            <p className="card-description">
              Củng cố kiến thức qua bài tập đa dạng.
            </p>
            <Link to="/exercise" className="card-btn">
              LUYỆN TẬP
            </Link>
          </div>

          {/* Card 3: Test */}
          <div className="mode-card">
            <div className="card-icon-wrapper">
              <img src={testIcon} alt="Test Icon" className="card-icon" />
            </div>
            <h2 className="card-title">Làm bài kiểm tra</h2>
            <p className="card-description">
              Đánh giá sự tiến bộ bạn và nhận huy hiệu.
            </p>
            <Link to="/test" className="card-btn">
              KIỂM TRA
            </Link>
          </div>

          {/* Card 4: Create Vocabulary */}
          <div className="mode-card">
            <div className="card-icon-wrapper">
              <img src={newSetIcon} alt="Create Vocabulary Icon" className="card-icon" />
            </div>
            <h2 className="card-title">Tạo bộ từ vựng mới</h2>
            <p className="card-description">
              Tạo danh sách từ, ví dụ, và âm thanh theo chủ đề của bạn.
            </p>
            <Link to="/vocabulary" className="card-btn">
              TẠO BỘ TỪ MỚI
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER LINK */}
      <footer className="homepage-footer">
        <Link to="#" className="other-activities-link">
          Xem các hoạt động khác
        </Link>
      </footer>
    </div>
  );
}

export default HomePage;
