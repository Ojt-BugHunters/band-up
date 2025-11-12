package com.project.Band_Up.services.task;

import com.project.Band_Up.dtos.task.TaskResponse;

import java.util.UUID;

public interface TaskService {
    TaskResponse createTask(TaskResponse request, UUID userId);


}
