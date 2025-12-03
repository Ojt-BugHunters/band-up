package com.project.Band_Up.dtos.blog;

import com.project.Band_Up.enums.StatsInterval;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogStatsDto {

    private long totalViews;
    private long totalViewsDifference;

    private int totalBlogs;
    private int totalBlogsDifference;

    private float avgEngagement;
    private float avgEngagementDifference;

    private float avgReadTime;
    private float avgReadTimeDifference;

    private StatsInterval statsInterval;
}

