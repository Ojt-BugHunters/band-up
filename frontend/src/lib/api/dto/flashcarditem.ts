export interface FlashcardItem {
    id: string;
    flashcard_id: string; // liên kết về bộ thẻ
    front: string; // câu hỏi hoặc từ vựng
    back: string;  // giải thích hoặc nghĩa
    example?: string; // ví dụ (nếu có)
}