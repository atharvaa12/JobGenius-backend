
# 🚀 JobGenius – Express Backend

> **AI-Powered Resume–Job Matching Platform**
> Intelligent backend service that parses resumes, stores embeddings, and performs semantic similarity matching between candidates and job listings using modern vector search.



## 📌 Overview

**JobGenius** is a smart recruitment engine that uses **vector embeddings** to match resumes with job descriptions based on *meaning*, not keywords.

This repository contains the **main Express.js backend** responsible for:

* Authentication & user management
* Resume ingestion & parsing
* Job posting management
* Communication with embedding microservice
* Vector similarity search via PostgreSQL + pgvector
* API layer for frontend dashboards

A separate **Python microservice** handles embedding generation using **Voyage AI**.

---

## 🧠 Architecture

```
Frontend
   │
   ▼
Express API (This Repo)
   │
   ├── PostgreSQL + pgvector (Supabase)
   │       └── Stores embeddings, jobs, resumes
   │
   └── Python Embedding Service
            └── Voyage AI → Vector embeddings
```

---

## 🛠 Tech Stack

| Layer             | Tech                  |
| ----------------- | --------------------- |
| Server            | Node.js, Express      |
| Database          | PostgreSQL (Supabase) |
| Vector Search     | pgvector              |
| Auth              | JWT                   |
| Embeddings        | Voyage AI             |
| Embedding Service | Python Microservice   |

---

## 📁 Project Structure

```
controllers/
   authControllers.js
   jobControllers.js
   profileControllers.js

middlewares/
   authenticateToken.js

routes/
   authRoutes.js
   jobRoutes.js
   profileRoutes.js

utils/
   db.js
   ping.js
   storage.js

server.js
```

---



## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/your-org/job-genius-backend.git
cd job-genius-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env`

```
PORT=8080
JWT_SECRET=your_secret
DATABASE_URL=postgres://user:pass@supabase-host/db
EMBEDDING_SERVICE_URL=http://localhost:5000/embed
```

### 4. Run

```bash
node server.js
```
---

## 👥 Team

- [Atharva Aher](https://github.com/atharvaa12)
- [Ishan Upadhyay](https://github.com/ishanupadhyay9)
- [Anando Sharma](https://github.com/FlyBlaze009)


---

