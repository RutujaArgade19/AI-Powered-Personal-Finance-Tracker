# 💰 AI-Powered Personal Finance Tracker

A full-stack web application that uses ML to auto-categorize transactions, detect spending anomalies, and generate natural language insights.

## 🏗️ Architecture

```
finance-tracker/
├── frontend/          # React + TypeScript (Vite)
├── backend/           # FastAPI (Python)
└── ml-service/        # scikit-learn ML models
```

## 🚀 Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | React, TypeScript, Vite, Recharts |
| Backend    | FastAPI, SQLAlchemy, PostgreSQL    |
| ML         | scikit-learn, pandas, numpy       |
| Auth       | JWT (python-jose)                 |
| LLM        | OpenAI API / Claude API           |
| Deploy     | Docker Compose                    |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- OpenAI API Key (optional, for AI summaries)

---

### 1. Clone & Install

```bash
# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && pip install -r requirements.txt
```

### 2. Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/financedb
SECRET_KEY=your-super-secret-key-here
OPENAI_API_KEY=sk-...       # optional
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

### 3. Database Setup

```bash
cd backend
python init_db.py
```

### 4. Train ML Model (first time only)

```bash
cd backend
python ml/train_model.py
```

### 5. Run the App

```bash
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173`

---

## 📦 Docker (Recommended)

```bash
docker-compose up --build
```

---

## 🧠 ML Features

### Transaction Categorization
- Uses TF-IDF vectorizer + Logistic Regression
- Trained on 1000+ labeled transaction descriptions
- Categories: Food, Transport, Shopping, Entertainment, Bills, Health, Income, Other

### Anomaly Detection
- Isolation Forest algorithm
- Flags transactions that are unusual vs. your personal spending history
- Per-category thresholds

### AI Summaries (OpenAI)
- Weekly spending reports in plain English
- Trend detection and personalized tips
- Compare spending vs. previous periods

---

## 📁 Project Structure Details

```
backend/
├── main.py                 # FastAPI app entry point
├── database.py             # SQLAlchemy setup
├── init_db.py              # DB initialization
├── requirements.txt
├── models/
│   ├── user.py             # User ORM model
│   └── transaction.py      # Transaction ORM model
├── routes/
│   ├── auth.py             # Login/register endpoints
│   ├── transactions.py     # CRUD + CSV upload
│   └── insights.py         # AI summaries + stats
├── ml/
│   ├── train_model.py      # Train & save classifier
│   ├── categorizer.py      # Predict category
│   └── anomaly.py          # Anomaly detection
└── middleware/
    └── auth.py             # JWT dependency

frontend/src/
├── App.tsx
├── main.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   ├── SpendingChart.tsx
│   ├── CategoryPieChart.tsx
│   ├── AnomalyAlert.tsx
│   └── AISummary.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Insights.tsx
│   └── Auth.tsx
├── hooks/
│   ├── useTransactions.ts
│   └── useAuth.ts
└── utils/
    └── api.ts
```
