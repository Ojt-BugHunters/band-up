package com.project.Band_Up.services.task;

import com.project.Band_Up.dtos.task.TaskResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Task;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService{
    private final TaskRepository taskRepository;
    private final AccountRepository accountRepository;
    private final ModelMapper modelMapper;

    @Override
    public TaskResponse createTask(TaskResponse request, UUID userId){
        Task task = toEntity(request, getAccount(userId));
        task.setCompleted(false);
        Task savedTask = taskRepository.save(task);
        return toResponse(savedTask);
    }
    private Account getAccount(UUID userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        return accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
    }
    private Task toEntity(TaskResponse request, Account account) {
        Task task = modelMapper.map(request, Task.class);
        task.setAccount(account);
        return task;
    }
    private TaskResponse toResponse(Task task) {
        TaskResponse taskResponse = modelMapper.map(task, TaskResponse.class);
        taskResponse.setUserId(task.getAccount().getId());
        return taskResponse;
    }
}
