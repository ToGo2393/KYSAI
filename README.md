# KYSAI - AI-Powered Quality Management System

**Mission:** Automating 8D Problem Solving and HSE Audits for Engineering Teams.

KYSAI is a next-generation Quality Management System (QMS) designed to streamline standard quality processes using advanced AI. It bridges the gap between traditional engineering reports and modern automation.

---

## 🚀 Core Features

- **AI-Powered 8D Reporting**: 
  - Generates technical D1-D8 reports from simple problem descriptions.
  - Features strict **Turkish Language Support** for local compliance.
  - Automated Root Cause Analysis (Fishbone/Ishikawa diagrams).
  
- **Computer Vision HSE Audits**:
  - Upload workplace images to detect safety hazards automatically.
  - Generates ISO 45001 compliant audit reports with corrective actions.

- **Professional PDF Export**:
  - One-click export for strict industry-standard reports.
  - Full support for Turkish characters and formatting.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite + TypeScript), Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic.
- **Database**: SQLite (Local), easily scalable to PostgreSQL.
- **AI Engine**: Google Gemini 1.5 Pro (Generative AI & Vision).

---

## 📦 Setup Guide

### Prerequisites
- Node.js & npm
- Python 3.9+
- Google Gemini API Key

### 1. Verification
Clone the repository:
```bash
git clone https://github.com/StartUpTurgut/KYSAI.git
cd KYSAI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

pip install -r requirements.txt
```

**Environment Variables**:
Create a `.env` file in the root directory:
```
GEMINI_API_KEY="your_api_key_here"
```

Start the backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to launch KYSAI.

---

## 🤝 Feedback & Contribution

We are actively seeking feedback from **Quality Engineers, HSE Managers, and Software Developers**!

- **Found a bug?** Open an [Issue](https://github.com/StartUpTurgut/KYSAI/issues).
- **Have a feature request?** start a Discussion.
- **Want to contribute?** Fork the repo and submit a Pull Request.

Let's build the future of Quality Management together. 🚀
