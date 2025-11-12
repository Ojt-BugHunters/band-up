package com.project.Band_Up.services.task;

import com.project.Band_Up.dtos.task.TaskResponse;
import com.project.Band_Up.dtos.task.TaskUpdateRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskResponse createTask(TaskResponse request, UUID userId);

    List<TaskResponse> getAllTasksByUser(UUID userId);

    List<TaskResponse> getIncompleteTasks(UUID userId);

    List<TaskResponse> getCompletedTasks(UUID userId);

    TaskResponse updateTask(UUID taskId, TaskUpdateRequest request, UUID userId);

    TaskResponse toggleTaskCompletion(UUID taskId, UUID userId);

    List<TaskResponse> getTodayTasks(UUID userId);


    List<TaskResponse> getTasksByDate(UUID userId, LocalDate date);
    void deleteTask(UUID taskId, UUID userId);
}
