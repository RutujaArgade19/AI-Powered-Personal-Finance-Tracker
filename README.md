#  AI-Powered Personal Finance Tracker

A full-stack web application that uses ML to auto-categorize transactions, detect spending anomalies, and generate natural language insights.

##  Architecture

```
finance-tracker/
├── frontend/          # React + TypeScript (Vite)
├── backend/           # FastAPI (Python)
└── ml-service/        # scikit-learn ML models
```



### Clone & Install

```bash
# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && pip install -r requirements.txt
```


## Database Setup

```bash
cd backend
python init_db.py
```

## Train ML Model 

```bash
cd backend
python ml/train_model.py
```

## 5. Run the App

```bash
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173`

---

## Docker 

```bash
docker-compose up --build
```

---


## Project Structure Details

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
