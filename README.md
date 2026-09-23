<div align="center">

# CodeArena

**A production-grade competitive programming platform built on the MERN stack.**

Real-time code execution · Multi-language support · Role-based access control · Editorial videos

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Judge0](https://img.shields.io/badge/Judge0-CE-FF6B35?style=flat-square)](https://judge0.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)


### [View Live Demo](https://code-arena-rho-smoky.vercel.app/)

[Overview](#overview) &nbsp;·&nbsp;
[Features](#features) &nbsp;·&nbsp;
[Architecture](#architecture) &nbsp;·&nbsp;
[Quick Start](#quick-start) &nbsp;·&nbsp;
[API Reference](#api-reference) &nbsp;·&nbsp;
[Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Supported Languages](#supported-languages)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**CodeArena** is a self-hostable, full-featured competitive programming judge designed for developers and educators. It enables users to solve algorithmic problems in a rich in-browser code editor, with submissions evaluated against hidden test cases via the **Judge0** sandboxed execution engine.

Administrators have full control over the problem lifecycle — creating, updating, and deleting problems, as well as uploading editorial solution videos — all managed through a dedicated admin console.

> Built as a modern alternative to platforms like LeetCode, with an emphasis on clean architecture, developer experience, and extensibility.

---

## Features

### User Features

| Feature | Description |
|---|---|
| **Authentication** | JWT-based signup and login with persistent sessions |
| **Problem Browser** | Filter problems by difficulty (Easy / Medium / Hard) and tags |
| **Monaco Editor** | VS Code-powered editor with per-language syntax highlighting |
| **Run Code** | Test code instantly against visible test cases with full stdout/stderr output |
| **Submit Code** | Full evaluation against hidden judge test cases with pass/fail verdict |
| **Submission History** | Per-problem history of all past attempts with status and language |
| **Editorial Videos** | Cloudinary-hosted video walkthroughs for each problem |
| **Profile Dashboard** | Track total problems solved and submission statistics |

### Administrator Features

| Feature | Description |
|---|---|
| **Admin Registration** | Provision new admin accounts with role-based access control |
| **Create Problem** | Author problems with visible/hidden test cases, starter code, and reference solutions |
| **Update Problem** | In-place editing of all problem fields with a two-stage UI (problem picker → edit form) |
| **Delete Problem** | Remove challenges from the public problem set |
| **Upload Editorial** | Attach Cloudinary video solutions to any problem |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tooling |
| Redux Toolkit | Global state management (auth, problems) |
| React Router v6 | Client-side routing with protected and admin-only routes |
| Tailwind CSS | Utility-first styling system |
| Framer Motion | Page transitions and micro-interactions |
| Monaco Editor | In-browser code editor (same engine as VS Code) |
| React Hook Form + Zod | Type-safe, schema-driven form validation |
| Axios | HTTP client with centralized interceptors |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Document database and object-document mapper |
| JSON Web Tokens | Stateless authentication and authorization |
| Judge0 CE (RapidAPI) | Isolated sandboxed code execution engine |
| Cloudinary | Video and media asset storage and delivery |
| Multer | Multipart file upload handling |

---

## Project Structure

```
CodeArena/
│
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── userAuthent.js         # Authentication logic
│       │   ├── userProblems.js        # Problem CRUD and admin operations
│       │   ├── userSubmission.js      # Code execution via Judge0
│       │   └── videoUploader.js       # Cloudinary video management
│       ├── middleware/
│       │   ├── adminMiddleware.js     # JWT verification + admin role guard
│       │   └── userMiddleware.js      # JWT verification + user role guard
│       ├── Models/
│       │   ├── problem.js             # Problem schema
│       │   ├── submissions.js         # Submission schema
│       │   └── user.js                # User schema
│       ├── Routes/
│       │   ├── problemCreator.js      # Problem route definitions
│       │   ├── userRouter.js          # Auth route definitions
│       │   ├── submissionRouter.js    # Submission route definitions
│       │   └── videoRouter.js         # Video route definitions
│       ├── utils/
│       │   ├── problemUtility.js      # Judge0 batch submission helpers
│       │   └── validate.js            # Request validation helpers
│       └── index.js                   # Express application entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── Problems.jsx
        │   ├── ProblemDetail.jsx
        │   ├── Profile.jsx
        │   ├── Login.jsx
        │   ├── SignUp.jsx
        │   ├── AdminPanel.jsx
        │   ├── CreateProblem.jsx
        │   ├── UpdateProblem.jsx
        │   ├── DeleteProblem.jsx
        │   └── AdminRegister.jsx
        ├── components/
        │   ├── ProblemTable.jsx
        │   ├── ProblemCard.jsx
        │   ├── Result.jsx
        │   ├── Editorial.jsx
        │   ├── VideoCreator.jsx
        │   └── Confirmation.jsx
        ├── common/
        │   └── navbar.jsx
        ├── utils/
        │   └── axios.js               # Axios instance with base URL configuration
        ├── Slice.js                   # Redux slices (auth + problems)
        └── App.jsx                    # Route definitions and auth guards
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Client (Browser)                      │
│                                                           │
│   React + Redux  ──►  Axios  ──►  /api  (Express)         │
└───────────────────────────────┬──────────────────────────┘
                                │
              ┌─────────────────▼──────────────────┐
              │         Express REST API             │
              │                                      │
              │  /auth   /problem  /submission        │
              │  /video                               │
              │                                      │
              │   adminMiddleware  userMiddleware     │
              └──────┬──────────────────┬────────────┘
                     │                  │
          ┌──────────▼──────┐  ┌────────▼──────────┐
          │    MongoDB       │  │  External Services │
          │                  │  │                    │
          │  Users           │  │  Judge0 CE         │
          │  Problems        │  │  Cloudinary        │
          │  Submissions     │  │                    │
          └──────────────────┘  └────────────────────┘
```

### Code Submission Flow

```
User submits code
      │
      ▼
POST /submission/submit/:problemId
      │
      ├── Normalize language identifier
      ├── Fetch problem + hidden test cases from MongoDB
      ├── Build Judge0 batch submission payload
      │
      ▼
Judge0 /submissions/batch
      │
      ▼
Poll submission tokens until execution completes
      │
      ▼
Persist Submission document in MongoDB
      │
      ▼
Return verdict to client
(Accepted / Wrong Answer / Time Limit Exceeded / Runtime Error)
```

---

## Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB (local instance or [MongoDB Atlas](https://cloud.mongodb.com))
- Judge0 API key via [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
- Cloudinary account ([cloudinary.com](https://cloudinary.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Equationeer/CodeArena.git
cd CodeArena
```

### 2. Configure and Start the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in all required credentials
npm start
```

### 3. Configure and Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.  
The API server runs on `http://localhost:5000`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory using the following reference:

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: `5000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key used for signing JWTs |
| `JUDGE0_API_KEY_1` | Yes | Primary Judge0 RapidAPI key |
| `JUDGE0_API_KEY_2` | No | Secondary Judge0 key for rate limit rotation |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

> **Security notice:** Never commit `.env` files to version control. Use `.env.example` as a safe template.

---

## API Reference

### Authentication — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create a new user account |
| `POST` | `/auth/login` | Public | Authenticate and receive a JWT |
| `POST` | `/auth/logout` | User | Invalidate the current session |
| `GET` | `/auth/checkAuth` | User | Verify the current session token |
| `POST` | `/auth/registerAdmin` | Admin | Provision a new admin account |

### Problems — `/problem`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/problem/getAllProblem` | User | List all problems (title, difficulty, tags) |
| `GET` | `/problem/problemById/:id` | User | Fetch problem details (no hidden test cases) |
| `GET` | `/problem/getProblemForAdmin/:id` | Admin | Fetch full problem including hidden test cases |
| `POST` | `/problem/create` | Admin | Create a new problem |
| `PUT` | `/problem/update/:id` | Admin | Update an existing problem |
| `DELETE` | `/problem/delete/:id` | Admin | Delete a problem |
| `GET` | `/problem/problemSolvedByUser` | User | Get problems solved by the current user |
| `GET` | `/problem/submittedProblem/:pid` | User | Get submission history for a specific problem |

### Submissions — `/submission`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/submission/run/:problemId` | User | Run code against visible test cases |
| `POST` | `/submission/submit/:problemId` | User | Submit code for full evaluation against hidden test cases |

### Videos — `/video`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/video/upload` | Admin | Upload an editorial video to Cloudinary |
| `GET` | `/video/getVideo/:problemId` | User | Retrieve the editorial video URL for a problem |

---

## Supported Languages

| Language | Judge0 Language ID | Monaco Language Mode |
|---|---|---|
| C++ | 54 | `cpp` |
| Java | 62 | `java` |
| JavaScript | 63 | `javascript` |
| Python | 71 | `python` |
| TypeScript | 74 | `typescript` |

---

## Roadmap

The following features are planned for future releases:

- AI-powered hint and explanation system
- Contest mode with live leaderboard and timer
- Per-problem discussion forum
- Admin analytics and usage dashboard
- Code diff viewer for submission history comparison
- Webhook support for third-party CI/CD integration

---

## Contributing

Contributions are welcome and encouraged. To get started:

1. Fork the repository.
2. Create a new feature branch.
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/).
   ```bash
   git commit -m "feat: add contest mode with leaderboard"
   ```
4. Push to your fork.
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request against the `main` branch.

Please ensure all changes are accompanied by appropriate documentation updates. For significant changes, open an issue first to discuss the proposal before submitting a pull request.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for full details.

---

<div align="center">

Developed and maintained by [AlokKumar Gupta](https://github.com/Equationeer)

If you find this project useful, consider giving it a star on GitHub.

</div>
