# MeetingFlow - System Architecture

MeetingFlow is built using a clean, modern three-tier web architecture designed for scalability, security, and responsive performance.

## Architectural Diagram

```mermaid
graph TD
    subgraph Frontend [React Client Layer]
        UI[Responsive Tailwind UI Pages]
        AuthCtx[AuthContext / useAuth]
        AxiosLayer[Axios API Client]
        Charts[ChartJS components]
    end

    subgraph Security [Spring Security Gateway]
        Filter[JWT Authentication Filter]
        Provider[JWT Token Provider]
        UserDet[Custom UserDetails Service]
    end

    subgraph ServiceLayer [Spring Boot Core Backend]
        AuthSvc[Auth Service]
        MeetSvc[Meeting Service]
        TaskSvc[Task Service]
        SearchSvc[Search Service]
        NotifSvc[Notification Service]
        AISvc[Meeting Analysis Service]
    end

    subgraph Database [MySQL Storage Layer]
        Schema[(MySQL Schema)]
    end

    UI --> AuthCtx
    AuthCtx --> AxiosLayer
    AxiosLayer -->|REST HTTPS Requests with JWT Bearer| Filter
    Filter -->|Validates Token| Provider
    Filter -->|Load Profile| UserDet
    UserDet -->|SQL Query| Schema
    
    Filter -->|Delegates to| ServiceLayer
    
    MeetSvc -->|Analyze Transcript| AISvc
    AISvc -->|Identify Tasks| TaskSvc
    TaskSvc -->|Trigger Alerts| NotifSvc
    
    ServiceLayer -->|JPA Repositories| Schema
```

## Module Boundaries

1. **Client Tier**:
   - Built on **React (Vite)** utilizing **Tailwind CSS** for responsive styling.
   - Global auth states are shared via `AuthContext` with automatic Bearer token attachments via Axios interceptors.
   - Dashboard statistics render dynamically via **Chart.js**.

2. **Security Gateway**:
   - Integrates stateless **Spring Security** utilizing **JWT tokens**.
   - Filters check incoming request headers for `Authorization: Bearer <JWT>` and loads context.

3. **Core Services Layer**:
   - Follows SOLID design principles.
   - **Meeting Service** coordinates uploads and feeds transcripts to the NLP analyzer.
   - **Meeting Analysis Service** parses the transcript lines looking for keywords ("should", "assigned to", "decided") to automatically spin up summary segments and action-to-task translations.

4. **Persistence Tier**:
   - Uses a fully normalized **MySQL** schema.
   - Handled via **Spring Data JPA** with Hibernate mapping.
