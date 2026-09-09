# DOCSCREEN — AI-Assisted Passport & Document Screening

**SIH 2026 — Problem Statement SIH26188**

DOCSCREEN is an AI-assisted document screening system designed for high-volume immigration and airport checkpoints.

The system performs rapid passport verification using:

- OCR-based passport text extraction
- MRZ extraction and check-digit validation
- Passport expiry validation
- Forensic image analysis
- Machine-learning-based tampering/anomaly detection
- Explainable risk scoring
- CLEAR / REVIEW / HIGH-RISK classification
- Officer verification dashboard
- Verification history

> **Important:** DOCSCREEN is a proof-of-concept screening system. It provides an explainable risk assessment and prioritizes suspicious documents for human inspection. It does not claim to autonomously determine that a passport is genuine or fraudulent.

---

## System Architecture

```text
                 PASSPORT IMAGE
                       │
                       ▼
              ┌─────────────────┐
              │  Image Upload   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │     OCR         │
              │   PaddleOCR     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  MRZ Extraction │
              │ + Validation     │
              └────────┬────────┘
                       │
             ┌─────────┴──────────┐
             ▼                    ▼
      Expiry Validation      Forensic ML
                                  │
                                  ▼
                         Tampering Signal
             └─────────┬──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   Risk Engine   │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       CLEAR         REVIEW     HIGH-RISK
          │            │            │
          ▼            ▼            ▼
      Auto-clear   Human review   Escalation
```

---

# Project Structure

```text
SIH-26188/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   ├── package.json
│   └── README.md
│
├── ml/
│   ├── src/
│   │   ├── features/
│   │   ├── inference/
│   │   ├── training/
│   │   └── evaluation/
│   │
│   ├── models/
│   │   └── tampering_random_forest.joblib
│   │
│   └── requirements.txt
│
├── data/
│   ├── demo_dataset/
│   │   ├── genuine/
│   │   └── tampered/
│   │
│   └── README.md
│
├── docs/
│
└── README.md
```

---

# Requirements

## Software

Recommended environment:

| Software | Version |
|---|---|
| Python | **3.12.x** |
| Node.js | **18+** |
| npm | Comes with Node.js |
| Git | Current version |
| OS | Windows / Linux / macOS |

The current development environment has been tested with Python 3.12.

## Hardware

A GPU is **not required**.

The OCR pipeline is configured to run on CPU using lightweight PaddleOCR models.

If PaddleOCR has not downloaded its models before, the first OCR execution may take longer while the required models are downloaded/cached.

---

# 1. Clone the Repository

Clone the repository:

```powershell
git clone https://github.com/mishra-codes/SIH-26188.git
cd SIH-26188
```

Switch to the shared integration branch:

```powershell
git checkout feature/integration
```

Pull the latest version:

```powershell
git pull origin feature/integration
```

---

# 2. Backend + ML Setup

From the repository root:

```powershell
python --version
```

Make sure Python 3.12.x is being used.

Create a virtual environment:

```powershell
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

You should see something similar to:

```text
(.venv) PS C:\Dev\SIH-26188>
```

Upgrade pip:

```powershell
python -m pip install --upgrade pip
```

---

## Install ML Dependencies

Run:

```powershell
pip install -r ml\requirements.txt
```

This installs the dependencies required for:

- PaddleOCR
- PaddlePaddle
- OpenCV
- Pillow
- pandas
- scikit-learn
- joblib
- forensic feature extraction
- ML inference

---

## Install Backend Dependencies

Run:

```powershell
pip install -r backend\requirements.txt
```

---

# 3. Verify the ML Model

The repository contains the trained PoC model:

```text
ml/models/tampering_random_forest.joblib
```

You **do not need to retrain the model** to run the application.

The backend automatically loads this model during verification.

On Windows PowerShell, check that it exists:

```powershell
Test-Path ml\models\tampering_random_forest.joblib
```

Expected:

```text
True
```

---

# 4. Start the Backend

Make sure the virtual environment is activated.

From the repository root:

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

Expected output will contain something similar to:

```text
Uvicorn running on http://127.0.0.1:8000
```

Keep this terminal running.

---

# 5. Test the Backend

Open a second terminal.

Activate the virtual environment again:

```powershell
cd SIH-26188
.venv\Scripts\activate
```

Open:

```text
http://localhost:8000/health
```

The response should be:

```json
{
  "status": "ok",
  "service": "document-screening-api"
}
```

---

# 6. Backend API

The main verification endpoint is:

```text
POST /verify
```

Full URL:

```text
http://localhost:8000/verify
```

The endpoint accepts:

- JPEG
- PNG

Example request:

```text
POST /verify
Content-Type: multipart/form-data
file=<passport image>
```

Example response:

```json
{
  "status": "REVIEW",
  "risk_score": 30,
  "document": {
    "document_type": "passport",
    "passport_number": "S4528425",
    "name": "JORDAN TESTOV",
    "nationality": "SYN",
    "date_of_birth": "1969-09-25",
    "date_of_expiry": "2028-03-22",
    "issuing_country": "SYN"
  },
  "checks": {
    "ocr": "PASS",
    "mrz": "PASS",
    "expiry": "PASS",
    "tampering": "SUSPICIOUS",
    "face": "NOT_RUN",
    "consistency": "NOT_RUN"
  }
}
```

---

# 7. Frontend Setup

Open another terminal.

From the repository root:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

You should get a URL similar to:

```text
http://localhost:5173
```

Open it in your browser.

---

# 8. Run the Complete Application

You need **two terminals** running simultaneously.

## Terminal 1 — Backend

```powershell
cd SIH-26188
.venv\Scripts\activate
uvicorn backend.app.main:app --reload --port 8000
```

## Terminal 2 — Frontend

```powershell
cd SIH-26188\frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 9. Verify a Passport

From the dashboard:

```text
Dashboard
    ↓
Verify
    ↓
Upload passport image
    ↓
Verify Document
```

The system will perform:

```text
OCR Extraction
      ↓
MRZ Validation
      ↓
Expiry Check
      ↓
Forensic ML
      ↓
Risk Fusion
      ↓
Final Decision
```

The UI displays:

- Passport preview
- Passport number
- Full name
- Nationality
- Date of birth
- Date of expiry
- Issuing country
- OCR status
- MRZ status
- Expiry status
- Tampering status
- Risk score
- Risk factors
- Verification history

---

# 10. Risk Classification

The current risk engine uses three decision levels:

```text
0–29
  ↓
CLEAR
```

```text
30–69
  ↓
REVIEW
```

```text
70–100
  ↓
HIGH-RISK
```

## CLEAR

The document passes the available checks and has a sufficiently low combined risk score.

## REVIEW

The system detects an anomaly or suspicious signal and recommends human inspection.

## HIGH-RISK

Multiple verification failures and/or strong suspicious signals result in a high combined risk score.

---

# 11. Demo Dataset

A controlled synthetic dataset is included in:

```text
data/demo_dataset/
```

It contains:

```text
genuine/
    DOC001
    DOC002
    ...
    DOC020

tampered/
    DOC001_copy_paste
    DOC001_portrait
    DOC001_region
    DOC001_text
    ...
```

The tampered dataset contains four controlled manipulation categories:

```text
copy_paste
portrait
region
text
```

The dataset is intended for:

- Development
- Testing
- Model evaluation
- Demonstration
- Reproducible experimentation

---

# 12. Recommended Demo Samples

For the SIH demonstration, use the **synthetic controlled dataset** rather than relying exclusively on arbitrary real-world passports.

The system has been tested to demonstrate:

```text
🟢 CLEAR
      ↓
Low-risk document

🟠 REVIEW
      ↓
Suspicious/anomalous signal

🔴 HIGH-RISK
      ↓
Multiple verification failures
```

This demonstrates the complete decision pipeline.

---

# 13. Important ML Limitation

The forensic ML model is a **PoC model trained using controlled synthetic document data**.

Therefore:

> A high forensic model score does not automatically mean that a real passport is fraudulent.

Real-world passports can have different:

- layouts
- printing characteristics
- image quality
- compression
- security backgrounds
- lighting
- scanning/camera characteristics
- document designs

The system therefore treats forensic ML as **one risk signal** rather than an autonomous final decision.

Production deployment would require:

- larger representative datasets
- genuine and fraudulent real-world samples
- model calibration
- broader document coverage
- threshold validation
- additional identity/document consistency checks
- operational security testing

---

# 14. Current PoC Scope

## Implemented

- [x] Passport image upload
- [x] OCR
- [x] MRZ extraction
- [x] MRZ check-digit validation
- [x] Passport number extraction
- [x] Name extraction
- [x] Nationality extraction
- [x] Date of birth extraction
- [x] Expiry extraction
- [x] Expiry validation
- [x] Forensic feature extraction
- [x] Random Forest tampering classifier
- [x] Risk fusion
- [x] CLEAR / REVIEW / HIGH-RISK
- [x] Explainable risk factors
- [x] Verification history
- [x] Officer dashboard
- [x] Controlled demo dataset

## Planned / Future

- [ ] Face verification
- [ ] Cross-document consistency
- [ ] Advanced document forensics
- [ ] Larger real-world training dataset
- [ ] Model calibration
- [ ] Production deployment
- [ ] Database-backed persistent history

---

# 15. Running Tests

Backend tests:

```powershell
pytest backend
```

ML tests:

```powershell
pytest ml
```

Run all tests:

```powershell
pytest
```

---

# 16. Frontend Commands

From:

```powershell
cd frontend
```

## Development

```powershell
npm run dev
```

## Production build

```powershell
npm run build
```

## Lint

```powershell
npm run lint
```

## Preview production build

```powershell
npm run preview
```

---

# 17. Git Workflow for the Team

Do **not** directly develop on `main`.

The shared working branch is:

```text
feature/integration
```

Before starting work:

```powershell
git checkout feature/integration
git pull origin feature/integration
```

Create your own feature branch:

```powershell
git checkout -b feature/<your-feature>
```

Example:

```powershell
git checkout -b feature/face-verification
```

After making changes:

```powershell
git status
git add <specific-files>
git commit -m "feat: add face verification"
git push origin feature/face-verification
```

Then create a Pull Request:

```text
feature/<your-feature>
        ↓
feature/integration
```

After review and testing, changes can eventually be merged into:

```text
main
```

## Important

Avoid:

```powershell
git add .
```

unless you have checked exactly what will be committed.

Never commit:

```text
.venv/
__pycache__/
API keys
passwords
secrets
real passport images
personal identity documents
```

---

# 18. Quick Start

For teammates who just want the shortest setup:

## Clone

```powershell
git clone https://github.com/mishra-codes/SIH-26188.git
cd SIH-26188
git checkout feature/integration
```

## Python environment

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r ml\requirements.txt
pip install -r backend\requirements.txt
```

## Start backend

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

## New terminal → frontend

```powershell
cd SIH-26188\frontend
npm install
npm run dev
```

## Open

```text
http://localhost:5173
```

That's it.

---

# SIH Project Objective

DOCSCREEN aims to reduce manual workload at high-volume immigration checkpoints by performing **rapid first-line document screening**.

The core principle is:

> **Automatically clear low-risk documents while prioritizing suspicious cases for human inspection.**

The system is designed as an **AI-assisted screening layer**, not a replacement for immigration officers or official document-issuing authorities.

---

## Team

**SIH 2026 — SIH26188**

AI-Assisted Fake Identity & Document Screening System
