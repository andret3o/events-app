<img width="1920" height="1080" alt="Progetto senza titolo-3" src="https://github.com/user-attachments/assets/c25659cd-dad6-4802-afac-bc497a81f8d8" />

# Events App

Monorepo application with:

- **Frontend:** Next.js
- **Backend:** Spring Boot
- **Database:** PostgreSQL

## Project Structure

```bash
.
├── frontend/          # Next.js application
├── backend/           # Spring Boot API
├── README.md
```

---

# Requirements

Make sure the following are installed on your machine:

- Node.js
- pnpm (npm should also work)
- Java 21+
- PostgreSQL

---

# Environment Setup

## Backend

Go to:

```bash
backend/src/main/resources/application-example.yaml
```

Copy the example configuration file and craete a file named application.yaml in the same directory:

```bash
backend/src/main/resources/application.yaml
```

Paste the example configuration file and update the database credentials and any required environment values inside.

---

## Frontend

Copy the frontend environment file:

```bash
cd frontend
cp .env.example .env
```

Update any required environment variables inside `.env`.

---

# PostgreSQL Setup

Create a PostgreSQL database using the terminal or pgAdmin.

Make sure the database credentials in your backend configuration match your local PostgreSQL setup.

---

# Starting the Backend

Open a terminal:

```bash
cd backend
```

Start the Spring Boot server:

```bash
./mvnw spring-boot:run
```

Backend will run on:

```bash
http://localhost:8080
```

---

# Starting the Frontend

Open another terminal:

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

Frontend will run on:

```bash
http://localhost:3000
```

---

# Production Build

## Frontend

```bash
cd frontend

pnpm build
pnpm start
```

## Backend

```bash
cd backend

./mvnw clean package
```

Generated JAR file:

```bash
backend/target/*.jar
```

Run the JAR:

```bash
java -jar target/app.jar
```

---

# Notes

- Make sure PostgreSQL is running before starting the backend.
- Ensure all environment variables are configured correctly.
- Recommended IDEs:
  - IntelliJ IDEA
  - VS Code

---

# Extra

- Click [here](./backend/src/main/java/com/example/demo/event/EVENTS.md) for the /events endpoint docs
