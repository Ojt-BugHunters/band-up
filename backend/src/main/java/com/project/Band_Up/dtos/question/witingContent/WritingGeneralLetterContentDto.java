package com.project.Band_Up.dtos.question.witingContent;

public class WritingGeneralLetterContentDto {
    //xài cho letter
    /**
     * Đề bài (HTML)
     */
    private String promptHtml;

    /**
     * Có file ảnh/diagram không (bar, line, map...) lưu trên S3
     * FE sẽ hiển thị theo link này
     */
    private String imageUrl;

    /**
     * Gợi ý nếu là process/map (optional)
     */
    private String hintHtml;

    /**
     * Có thể dùng cho mục luyện thi: model answer / band 9 sample
     */
    private String explanationHtml;
}
