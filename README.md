<h1 align="center">Dự án học từ vựng tiếng anh</h1>

link web: https://www.vocabulary-vtp.id.vn .<br>
Chỉ hỗ trợ học từ vựng <br>

## Các chức năng hiện có thể sử dụng:

- Tạo 1 bộ từ mới, lưu bộ từ
- Học bằng flashcard
- Học bằng bài luyện tập: trắc nghiệm và điền từ
- Hệ thống cấp độ cho từng từ:

  + Sẽ tính cấp độ cho mỗi từ dựa trên lượng exp từ đó đang có và đổi màu thẻ theo level
  + Cấp 0: exp<10, màu xám
  + Cấp 1: 10<=exp<35, màu xanh lá
  + Cấp 2: 35<=exp<85, màu xanh lam
  + Cấp 3: 85<=exp<185, màu tím
  + Cấp 4: 185<=exp<435, màu đỏ
  + Cấp 5: 435<=exp, màu cầu vồng
  + Với mỗi câu đúng trong trắc nghiệm +1 exp, điền từ +2 exp

## FE

+ Dùng AI

## BE

- Tự làm
- Login bằng Google: Khi đăng nhập bằng Google
  -> Google xác minh và gửi về Token ID
  -> giải mã ID Token này để lấy thông tin người dùng
  -> sử dụng thông tin này để tạo JWT xác minh định danh cho mỗi người dùng
- Login thường: đăng ký tài khoản và mật khẩu trên web
  -> khi đăng nhập tạo JWT xác minh người dùng tương tự như trên
- Mỗi tài khoản sẽ dùng 1 email nhất định, nếu đăng ký rồi mà đăng nhập bằng Google thì vẫn vào tài khoản cũ

## Database

- Lưu đầy đủ các thông tin cần thiết như thông tin người dùng, bộ từ, từ
- WordSet 1-n: ON DELETE CASCADE
- SavedWordSet 1-n SavedWord: ON DELETE CASCADE
- Trong SavedWordSet lưu source_word-set_id và user_id để tránh lưu trùng với 1 người

<Có thể sẽ phát triển thêm chức năng kiểm tra, với mỗi câu đúng +5 exp cho từ tương ứng, hoặc không! :) bye>
