# MeetingFlow - REST API Reference

All requests must be prefixed with `/api`. Authenticated routes require an `Authorization` header formatted as: `Bearer <token>`.

---

## 1. Authentication Module

### Register User
* **Method**: `POST`
* **Path**: `/api/auth/register`
* **Payload**:
```json
{
  "username": "alice",
  "email": "alice@meetingflow.com",
  "password": "password123",
  "fullName": "Alice Cooper",
  "role": "MEMBER" // ADMIN, MANAGER, MEMBER
}
```
* **Success Response (200 OK)**:
```text
User registered successfully with ID: 3
```

### Log In
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Payload**:
```json
{
  "username": "alice",
  "password": "password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "id": 3,
  "username": "alice",
  "fullName": "Alice Cooper",
  "email": "alice@meetingflow.com",
  "roles": ["ROLE_MEMBER"]
}
```

---

## 2. Meetings Module

### Schedule Meeting
* **Method**: `POST`
* **Path**: `/api/meetings`
* **Payload**:
```json
{
  "title": "Weekly Sprint Alignment",
  "description": "Weekly alignment on front-end tasks",
  "date": "2026-07-20",
  "time": "11:00:00",
  "department": "Engineering",
  "agenda": "1. Review components\n2. Integrate APIs",
  "participantIds": [3, 4]
}
```
* **Success Response (200 OK)**: Returns the created Meeting details.

### List Meetings
* **Method**: `GET`
* **Path**: `/api/meetings`
* **Query Parameters**:
  - `department` (optional)
* **Success Response (200 OK)**: List of scheduled/completed meetings.

### Get Meeting Details
* **Method**: `GET`
* **Path**: `/api/meetings/{id}`
* **Success Response (200 OK)**: Includes details, participants, summary, and action items.

### Upload Transcript & Analyze
* **Method**: `POST`
* **Path**: `/api/meetings/{id}/transcript`
* **Payload**: Text string containing raw transcript logs.
* **Success Response (200 OK)**: Returns updated meeting with generated `summary` and `actionItems`.

---

## 3. Tasks Module

### Create Manual Task
* **Method**: `POST`
* **Path**: `/api/tasks`
* **Payload**:
```json
{
  "name": "Design button layout",
  "description": "Build high-contrast buttons for Dark Mode",
  "assigneeId": 3,
  "priority": "HIGH",
  "dueDate": "2026-07-18",
  "status": "PENDING"
}
```
* **Success Response (200 OK)**: Returns created Task.

### Update Task
* **Method**: `PUT`
* **Path**: `/api/tasks/{id}`
* **Payload**: Includes fields to update (status, assignee, name, priority).

### List Tasks
* **Method**: `GET`
* **Path**: `/api/tasks`
* **Query Parameters**:
  - `status` (optional)
  - `assigneeId` (optional)
  - `priority` (optional)

---

## 4. Dashboard Stats

### Fetch Stats
* **Method**: `GET`
* **Path**: `/api/dashboard/stats`
* **Success Response (200 OK)**:
```json
{
  "totalMeetings": 12,
  "pendingTasks": 4,
  "inProgressTasks": 2,
  "completedTasks": 8,
  "blockedTasks": 1,
  "taskCompletionRate": 53.33,
  "recentMeetings": [...],
  "upcomingMeetings": [...],
  "taskStatusBreakdown": {
    "PENDING": 4,
    "IN_PROGRESS": 2,
    "COMPLETED": 8,
    "BLOCKED": 1
  },
  "tasksAssignedPerUser": {
    "Alice Cooper": 3,
    "Bob Marley": 5
  }
}
```

---

## 5. Search Module

### Global Query
* **Method**: `GET`
* **Path**: `/api/search`
* **Query Parameters**:
  - `q` (required) - Search term.
* **Success Response (200 OK)**: Aggregated JSON matching meetings, tasks, action items, and decisions.
