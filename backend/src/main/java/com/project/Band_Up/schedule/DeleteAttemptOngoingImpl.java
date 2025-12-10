package com.project.Band_Up.schedule;

import com.project.Band_Up.entities.Answer;
import com.project.Band_Up.entities.Attempt;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.AnswerRepository;
import com.project.Band_Up.repositories.AttemptRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeleteAttemptOngoingImpl implements DeleteAttemptOngoing {

    private final AttemptRepository attemptRepository;
    private final AttemptSectionRepository attemptSectionRepository;
    private final AnswerRepository answerRepository;

    @Scheduled(cron = "0 0 12 * * ?")
    @Transactional
    public void deleteExpiredOngoingAttempts() {
        log.info("========== START DELETE EXPIRED ONGOING ATTEMPTS ==========");
        log.info("Scheduled task started at: {}", LocalDateTime.now());

        try {
            // Tính thời điểm 5 giờ trước
            LocalDateTime fiveHoursAgo = LocalDateTime.now().minusHours(5);
            log.info("Checking for attempts started before: {}", fiveHoursAgo);

            // Lấy tất cả attempts có status ONGOING
            List<Attempt> ongoingAttempts = attemptRepository.findAllByUser_IdAndStatusOrderByStartAtDesc(null, Status.ONGOING);

            // Nếu không có repository method để lấy tất cả ONGOING, dùng cách này:
            List<Attempt> allAttempts = attemptRepository.findAll();
            List<Attempt> expiredAttempts = allAttempts.stream()
                    .filter(attempt -> attempt.getStatus() == Status.ONGOING)
                    .filter(attempt -> attempt.getStartAt() != null)
                    .filter(attempt -> attempt.getStartAt().isBefore(fiveHoursAgo))
                    .toList();

            log.info("Found {} expired ongoing attempts", expiredAttempts.size());

            // Xóa từng attempt
            int deletedCount = 0;
            for (Attempt attempt : expiredAttempts) {
                try {
                    deleteAttemptWithRelatedData(attempt);
                    deletedCount++;
                    log.info("Deleted attempt ID: {} (started at: {})",
                            attempt.getId(), attempt.getStartAt());
                } catch (Exception e) {
                    log.error("Failed to delete attempt ID: {}", attempt.getId(), e);
                }
            }

            log.info("Successfully deleted {} out of {} expired attempts",
                    deletedCount, expiredAttempts.size());

        } catch (Exception e) {
            log.error("Error during scheduled deletion of expired attempts", e);
        }

        log.info("========== END DELETE EXPIRED ONGOING ATTEMPTS ==========");
    }

    /**
     * Xóa attempt cùng với tất cả dữ liệu liên quan
     */
    private void deleteAttemptWithRelatedData(Attempt attempt) {
        log.debug("Deleting attempt and related data for attempt ID: {}", attempt.getId());

        // 1. Lấy tất cả AttemptSection của attempt này
        List<AttemptSection> attemptSections = attemptSectionRepository.findByAttemptId(attempt.getId());
        log.debug("Found {} attempt sections", attemptSections.size());

        // 2. Xóa tất cả Answer của từng AttemptSection
        for (AttemptSection attemptSection : attemptSections) {
            List<Answer> answers = answerRepository.findByAttemptSectionId(attemptSection.getId());
            if (!answers.isEmpty()) {
                answerRepository.deleteAll(answers);
                log.debug("Deleted {} answers for attempt section ID: {}",
                        answers.size(), attemptSection.getId());
            }
        }

        // 3. Xóa tất cả AttemptSection
        if (!attemptSections.isEmpty()) {
            attemptSectionRepository.deleteAll(attemptSections);
            log.debug("Deleted {} attempt sections", attemptSections.size());
        }

        // 4. Xóa Attempt
        attemptRepository.delete(attempt);
        log.debug("Deleted attempt ID: {}", attempt.getId());
    }

    /**
     * Method test để chạy thủ công (optional)
     * Có thể gọi từ controller hoặc test để kiểm tra
     */
    public void manualDeleteExpiredAttempts() {
        log.info("Manual deletion triggered");
        deleteExpiredOngoingAttempts();
    }
}