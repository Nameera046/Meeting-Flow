# MeetingFlow - Deployment & Execution Guide

Follow these steps to configure, build, and host both the Spring Boot backend and React frontend locally.

---

## Prerequisites

Ensure you have the following installed:
1. **Java Runtime/Development Kit** (JDK 17 or higher. Local system detects JDK 24).
2. **Node.js** (v18 or higher) and **npm** (detected v11.4.2).
3. **MySQL Server** (detected v8.0).

---

## 1. Database Setup

1. Start your local MySQL instance.
2. Log in via your MySQL Command Line or tool (e.g. Workbench):
   ```sql
   mysql -u root -p
   ```
3. Run the schema creation and data seeding scripts. Open `database/schema.sql` and `database/seed.sql` to execute them, or run via command line:
   ```bash
   mysql -u root -p < D:\Projects\MeetingFlow\database\schema.sql
   mysql -u root -p < D:\Projects\MeetingFlow\database\seed.sql
   ```
   *Note: If your MySQL password is not `root`, update the connection credentials in the backend configurations (detailed in Step 2).*

---

## 2. Backend Spring Boot Setup

1. Navigate to the backend directory:
   ```bash
   cd D:\Projects\MeetingFlow\backend
   ```
2. Open `src/main/resources/application.properties` and verify your MySQL connection details:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/meetingflow?...
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Compile and launch the Spring Boot application using Maven:
   - On Windows PowerShell:
     ```powershell
     mvn spring-boot:run
     ```
     *(Or if you use the Maven wrapper: `./mvnw spring-boot:run`)*
4. Verify the backend is active by checking the logs. It will host REST services on port `8080` (e.g., `http://localhost:8080`).

---

## 3. Frontend React Setup

1. Navigate to the frontend directory:
   ```bash
   cd D:\Projects\MeetingFlow\frontend
   ```
2. Install dependencies (if not done already):
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web client in your browser: `http://localhost:5173`.

---

## 4. Test Logins

To log in and browse the dashboards instantly, use the pre-seeded credentials:
* **Sarah Jenkins (Manager)**:
  - Username: `manager`
  - Password: `password123`
* **Alice Cooper (Team Member)**:
  - Username: `alice`
  - Password: `password123`
* **System Administrator**:
  - Username: `admin`
  - Password: `password123`
