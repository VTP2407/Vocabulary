import axiosClient from "./axiosClient";

const vocabApi = {
    // API tạo bộ từ mới kèm danh sách các từ vựng
    // - Request Body (Dữ liệu gửi đi): KHÔNG chứa "id" và "wordSetId" (tự tăng ở backend)
    //   {
    //      "setName": "Tên bộ từ vựng",
    //      "description": "Mô tả của bộ từ",
    //      "visibility": "PUBLIC",
    //      "words": [
    //         {
    //            "name": "Từ vựng",
    //            "definition": "Định nghĩa",
    //            "example": "Ví dụ minh họa (bỏ qua nếu ẩn cột)"
    //         }
    //      ]
    //   }
    //
    // - Response (Kết quả trả về): Chứa các "id" và "wordSetId" tự sinh ở backend:
    //   {
    //      "id": 1,
    //      "setName": "Tên bộ từ vựng",
    //      "description": "Mô tả của bộ từ",
    //      "visibility": "PUBLIC",
    //      "words": [
    //         {
    //            "id": 10,
    //            "name": "Từ vựng",
    //            "definition": "Định nghĩa",
    //            "example": "Ví dụ minh họa",
    //            "wordSetId": 1
    //         }
    //      ]
    //   }
    createWordSet: async (data) => {
        const response = await axiosClient.post("/api/word-set/create", data);
        return response.data;
    },

    // Lấy các bộ từ do người dùng tự tạo (Phân trang)
    // - Request: GET /api/word-set/my?page=0&size=20
    // - Response (Kết quả trả về): Đối tượng Page phân trang
    //   {
    //      "content": [
    //         {
    //            "id": 1,
    //            "setName": "Tên bộ từ vựng",
    //            "description": "Mô tả bộ từ",
    //            "visibility": "PUBLIC",
    //            "wordCount": 15,
    //            "createdAt": "2026-07-09T10:00:00",
    //            "updatedAt": "2026-07-09T10:00:00"
    //         }
    //      ],
    //      "totalPages": 1,
    //      "totalElements": 1
    //   }
    getMyWordSet: async (page = 0, size = 20) => {
        const response = await axiosClient.get("/api/word-set/my", {
            params: { page, size }
        });
        return response.data;
    },

    // Lấy các bộ từ người dùng đã lưu (Phân trang)
    // - Request: GET /api/word-set/saved?page=0&size=20
    // - Response (Kết quả trả về): Đối tượng Page phân trang
    //   {
    //      "content": [
    //         {
    //            "id": 2,
    //            "setName": "Tên bộ từ đã lưu",
    //            "description": "Mô tả bộ từ",
    //            "userId": 12,
    //            "visibility": "PUBLIC",
    //            "wordCount": 8,
    //            "createdAt": "2026-07-09T09:00:00",
    //            "updatedAt": "2026-07-09T09:00:00"
    //         }
    //      ],
    //      "totalPages": 1,
    //      "totalElements": 1
    //   }
    getSavedWordSets: async (page = 0, size = 20) => {
        const response = await axiosClient.get("/api/word-set/saved", {
            params: { page, size }
        });
        return response.data;
    },

    // Lưu bộ từ vựng (Bookmark)
    // - Request: POST /api/word-set/{wordSetId}/save?wordSetId={wordSetId}
    // - Response (Kết quả trả về): Chuỗi thông báo thành công từ backend
    saveWordSet: async (wordSetId) => {
        const response = await axiosClient.post(`/api/word-set/${wordSetId}/save`, null, {
            params: { wordSetId }
        });
        return response.data;
    },

    // Bỏ lưu bộ từ vựng (Unbookmark)
    // - Request: DELETE /api/word-set/{wordSetId}/unsave?wordSetId={wordSetId}
    // - Response (Kết quả trả về): Chuỗi thông báo thành công từ backend
    unsaveWordSet: async (wordSetId) => {
        const response = await axiosClient.delete(`/api/word-set/${wordSetId}/unsave`, {
            params: { wordSetId }
        });
        return response.data;
    },

    // Chi tiết bộ từ vựng (kèm các từ trong bộ từ đó)
    // - Request: GET /api/word-set/{wordSetId}
    // - Response (Kết quả trả về): Dạng PublicWordSetDetail từ Backend
    //   {
    //      "createBy": "Tên người tạo",
    //      "setName": "Tên bộ từ vựng",
    //      "words": [
    //         {
    //            "id": 5,
    //            "name": "Từ vựng",
    //            "definition": "Định nghĩa",
    //            "example": "Ví dụ minh họa",
    //            "wordSetId": 1
    //         }
    //      ]
    //   }
    getWordSetDetail: async (wordSetId) => {
        const response = await axiosClient.get(`/api/word-set/${wordSetId}`);
        return response.data;
    },

    // Lấy danh sách bộ từ công khai (Phân trang)
    // - Request: GET /api/word-set/public?page=0&size=20
    // - Response (Kết quả trả về): Đối tượng Page phân trang chuẩn
    //   {
    //      "content": [
    //         {
    //            "id": 1,
    //            "setName": "Tên bộ từ",  // hoặc "wordSetName"
    //            "description": "Mô tả bộ từ",
    //            "visibility": "PUBLIC",
    //            "wordCount": 12
    //         }
    //      ],
    //      "totalPages": 3,
    //      "totalElements": 45,
    //      "size": 20,
    //      "number": 0,
    //      "first": true,          // true nếu là trang đầu tiên
    //      "last": false           // true nếu là trang cuối cùng
    //   }
    getPublicWordSets: async (page = 0, size = 20) => {
        const response = await axiosClient.get("/api/word-set/public", {
            params: { page, size }
        });
        return response.data;
    }
};

export default vocabApi;
