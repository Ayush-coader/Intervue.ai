
# Intervue.ai

<p align="center">
  <strong>AI-powered interview preparation tailored to your resume and target role.</strong>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white">
  <img alt="Google Gemini" src="https://img.shields.io/badge/AI-Google%20Gemini-8E75B2">
</p>

Intervue.ai is a full-stack AI interview-preparation application. It uses a candidate's resume, self-description, and target job description to generate a personalized interview preparation report. The report includes a role-match score, technical and behavioral questions with guidance, identified skill gaps, and a structured seven-day preparation plan. The backend also supports generating a tailored resume PDF from the supplied candidate and role information.

> **Note:** AI-generated reports are preparation aids. Review all generated content and verify that any resume details are accurate before using them professionally.

## Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [API Overview](#api-overview)
- [Deployment Notes](#deployment-notes)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Personalized interview report:** Generate preparation material using a resume PDF, candidate self-description, and target job description.
- **Role-match score:** Receive an AI-generated estimate of how closely the candidate profile aligns with the role requirements.
- **Technical interview practice:** Review role-relevant technical questions, why they may be asked, and suggested answers.
- **Behavioral interview practice:** Prepare for behavioral questions with answer guidance structured around the STAR approach.
- **Skill-gap identification:** See skills or competencies that may need additional preparation, with severity levels.
- **Seven-day preparation roadmap:** Follow a day-by-day plan with focused tasks and actionable preparation activities.
- **Resume PDF generation:** Generate a job-targeted resume PDF using the candidate's provided information.
- **Authentication:** Register, log in, retrieve the current user profile, and log out.
- **Saved reports:** Retrieve an individual interview report or list reports associated with the authenticated user.
- **PDF resume upload:** Upload a resume PDF as part of the report-generation workflow.
- **Responsive web interface:** React-based single-page application with routed pages and Sass styling.

## How It Works

1. Create an account or log in.
2. Provide a self-description and the job description for the role you are targeting.
3. Upload your resume as a PDF.
4. The backend extracts and combines the supplied information, then sends a structured prompt to Google Gemini.
5. Intervue.ai returns a report containing a match score, technical questions, behavioral questions, skill gaps, and a seven-day preparation plan.
6. View saved reports later and generate a tailored resume PDF when needed.

The generated report is stored through the application's MongoDB-backed data layer and associated with the authenticated user.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling and UI | Sass, Lucide React |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| AI generation | Google Gemini (`@google/genai`), Gemini Flash models |
| Validation / structured output | Zod, `zod-to-json-schema` |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| File handling | Multer, `pdf-parse` |
| PDF generation | Puppeteer |
| Middleware | CORS, express-rate-limit, dotenv |

## Project Structure

```text
Intervue.ai/
├── Backend/
│   ├── server.js
│   ├── package.json
│   ├── .env_sample
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── controller/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── pdf.middleware.js
│       ├── models/
│       │   ├── blacklist.model.js
│       │   ├── interviewReport.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.route.js
│       │   └── interview.route.js
│       └── services/
│           └── ai.service.js
└── Frontend/
    ├── package.json
    ├── vite.config.js
    ├── vercel.json
    └── src/
        ├── App.jsx
        ├── app.routes.jsx
        ├── components/
        └── features/
            ├── auth/
            └── interview/
```

## Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) (use a current LTS release)
- npm (included with Node.js)
- A MongoDB database, such as a local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Clone the Repository

```bash
git clone https://github.com/Ayush-coader/Intervue.ai.git
cd Intervue.ai
```

## Environment Variables

Create a `.env` file inside the `Backend` directory. You can use `.env_sample` as a reference.

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB connection string used by Mongoose |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens |
| `GEMINI_API_KEY` | API key used to access Google Gemini |

Keep `.env` private. Do not commit API keys, database credentials, or JWT secrets to Git.

## Run Locally

Open two terminals from the repository root.

### 1. Start the Backend

```bash
cd Backend
npm install
```

Create and populate `Backend/.env`, then start the server:

```bash
npm run dev
```

The backend uses `server.js` as its entry point. Check the server configuration and terminal output for the listening port and database connection status.

### 2. Start the Frontend

In a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Vite will print the local development URL in the terminal (commonly `http://localhost:5173`). Open that URL in your browser.

### Production Build

To create a frontend production build:

```bash
cd Frontend
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

To run the frontend lint checks:

```bash
npm run lint
```

## API Overview

The backend exposes authentication and interview-report routes under `/api`.

### Authentication

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a user | Public |
| `POST` | `/api/auth/login` | Authenticate a user | Public |
| `GET` | `/api/auth/logout` | Log out the current user | Public route |
| `GET` | `/api/auth/getuser` | Retrieve the authenticated user's profile | Authenticated |

### Interview Reports

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `POST` | `/api/interview` | Generate a report from candidate details, job description, and resume PDF | Authenticated |
| `GET` | `/api/interview` | List the authenticated user's reports | Authenticated |
| `GET` | `/api/interview/report/:interviewId` | Retrieve a report by its ID | Authenticated |
| `POST` | `/api/interview/resume/pdf/:interviewId` | Generate a tailored resume PDF for a report | Authenticated |

For `POST /api/interview`, send the resume as a multipart form-data file using the field name `resume`, along with the other candidate and job-description fields expected by the frontend/API implementation. The backend validates PDF uploads and handles upload errors.

> Request field names and response payloads are defined in the backend controllers and frontend API service files. Refer to those files when integrating a separate client.

## Deployment Notes

The repository includes a Vercel configuration for the frontend and Puppeteer configuration for the backend. When deploying:

- Configure the frontend's API base URL to point to the deployed backend.
- Set `MONGO_URL`, `JWT_SECRET`, and `GEMINI_API_KEY` in the backend hosting provider's environment-variable settings.
- Configure backend CORS to allow the exact deployed frontend origin.
- Ensure the backend host supports Puppeteer/Chrome for PDF generation. The backend package includes a `postinstall` step to install the Puppeteer Chrome browser.
- Keep secrets in the hosting provider's environment configuration rather than in source code.
- Verify authentication cookies, HTTPS settings, and cross-origin credentials in the deployed environment.

## Security Notes

- Never expose the Gemini API key, MongoDB connection string, or JWT secret in frontend code.
- Use a unique, strong `JWT_SECRET` for each deployment environment.
- Restrict CORS to trusted frontend origins before production use.
- Treat uploaded resumes and generated reports as private user data.
- Review rate limits, authentication behavior, cookie settings, and file-upload constraints before public deployment.

## Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a Pull Request describing the change.



<p align="center">
  Built by <a href="https://github.com/Ayush-coader">Ayush Katiyar</a>
</p>
