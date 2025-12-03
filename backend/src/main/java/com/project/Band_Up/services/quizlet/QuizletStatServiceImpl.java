package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CompletionRateDto;
import com.project.Band_Up.dtos.quizlet.QuizletStatsDto;
import com.project.Band_Up.entities.QuizletStat;
import com.project.Band_Up.enums.StatsInterval;
import com.project.Band_Up.repositories.CardRepository;
import com.project.Band_Up.repositories.DeckRepository;
import com.project.Band_Up.repositories.QuizletStatRepository;
import com.project.Band_Up.repositories.StudyProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuizletStatServiceImpl implements QuizletStatService {

    @Autowired
    private QuizletStatRepository quizletStatRepository;
    @Autowired
    private DeckRepository deckRepository;
    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private StudyProgressRepository studyProgressRepository;

    @Override
    @Scheduled(cron = "0 59 23 * * *") // Run every day at 23:59
    public void saveDailyQuizletStat() {
        int activeDecks = (int) deckRepository.count();
        int totalCards = (int) cardRepository.count();
        int totalLearners = deckRepository.sumLearnerNumber();

        float completionRate = 0;
        if (activeDecks > 0) {
            completionRate = (float) studyProgressRepository.countDistinctDeck() / activeDecks;
        }

        QuizletStat quizletStat = QuizletStat.builder()
                .activeDecks(activeDecks)
                .totalCards(totalCards)
                .totalLearners(totalLearners)
                .completionRate(completionRate)
                .recordedAt(LocalDateTime.now())
                .build();

        quizletStatRepository.save(quizletStat);
    }

    @Override
    public QuizletStatsDto getStats(StatsInterval statsInterval) {
        int activeDecks = (int) deckRepository.count();
        int totalCards = (int) cardRepository.count();
        int totalLearners = deckRepository.sumLearnerNumber();

        float completionRate = 0;
        if (activeDecks > 0) {
            completionRate = (float) studyProgressRepository.countDistinctDeck() / activeDecks;
        }

        LocalDateTime targetDate = LocalDateTime.now();
        switch (statsInterval) {
            case DAILY:
                targetDate = targetDate.minusDays(1).toLocalDate().atTime(23, 59, 59);
                break;
            case WEEKLY:
                targetDate = targetDate.minusWeeks(1)
                        .with(java.time.DayOfWeek.SUNDAY)
                        .toLocalDate().atTime(23, 59, 59);
                break;
            case MONTHLY:
                targetDate = targetDate.minusMonths(1)
                        .withDayOfMonth(1)
                        .minusDays(1)
                        .toLocalDate().atTime(23, 59, 59);
                break;
            case YEARLY:
                targetDate = targetDate.minusYears(1)
                        .withMonth(12)
                        .withDayOfMonth(31)
                        .toLocalDate().atTime(23, 59, 59);
                break;
        }

        final int finalActiveDecks = activeDecks;
        final int finalTotalCards = totalCards;
        final int finalTotalLearners = totalLearners;
        final float finalCompletionRate = completionRate;

        var previousStats = quizletStatRepository.findTopByRecordedAtBeforeOrderByRecordedAtDesc(targetDate);

        int activeDecksDifference = previousStats.map(stats -> finalActiveDecks - stats.getActiveDecks()).orElse(0);
        int totalCardsDifference = previousStats.map(stats -> finalTotalCards - stats.getTotalCards()).orElse(0);
        int totalLearnersDifference = previousStats.map(stats -> finalTotalLearners - stats.getTotalLearners()).orElse(0);
        float completionRateDifference = previousStats.map(stats -> finalCompletionRate - stats.getCompletionRate()).orElse(0f);

        return QuizletStatsDto.builder()
                .activeDecks(activeDecks)
                .activeDecksDifference(activeDecksDifference)
                .totalCards(totalCards)
                .totalCardsDifference(totalCardsDifference)
                .totalLearners(totalLearners)
                .totalLearnersDifference(totalLearnersDifference)
                .completionRate(completionRate)
                .completionRateDifference(completionRateDifference)
                .statsInterval(statsInterval)
                .build();
    }

    @Override
    public List<CompletionRateDto> getCompletionRate(int year) {
        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();

        List<CompletionRateDto> completionRates = new java.util.ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            LocalDateTime endOfMonth = LocalDateTime.of(currentYear, month, 1, 23, 59, 59)
                    .withDayOfMonth(LocalDateTime.of(currentYear, month, 1, 0, 0).toLocalDate().lengthOfMonth());

            if (endOfMonth.isAfter(now)) {
                break;
            }

            var monthStats = quizletStatRepository.findTopByRecordedAtBeforeOrderByRecordedAtDesc(endOfMonth);

            int rate = monthStats.map(stats -> (int) (stats.getCompletionRate() * 100)).orElse(0);

            String monthName = java.time.Month.of(month).name();
            monthName = monthName.substring(0, 1).toUpperCase() + monthName.substring(2);

            completionRates.add(CompletionRateDto.builder()
                    .month(monthName)
                    .rate(rate)
                    .build());
        }

        return completionRates;
    }
}
