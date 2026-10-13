# 🩺 DawaVerify X: AI Health Intelligence

Full-stack clinical AI health platform built with **React 19, TypeScript, Express, and Cloud Firestore**. It analyzes prescriptions using two-stage Gemini Vision OCR, detects drug-drug interactions automatically, and manages health records offline-first.

> ⚠️ **Disclaimer:** This is an educational/portfolio project. It is **not** a substitute for professional medical advice. Always consult a qualified doctor or pharmacist.

## 📸 Screenshots

<img width="1366" height="607" alt="Screenshot 2026-10-13 081851" src="https://github.com/user-attachments/assets/d1a1a0de-85b1-4c73-b363-e625de4fb187" />
<img width="1364" height="660" alt="Screenshot 2026-10-13 081148" src="https://github.com/user-attachments/assets/04172ad9-feea-4ef5-9b65-81033fc4719f" />


> All screenshots use demo/sample data.

## ✨ Features

- **AI Prescription Analyzer:** two-stage Gemini Vision OCR to read prescriptions
- **Interaction Risk Engine:** drug-drug and allergy interaction detection
- **Health Copilot:** AI chat assistant for health questions
- **Clinical Timeline:** track medical history over time
- **Lab Report Trends:** monitor lab results
- **Medication Adherence Tracker**
- **Emergency QR Health Passport**
- **Family Health Vault**
- **Doctor / Care Team Directory**
- **Role-based access:** patient, doctor, admin
- **Offline-first** health record management

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | Cloud Firestore |
| AI | Google Gemini API (Vision OCR, multi-model fallback) |
| Auth | JWT-based |

## 🚀 Getting Started

### Prerequisites
- Node.js (or Bun)
- A [Gemini API key](https://aistudio.google.com/apikey)
- A Firebase project with Firestore enabled

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/saimali159/DawaVerify-X---AI-Health-Intelligence.git
cd DawaVerify-X---AI-Health-Intelligence

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your Gemini API key and Firebase config in .env

# 4. Run the app
npm run dev
```

## 📁 Project Structure

```
├── server/        # Express backend
├── src/           # React frontend
├── firestore.rules
└── .env.example
```

## 🗺️ Roadmap

- [ ] [Next feature idea]
- [ ] [Another idea]

## 👨‍💻 Author

**Saim Qureshi**
CS Student, University of Sufism and Modern Sciences, Bhit Shah
🔗 [GitHub](https://github.com/saimali159) · [LinkedIn](your-linkedin-url)
