package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.BlogStatsDto;
import com.project.Band_Up.entities.BlogPost;
import com.project.Band_Up.entities.BlogStat;
import com.project.Band_Up.enums.StatsInterval;
import com.project.Band_Up.repositories.BlogRepository;
import com.project.Band_Up.repositories.BlogStatRepository;
import com.project.Band_Up.repositories.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BlogStatServiceImpl implements BlogStatService {

    @Autowired
    private BlogStatRepository blogStatRepository;
    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private CommentRepository commentRepository;

    @Override
    @Scheduled(cron = "0 59 23 * * *") // Run every day at 23:59
    public void saveDailyBlogStat() {
        int totalBlogs = (int) blogRepository.count();
        
        // Calculate total views
        List<BlogPost> allBlogs = blogRepository.findAll();
        long totalViews = allBlogs.stream()
                .mapToLong(BlogPost::getNumberOfReader)
                .sum();

        // Calculate average engagement (comments + reactions per blog)
        float avgEngagement = 0;
        if (totalBlogs > 0) {
            long totalComments = commentRepository.count();
            long totalReactions = allBlogs.stream()
                    .mapToLong(blog -> blog.getBlogReacts() != null ? blog.getBlogReacts().size() : 0)
                    .sum();
            avgEngagement = (float) (totalComments + totalReactions) / totalBlogs;
        }

        // Calculate average read time (assuming average reading speed of 200 words per minute)
        // This is an estimation based on content length
        float avgReadTime = 0;
        if (totalBlogs > 0) {
            double totalReadTime = allBlogs.stream()
                    .mapToDouble(blog -> {
                        if (blog.getContent() != null) {
                            int wordCount = blog.getContent().split("\\s+").length;
                            return wordCount / 200.0; // minutes
                        }
                        return 0;
                    })
                    .sum();
            avgReadTime = (float) (totalReadTime / totalBlogs);
        }

        BlogStat blogStat = BlogStat.builder()
                .totalBlogs(totalBlogs)
                .totalViews(totalViews)
                .avgEngagement(avgEngagement)
                .avgReadTime(avgReadTime)
                .recordedAt(LocalDateTime.now())
                .build();

        blogStatRepository.save(blogStat);
    }

    @Override
    public BlogStatsDto getStats(StatsInterval statsInterval) {
        int totalBlogs = (int) blogRepository.count();
        
        // Calculate total views
        List<BlogPost> allBlogs = blogRepository.findAll();
        long totalViews = allBlogs.stream()
                .mapToLong(BlogPost::getNumberOfReader)
                .sum();

        // Calculate average engagement
        float avgEngagement = 0;
        if (totalBlogs > 0) {
            long totalComments = commentRepository.count();
            long totalReactions = allBlogs.stream()
                    .mapToLong(blog -> blog.getBlogReacts() != null ? blog.getBlogReacts().size() : 0)
                    .sum();
            avgEngagement = (float) (totalComments + totalReactions) / totalBlogs;
        }

        // Calculate average read time
        float avgReadTime = 5;

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

        final int finalTotalBlogs = totalBlogs;
        final long finalTotalViews = totalViews;
        final float finalAvgEngagement = avgEngagement;
        final float finalAvgReadTime = avgReadTime;

        var previousStats = blogStatRepository.findTopByRecordedAtBeforeOrderByRecordedAtDesc(targetDate);

        int totalBlogsDifference = previousStats.map(stats -> finalTotalBlogs - stats.getTotalBlogs()).orElse(0);
        long totalViewsDifference = previousStats.map(stats -> finalTotalViews - stats.getTotalViews()).orElse(0L);
        float avgEngagementDifference = previousStats.map(stats -> finalAvgEngagement - stats.getAvgEngagement()).orElse(0f);
        float avgReadTimeDifference = previousStats.map(stats -> finalAvgReadTime - stats.getAvgReadTime()).orElse(0f);

        return BlogStatsDto.builder()
                .totalBlogs(totalBlogs)
                .totalBlogsDifference(totalBlogsDifference)
                .totalViews(totalViews)
                .totalViewsDifference(totalViewsDifference)
                .avgEngagement(avgEngagement)
                .avgEngagementDifference(avgEngagementDifference)
                .avgReadTime(avgReadTime)
                .avgReadTimeDifference(avgReadTimeDifference)
                .statsInterval(statsInterval)
                .build();
    }
}

