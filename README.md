# MeetingFlow 🚀

MeetingFlow is a premium, AI-powered meeting minutes automation and task management platform. It allows teams to host video calls, transcribe dialogues in real-time, extract action items using natural language processing (NLP), and track progress seamlessly on a dynamic Kanban board.

---

## Key Features 🌟

*   **Integrated Video Calls**: Seamless Jitsi Meet video conferencing embedded directly within the application layout.
*   **Real-Time Speech-to-Text**: Native Web Speech API integration transcribing live dialogue during calls with speaker tag markers.
*   **AI-Driven Task Extraction**: Post-call NLP parser analyzing transcripts to generate executive summaries, key decisions, risks, and assignable action items.
*   **Dynamic Kanban Board & Task Tracker**: Clean, drag-and-drop workflow tracking to transition tasks from *To Do* to *Completed*.
*   **Team Performance Analytics**: Rich, beautiful dashboard charts summarizing departmental workload and task status ratios.
*   **Responsive & Responsive Layout**: Responsive sidebar navigation panel optimized for both desktop viewports and mobile screens.
*   **Dockerized Deployment**: Microservices architecture fully containerized using Nginx reverse proxying to avoid CORS blocks.

---

## Technology Stack 🛠️

### Frontend (Client)
*   **Core**: React.js (Vite)
*   **Styling**: Tailwind CSS (sleek dark overlays and responsive grid layouts)
*   **Conferencing**: Jitsi Meet Iframe API
*   **Voice Engine**: Web Speech API (`SpeechRecognition`)
*   **Charts**: Chart.js / react-chartjs-2
*   **Routing**: React Router DOM (protected user routes)

### Backend (API)
*   **Core**: Java 21, Spring Boot 3.3
*   **Security**: Spring Security 6 (Stateless JWT token verification)
*   **Database Access**: Spring Data JPA (Hibernate ORM)
*   **Build Tool**: Maven

### Infrastructure & Database
*   **Database**: MySQL 8.0.36
*   **Reverse Proxy**: Nginx (serves static assets and forwards API paths)
*   **Orchestration**: Docker Compose

---

## Directory Structure 📁

```text
MeetingFlow/
├── backend/                   # Spring Boot application
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                  # React (Vite) client
│   ├── src/
│   ├── index.html
│   ├── nginx.conf             # Production proxy configurations
│   └── Dockerfile
├── database/                  # Auto-seeding SQL configurations
│   ├── schema.sql
│   └── seed.sql
├── docs/                      # Technical guides & deployment walkthroughs
└── docker-compose.yml         # Global multi-container docker compose setup
```

---

## Getting Started (Docker Compose) 🐳

The easiest way to run the entire full stack application (Database + Backend + Frontend) is via Docker Compose.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
*   Make sure port `80` and `3307` are free on your host system.

### Build and Launch

1.  Open your terminal in the project root directory.
2.  Launch the containerized microservices:
    ```bash
    docker-compose up --build -d
    ```
3.  Verify all three services are running:
    ```bash
    docker ps
    ```
    *You should see containers `meetingflow_db` (Healthy), `meetingflow_backend` (Started), and `meetingflow_frontend` (Started).*

4.  Open your browser and navigate to:
    ```text
    http://localhost
    ```

---

## Local Development Setup 💻

If you prefer to run the applications natively without Docker:

### 1. Database Setup
1.  Ensure you have a local **MySQL Server** running.
2.  Create a schema named `meetingflow`.
3.  Import the SQL files inside the `database/` directory:
    *   First, run `database/schema.sql` to build the tables.
    *   Second, run `database/seed.sql` to populate roles, users, and mock data.

### 2. Run the Backend API
1.  Open the `backend/` folder in your IDE (IntelliJ, Eclipse, VS Code).
2.  Configure database credentials inside [application.properties](file:///D:/Projects/MeetingFlow/backend/src/main/resources/application.properties):
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/meetingflow?useSSL=false
    spring.datasource.username=YOUR_USER
    spring.datasource.password=YOUR_PASSWORD
    ```
3.  Run the application using Maven or your IDE runner. The API starts on port `8080`.

### 3. Run the Frontend Client
1.  Navigate to the `frontend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
4.  Open the client URL in your browser:
    ```text
    http://localhost:5173
    ```

---

## Test Login Credentials 🔑

Log in using one of the pre-seeded team profiles to test different privileges:

| Name | Role | Username | Password |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | Project Manager / Organizer | `manager` | `password123` |
| **Alice Cooper** | Engineering Developer | `alice` | `password123` |
| **System Administrator** | System Admin | `admin` | `password123` |

---

## Mobile Testing Guide 📱

Mobile browsers block microphone access on insecure connections (`http://192.168.X.X`). To test the voice transcription room on your mobile phone:

### Recommended: Using an HTTPS Tunnel (`ngrok`)
1.  With the Docker containers running, execute this in your terminal:
    ```bash
    npx ngrok http 80
    ```
2.  Copy the secure public URL (`https://xxxx.ngrok-free.app`) generated by ngrok.
3.  Open that URL on your phone's browser (Safari/Chrome). Microphone and camera will be fully active!

---

## License 📄
This project is proprietary and confidential. All rights reserved.