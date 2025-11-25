package com.project.Band_Up.services.task;

import com.project.Band_Up.dtos.task.TaskCreateRequest;
import com.project.Band_Up.dtos.task.TaskResponse;
import com.project.Band_Up.dtos.task.TaskUpdateRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Task;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final AccountRepository accountRepository;
    private final ModelMapper modelMapper;

    @Override
    public TaskResponse createTask(TaskCreateRequest request, UUID userId) {
        Task task = toEntity(request, getAccount(userId));
        task.setCompleted(false);
        Task savedTask = taskRepository.save(task);
        return toResponse(savedTask);
    }

    @Override
    public List<TaskResponse> getAllTasksByUser(UUID userId) {
        return taskRepository.findByAccount_Id(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getIncompleteTasks(UUID userId) {
        return taskRepository.findByAccount_IdAndCompletedFalse(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getCompletedTasks(UUID userId) {
        return taskRepository.findByAccount_IdAndCompletedTrue(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponse updateTask(UUID taskId, TaskUpdateRequest request, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getAccount().getId().equals(userId))
            throw new IllegalArgumentException("Unauthorized action");

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getCompleted() != null) task.setCompleted(request.getCompleted());

        Task updated = taskRepository.save(task);
        return toResponse(updated);
    }

    @Override
    public TaskResponse toggleTaskCompletion(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getAccount().getId().equals(userId))
            throw new IllegalArgumentException("Unauthorized action");

        task.setCompleted(!task.getCompleted());
        Task updated = taskRepository.save(task);
        return toResponse(updated);
    }

    @Override
    public void deleteTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getAccount().getId().equals(userId))
            throw new IllegalArgumentException("Unauthorized action");

        taskRepository.delete(task);
    }
    @Override
    public List<TaskResponse> getTodayTasks(UUID userId) {
        LocalDate today = LocalDate.now();
        return taskRepository.findByAccount_IdAndCreateAtBetween(
                        userId,
                        today.atStartOfDay(),
                        today.plusDays(1).atStartOfDay())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByDate(UUID userId, LocalDate date) {
        return taskRepository.findByAccount_IdAndCreateAtBetween(
                        userId,
                        date.atStartOfDay(),
                        date.plusDays(1).atStartOfDay())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    private Account getAccount(UUID userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        return accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
    }

    private Task toEntity(TaskCreateRequest request, Account account) {
        Task task = modelMapper.map(request, Task.class);
        task.setAccount(account);
        return task;
    }

    private TaskResponse toResponse(Task task) {
        return modelMapper.map(task, TaskResponse.class);
    }
}
