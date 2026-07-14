-- Seed Data for MeetingFlow
USE meetingflow;

-- Insert Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MANAGER') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (3, 'ROLE_MEMBER') ON DUPLICATE KEY UPDATE name=name;

-- Insert Users (Password is 'password123' bcrypt encrypted)
-- Hash: $2a$10$7v27/2H0M0pYmE.D3J8V2eD7k3uV8G9Z9K3l.WcZ2D2pXfX.9wWqG
INSERT INTO users (id, username, email, password, full_name) VALUES
(1, 'admin', 'admin@meetingflow.com', '$2a$10$7v27/2H0M0pYmE.D3J8V2eD7k3uV8G9Z9K3l.WcZ2D2pXfX.9wWqG', 'System Administrator'),
(2, 'manager', 'manager@meetingflow.com', '$2a$10$7v27/2H0M0pYmE.D3J8V2eD7k3uV8G9Z9K3l.WcZ2D2pXfX.9wWqG', 'Sarah Jenkins'),
(3, 'alice', 'alice@meetingflow.com', '$2a$10$7v27/2H0M0pYmE.D3J8V2eD7k3uV8G9Z9K3l.WcZ2D2pXfX.9wWqG', 'Alice Cooper'),
(4, 'bob', 'bob@meetingflow.com', '$2a$10$7v27/2H0M0pYmE.D3J8V2eD7k3uV8G9Z9K3l.WcZ2D2pXfX.9wWqG', 'Bob Marley'),
(5, 'charlie', 'charlie@meetingflow.com', '$2a$10$7v27/2H0M0pYmE.D3J8V2eD7k3uV8G9Z9K3l.WcZ2D2pXfX.9wWqG', 'Charlie Puth')
ON DUPLICATE KEY UPDATE username=username;

-- Insert User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3),
(5, 3)
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Insert Sample Meetings (One completed, one scheduled)
INSERT INTO meetings (id, title, description, date, time, department, agenda, status, transcript, created_by) VALUES
(1, 'Project Kickoff & Q3 Goals Alignment', 'Kickoff meeting to discuss project architecture, deliverables, and assign initial tasks.', '2026-07-10', '10:00:00', 'Engineering', '1. Introductions\n2. Architecture Overview\n3. Front-end and Back-end stack selection\n4. Database Design review\n5. Timeline & Milestones', 'COMPLETED', 'Sarah Jenkins: Welcome everyone to the MeetingFlow Project Kickoff. Let\'s outline our technical strategy.\nAlice Cooper: For the frontend, I highly recommend React with Vite and Tailwind CSS. It is super fast and clean.\nBob Marley: Sounds good. On the backend, we should use Java Spring Boot. We need Spring Security with JWT for secure logins. We will use MySQL for the database.\nSarah Jenkins: Excellent suggestions. Let\'s finalize this stack: React, Spring Boot, MySQL. Alice, please initialize the Vite project. Bob, set up the Spring Boot structure and database schemas. We need this done by next Friday.\nBob Marley: Sure, I\'ll create the SQL scripts and Spring skeleton by Tuesday.\nAlice Cooper: I\'ll have the frontend layout and auth pages ready by Wednesday.\nSarah Jenkins: Let\'s also schedule the daily standups at 9:30 AM starting tomorrow. Any concerns?\nCharlie Puth: No concerns from my end, I\'ll help Bob with the Spring controllers once the repositories are ready.\nSarah Jenkins: Great, thanks Charlie. That\'s all for today. Let\'s get to work!', 2),
(2, 'Weekly Product Roadmap Review', 'Sync up on the feature development progress and address roadblocks.', '2026-07-17', '14:30:00', 'Product Management', '1. Progress review\n2. Blockers discussion\n3. Next sprint planning', 'SCHEDULED', NULL, 2)
ON DUPLICATE KEY UPDATE title=title;

-- Insert Meeting Participants
INSERT INTO meeting_participants (meeting_id, user_id) VALUES
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 2),
(2, 3),
(2, 4)
ON DUPLICATE KEY UPDATE meeting_id=meeting_id;

-- Insert Meeting Summary (for Meeting 1)
INSERT INTO meeting_summaries (id, meeting_id, executive_summary, key_discussion_points, decisions_made, risks_concerns) VALUES
(1, 1, 'The MeetingFlow kickoff meeting finalized the core technology stack and initial responsibilities. The team selected React, Spring Boot, and MySQL. Deadlines were established for the project skeletons, and daily standups were scheduled.', 
'- Technical Stack Selection: Frontend to use React with Vite and Tailwind; Backend to use Java Spring Boot; Database to use MySQL.\n- Roles and Responsibilities: Alice is handling the frontend initialization, Bob is setting up the backend/database skeleton, and Charlie will support backend controller development.\n- Communication Sync: Daily standups are scheduled for 9:30 AM starting tomorrow.',
'- Core tech stack finalized: React, Spring Boot, MySQL.\n- Daily standup time set to 9:30 AM.',
'- Short timeline for initializing both codebases (Friday deadline).')
ON DUPLICATE KEY UPDATE meeting_id=meeting_id;

-- Insert Action Items (from Meeting 1)
INSERT INTO action_items (id, meeting_id, description, assigned_to, due_date, status) VALUES
(1, 1, 'Initialize the React Vite frontend project with Tailwind CSS config', 3, '2026-07-15', 'CONVERTED'),
(2, 1, 'Create MySQL schema scripts and Spring Boot project skeleton', 4, '2026-07-14', 'CONVERTED'),
(3, 1, 'Develop REST Controllers for Meeting and Auth modules', 5, '2026-07-17', 'PENDING')
ON DUPLICATE KEY UPDATE description=description;

-- Insert Tasks (Linked to Action Items or manually created)
INSERT INTO tasks (id, action_item_id, name, description, assignee_id, priority, due_date, status, created_by_id) VALUES
(1, 1, 'Initialize React Vite frontend project', 'Set up React with Vite, configure Tailwind CSS design tokens, and build the initial routes and pages.', 3, 'HIGH', '2026-07-15', 'IN_PROGRESS', 2),
(2, 2, 'Create MySQL schemas & Spring Boot skeleton', 'Draft SQL scripts for tables and relationships, set up pom.xml, and build the directory hierarchy for Spring Boot.', 4, 'HIGH', '2026-07-14', 'COMPLETED', 2),
(3, NULL, 'Set up daily standup calendar invite', 'Schedule recurring calendar invites for daily status updates at 9:30 AM.', 2, 'LOW', '2026-07-16', 'PENDING', 2)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 3, 'New Task Assigned', 'You have been assigned the task: "Initialize React Vite frontend project". Due Date: 2026-07-15.', 'TASK_ASSIGNED', FALSE),
(2, 4, 'New Task Assigned', 'You have been assigned the task: "Create MySQL schemas & Spring Boot skeleton". Due Date: 2026-07-14.', 'TASK_ASSIGNED', TRUE),
(3, 3, 'New Meeting Scheduled', 'You have been added to: "Weekly Product Roadmap Review" scheduled for 2026-07-17 at 14:30:00.', 'MEETING_CREATED', FALSE)
ON DUPLICATE KEY UPDATE title=title;
