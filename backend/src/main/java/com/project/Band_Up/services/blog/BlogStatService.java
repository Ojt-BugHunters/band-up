package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.BlogStatsDto;
import com.project.Band_Up.enums.StatsInterval;

public interface BlogStatService {

    void saveDailyBlogStat();

    BlogStatsDto getStats(StatsInterval statsInterval);
}

