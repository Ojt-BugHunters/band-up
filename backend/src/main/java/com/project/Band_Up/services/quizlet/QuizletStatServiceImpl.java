package com.project.Band_Up.services.quizlet;

import com.project.Band_Up.repositories.CardRepository;
import com.project.Band_Up.repositories.DeckRepository;
import com.project.Band_Up.repositories.QuizletStatRepository;
import com.project.Band_Up.repositories.StudyProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public void saveDailyQuizletStat() {
        int totalLearners = studyProgressRepository.findDistinctAccounts().size();

    }

}
