<img width="1920" height="1080" alt="Progetto senza titolo-3" src="https://github.com/user-attachments/assets/c25659cd-dad6-4802-afac-bc497a81f8d8" />

# Events App

A full-stack event discovery platform where anyone can post events happening right now so other people nearby can join.

The application is currently focused on **Tallinn**, allowing users to discover local activities, spontaneous meetups, and community events in real time.

> 🚧 This project is currently in the early stages of development.

## Features

- 📍 Interactive map with event locations
- 🎉 Browse all active events
- 👤 User profile page
- 📝 Create and publish events
- 🖼️ Optional image uploads with Cloudinary
- 🔐 Full-stack architecture with authentication support

---

# Table of Contents

- [Tech Stack](#tech-stack)

- [Project Structure](#project-structure)

- [Running with Docker](#-running-with-docker)
  - [Prerequisites](#prerequisites)
  - [Setup Instructions](#setup-instructions)
  - [Verify the Deployment](#3-verify-the-deployment)
  - [Useful Commands](#useful-commands)
  - [Accessing the Application](#accessing-the-application)

- [Running Without Docker](#-running-without-docker)
  - [Backend Environment Configuration](#1-backend-environment-configuration)
  - [Frontend Environment Configuration](#2-frontend-environment-configuration)
  - [PostgreSQL Setup](#postgresql-setup)
  - [Starting the Backend](#starting-the-backend)
  - [Starting the Frontend](#starting-the-frontend)
  - [Production Build](#production-build)

- [Notes](#notes)

- [Additional Documentation](#additional-documentation)

---

# Tech Stack

### Frontend

- Next.js
- TypeScript
- pnpm

### Backend

- Spring Boot
- Java 21

### Database

- PostgreSQL

### Infrastructure

- Docker
- Docker Compose

---

# Project Structure

```bash
.
├── frontend/          # Next.js application
├── backend/           # Spring Boot API
├── README.md
```

---

# 🐳 Running with Docker

Follow these steps to get the project up and running locally using Docker and Docker Compose.

---

## Prerequisites

Make sure you have the following installed on your machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Setup Instructions

### 1. Environment Configuration

The application relies on environment variables to run. Clone the example configuration file and update it with your local settings.

```bash
cp .env.example .env
```

> 💡 **Note:** Image uploads require a Cloudinary account and the corresponding environment variables to be configured in your `.env` file. This setup is optional, but image upload functionality will not work without it.

---

### 2. Build and Start the Containers

Run the following command to build the Docker images and start the services in the background:

```bash
docker compose up -d --build
```

---

### 3. Verify the Deployment

Check that all containers are up and running smoothly:

```bash
docker compose ps
```

---

## Useful Commands

| Action                | Command                  |
| --------------------- | ------------------------ |
| View Logs             | `docker compose logs -f` |
| Stop Services         | `docker compose down`    |
| Stop & Remove Volumes | `docker compose down -v` |
| Restart Services      | `docker compose restart` |

---

## Accessing the Application

Once the containers are live, you can access the application at:

```text
http://localhost:3000
```

# 💻 Running Without Docker

Follow these steps to run the project locally without Docker.

---

## Prerequisites

Make sure you have the following installed on your machine:

- Node.js
- pnpm (npm should also work)
- Java 21+
- PostgreSQL

---

## Setup Instructions

### 1. Backend Environment Configuration

Go to the backend resources directory:

```bash
cd backend/src/main/resources
```

Copy the example configuration file:

```bash
cp application-example.yaml application.yaml
```

Open the newly created `application.yaml` file and update:

- PostgreSQL database credentials
- API keys
- Any required environment-specific configuration

---

### 2. Frontend Environment Configuration

Navigate to the frontend directory:

```bash
cd frontend
```

Copy the frontend environment file:

```bash
cp .env.example .env
```

Update any required environment variables inside `.env`.

---

## PostgreSQL Setup

Create a PostgreSQL database using:

- PostgreSQL CLI
- pgAdmin
- Any PostgreSQL management tool

Make sure the database credentials configured in:

```text
backend/src/main/resources/application.yaml
```

match your local PostgreSQL setup.

---

## Starting the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Start the Spring Boot server:

```bash
./mvnw spring-boot:run
```

The backend API will be available at:

```text
http://localhost:8080
```

---

## Starting the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The frontend application will be available at:

```text
http://localhost:3000
```

---

## Production Build

### Frontend

Build the Next.js application:

```bash
cd frontend

pnpm build
pnpm start
```

---

### Backend

Build the Spring Boot application:

```bash
cd backend

./mvnw clean package
```

The generated JAR file will be located in:

```text
backend/target/*.jar
```

Run the packaged application:

```bash
java -jar target/app.jar
```

---

## Notes

- Make sure PostgreSQL is running before starting the backend.
- Ensure all environment variables are configured correctly.
- Recommended IDEs:
  - IntelliJ IDEA
  - VS Code

---

## Additional Documentation

- Click [here](./backend/src/main/java/com/example/demo/event/EVENTS.md) for the `/events` endpoint documentation.
