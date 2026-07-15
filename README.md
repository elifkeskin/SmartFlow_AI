# SmartFlow AI

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](backend/Dockerfile)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](backend/requirements.txt)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](frontend/package.json)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](frontend/package.json)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)](backend/requirements.txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI operations assistant for SMEs and producer cooperatives, built on FastAPI + Gemini with tool/function calling.

**🔗 Live Demo:** [smartflow-frontend-production.up.railway.app](https://smartflow-frontend-production.up.railway.app/)

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Covered Cases](#covered-cases)
- [Out of Scope](#out-of-scope)
- [AI Approach](#ai-approach)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Demo Scenario](#demo-scenario)
- [Tech Stack](#tech-stack)
- [Team Responsibilities](#team-responsibilities)
- [Tests](#tests)
- [Future Work](#future-work)
- [License](#license)

## Problem Statement

Small businesses typically manage customer messages, order statuses, shipment tracking, stock alerts, and daily tasks across separate tools and manual processes. This leads to delayed responses, late detection of stockouts, shipment delays that customers notice before the business does, and overall operational inefficiency.

## Solution Overview

SmartFlow AI understands customer messages, queries order/product/shipment/stock data through tool calls, generates data-backed replies to customers, and surfaces delays, critical stock, supplier email drafts, and daily tasks in an admin dashboard.

## Covered Cases

| Case | Coverage |
|---|---|
| Case 1 - Customer Communication Automation | `/api/chat` processes the customer message as intent/entity and generates a reply. |
| Case 2 - Order & Product Tracking | Order, product, and summary dashboard endpoints are ready. |
| Case 3 - Shipment Process Management | Delayed shipments are detected and customer/manager alerts are generated. |
| Case 4 - Stock & Inventory Management | Critical stock levels are identified and supplier email drafts are shown. |
| Case 5 - Workflow & Task Management | `/api/tasks/generate` produces a daily operations briefing and task summary. |

## Out of Scope

Case 6 analytics/forecasting, a real WhatsApp API, a real shipping carrier API, payment/accounting integration, route optimization, Pinecone/ChromaDB, and a multi-agent architecture are out of scope for the MVP. The MVP follows a single-agent + structured data querying + stable demo approach.

## AI Approach

- A single centralized AI agent powered by the Gemini API.
- Intent classification: `ORDER_STATUS`, `PRODUCT_INFO`, `CARGO_STATUS`, `STOCK_ALERT`, `DAILY_BRIEFING`, `GENERAL`.
- Entity extraction: order number and product name are extracted.
- Tool calling: `get_order_status`, `get_product_info`, `get_cargo_status`, `check_stock_alerts`, `draft_supplier_email`, `generate_daily_briefing`, `send_manager_alert`.
- Gemini is the primary path; if no API key is set, a deterministic fallback using the same tool functions keeps the demo from breaking.

## System Architecture

```text
Customer Chat / Admin Dashboard
        |
      FastAPI
        |
 Gemini AI Agent + Tool Dispatcher
        |
 SQLAlchemy / SQLite
        |
 Orders, Products, Shipments, Tasks, Messages
```

## Data Model

Core tables:

| Table | Contents |
|---|---|
| `orders` | Order, customer, product, status, and estimated delivery info |
| `products` | Product, stock, critical threshold, supplier, and price info |
| `shipments` | Carrier, tracking number, location, delay days, and ETA |
| `tasks` | Operational tasks, priority, status, and related order/product |
| `messages` | Customer message, AI reply, intent, and status |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/seed` | Resets demo data |
| GET | `/api/orders` | Lists all orders |
| GET | `/api/orders/{order_id}` | Single order detail |
| GET | `/api/products` | Lists all products |
| GET | `/api/shipments` | Lists all shipment records |
| GET | `/api/tasks` | Lists daily tasks |
| PATCH | `/api/tasks/{task_id}` | Updates task status |
| POST | `/api/tasks/generate` | Generates AI daily operations briefing |
| GET | `/api/dashboard/summary` | Retrieves the admin dashboard summary |
| GET | `/api/messages` | Lists chat message history |
| POST | `/api/chat` | Generates an AI customer chat reply |
| POST | `/api/alerts/send` | Sends an admin email alert |

## Environment Variables

The backend reads the following variables from `backend/.env` (see `backend/.env.example`):

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini API access key |
| `GEMINI_MODEL` | Gemini model to use (default: `gemini-2.5-flash`) |
| `RESEND_API_KEY` | API key for sending email via Resend |
| `RESEND_FROM_EMAIL` | Sender email address |
| `MANAGER_EMAIL` | Address that receives manager alerts |
| `DATABASE_URL` | Database connection string (default: SQLite) |

## Project Structure

```text
SmartFlow_AI/
├── backend/
│   ├── app/
│   │   ├── routers/          # orders, products, shipments, tasks, messages, chat, alerts, ai_tasks, system
│   │   ├── main.py            # FastAPI app + router include
│   │   ├── crud.py            # DB queries (pure functions)
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── ai_service.py      # Gemini integration / tool calling
│   │   ├── tools.py           # AI tool functions
│   │   ├── dashboard_service.py
│   │   ├── email_service.py   # Resend integration
│   │   ├── seed.py             # Demo data generation
│   │   ├── config.py
│   │   └── database.py
│   ├── tests/                 # pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, Orders, Products, Shipments, Tasks, Chat
│   │   ├── components/         # Badge, Layout, StatCard, StockBar, PriorityChip
│   │   ├── hooks/useApiData.jsx
│   │   ├── api/client.js
│   │   └── App.jsx / main.jsx
│   ├── chat.html               # Static MVP chat UI
│   ├── dashboard.html          # Static MVP dashboard UI
│   ├── package.json
│   └── Dockerfile
├── docs/                       # Architecture, data model, demo script, pitch deck
├── docker-compose.yml
├── LICENSE
└── README.md
```

## Setup

> **Want a quick look without setting anything up? Try the live demo:** [smartflow-frontend-production.up.railway.app](https://smartflow-frontend-production.up.railway.app/)

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Docker Desktop (only if you're using the Docker setup)

### With Docker

```powershell
copy backend\.env.example backend\.env
docker compose up --build
```

- Frontend (Nginx): http://localhost:8080
- Backend API: http://localhost:8080/api

To stop:

```powershell
docker compose down
# To also remove the database:
docker compose down -v
```

### Manual Setup

Backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

Load demo data (with the server running):

```powershell
curl -X POST http://127.0.0.1:8000/api/seed
```

In a separate terminal, frontend:

```powershell
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173

Static MVP files are also available directly in `frontend/`:

- `frontend/chat.html`
- `frontend/dashboard.html`


## Demo Scenario

1. `128 numaralı siparişim nerede?` ("Where is my order #128?")
2. `142 numaralı siparişim neden gelmedi?` ("Why hasn't my order #142 arrived?")
3. `Organik zeytinyağı var mı?` ("Do you have organic olive oil in stock?")
4. Show the critical stock alert and the supplier email draft.
5. Refresh the daily operations briefing via `/api/tasks/generate`.


## Tech Stack

- **Backend:** FastAPI, Python, SQLAlchemy, SQLite, Pydantic
- **AI:** Gemini API, function/tool calling, tool-backed fallback
- **External service:** Resend API
- **Frontend deliverables:** HTML + Tailwind CDN + Vanilla JS
- **Additional admin UI:** Vite + React SPA
- **Code sharing & runtime:** GitHub, Docker Compose

## Team Responsibilities

| Member | Responsibility |
|---|---|
| Member 1 | Backend infrastructure, DB, CRUD, dashboard service, and read-only endpoints |
| Member 2 | Gemini integration, tool calling, `/api/chat`, `/api/tasks/generate`, `/api/alerts/send` |
| Member 3 | `frontend/chat.html` and the React chat screen |
| Member 4 | `frontend/dashboard.html`, React dashboard, and admin actions |

## Tests

```powershell
cd backend
.venv\Scripts\python.exe -m pytest
```

## Future Work

- Case 6: Analytics and insight generation
- Real WhatsApp Business API
- Real shipping carrier API
- User authentication
- Rate limiting
- Production deployment

## License

This project is licensed under the [MIT License](LICENSE).

