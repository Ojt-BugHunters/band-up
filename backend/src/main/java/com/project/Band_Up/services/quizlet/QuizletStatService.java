package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.dtos.quizlet.CompletionRateDto;
import com.project.Band_Up.dtos.quizlet.QuizletStatsDto;
import com.project.Band_Up.enums.StatsInterval;

import java.util.List;

public interface QuizletStatService {

    public void saveDailyQuizletStat();

    public QuizletStatsDto getStats(StatsInterval statsInterval);

    public List<CompletionRateDto> getCompletionRate(int year);

}
