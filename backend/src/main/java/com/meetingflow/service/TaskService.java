package com.meetingflow.service;

import com.meetingflow.dto.TaskRequest;
import com.meetingflow.dto.TaskResponse;
import com.meetingflow.dto.UserDto;
import com.meetingflow.entity.ActionItem;
import com.meetingflow.entity.Task;
import com.meetingflow.entity.User;
import com.meetingflow.repository.ActionItemRepository;
import com.meetingflow.repository.TaskRepository;
import com.meetingflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActionItemRepository actionItemRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository,
                       ActionItemRepository actionItemRepository, UserService userService,
                       NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.actionItemRepository = actionItemRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User creator = userService.getCurrentUserEntity();
        Task task = new Task();
        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        task.setCreatedBy(creator);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found."));
            task.setAssignee(assignee);
            
            // Notify Assignee
            notificationService.createNotification(
                    assignee,
                    "New Task Assigned",
                    "You have been assigned the task: \"" + task.getName() + "\" by " + creator.getFullName() + ".",
                    "TASK_ASSIGNED"
            );
        }

        if (request.getActionItemId() != null) {
            ActionItem item = actionItemRepository.findById(request.getActionItemId())
                    .orElseThrow(() -> new RuntimeException("Action item not found."));
            item.setStatus("CONVERTED");
            actionItemRepository.save(item);
            task.setActionItem(item);
        }

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found."));

        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        
        String oldStatus = task.getStatus();
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        if (request.getAssigneeId() != null) {
            User oldAssignee = task.getAssignee();
            if (oldAssignee == null || !oldAssignee.getId().equals(request.getAssigneeId())) {
                User newAssignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new RuntimeException("Assignee not found."));
                task.setAssignee(newAssignee);
                
                // Notify new assignee
                notificationService.createNotification(
                        newAssignee,
                        "Task Assigned to You",
                        "You are now assigned to: \"" + task.getName() + "\".",
                        "TASK_ASSIGNED"
                );
            }
        } else {
            task.setAssignee(null);
        }

        // Create notification if completed
        if (task.getStatus().equalsIgnoreCase("COMPLETED") && !oldStatus.equalsIgnoreCase("COMPLETED") && task.getCreatedBy() != null) {
            notificationService.createNotification(
                    task.getCreatedBy(),
                    "Task Completed",
                    "The task \"" + task.getName() + "\" has been completed by " + 
                    (task.getAssignee() != null ? task.getAssignee().getFullName() : "an assignee") + ".",
                    "TASK_UPDATE"
            );
        }

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(String status, Long assigneeId, String priority) {
        List<Task> tasks = taskRepository.findAll();
        
        return tasks.stream()
                .filter(t -> status == null || t.getStatus().equalsIgnoreCase(status))
                .filter(t -> assigneeId == null || (t.getAssignee() != null && t.getAssignee().getId().equals(assigneeId)))
                .filter(t -> priority == null || t.getPriority().equalsIgnoreCase(priority))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found."));
        return mapToResponse(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found.");
        }
        taskRepository.deleteById(id);
    }

    public TaskResponse mapToResponse(Task t) {
        TaskResponse response = new TaskResponse();
        response.setId(t.getId());
        response.setName(t.getName());
        response.setDescription(t.getDescription());
        response.setPriority(t.getPriority());
        response.setDueDate(t.getDueDate());
        response.setStatus(t.getStatus());
        response.setCreatedAt(t.getCreatedAt());

        if (t.getAssignee() != null) {
            response.setAssignee(new UserDto(
                    t.getAssignee().getId(),
                    t.getAssignee().getUsername(),
                    t.getAssignee().getFullName(),
                    t.getAssignee().getEmail()
            ));
        }

        if (t.getCreatedBy() != null) {
            response.setCreatedBy(new UserDto(
                    t.getCreatedBy().getId(),
                    t.getCreatedBy().getUsername(),
                    t.getCreatedBy().getFullName(),
                    t.getCreatedBy().getEmail()
            ));
        }

        if (t.getActionItem() != null) {
            response.setActionItemId(t.getActionItem().getId());
        }

        return response;
    }
}
