# SmartFlow AI

KOBİ ve kooperatifler için FastAPI + Gemini tabanlı yapay zeka operasyon asistanı.

## Proje Yapısı

```
SmartFlow_AI/
├── backend/          # FastAPI uygulaması (Python)
│   ├── app/          # Uygulama kaynak kodu
│   ├── tests/        # Pytest testleri
│   ├── requirements.txt
│   └── .env.example
├── frontend/         # Vite + React SPA (Kişi 3 & 4)
│   ├── src/
│   │   ├── pages/    # Dashboard, Orders, Shipments, Products, Tasks, Pending, Chat
│   │   ├── components/ # Layout, Badge, StatCard, StockBar, PriorityChip
│   │   ├── hooks/    # useApiData (DataProvider + context)
│   │   ├── api/      # client.js — tüm fetch helper'ları
│   │   └── styles/   # theme.css, global.css
│   ├── package.json
│   └── vite.config.js (proxy: /api → http://127.0.0.1:8000)
└── docs/             # Proje dokümanları
```

## Docker ile Çalıştırma (Önerilen)

```powershell
# 1. .env dosyasını oluştur
copy backend\.env.example backend\.env
# backend\.env dosyasını düzenle: GEMINI_API_KEY, RESEND_API_KEY, MANAGER_EMAIL

# 2. Build ve başlat
docker compose up --build
```

Uygulama: http://localhost

- Frontend (Nginx): http://localhost
- Backend API: http://localhost/api
- Swagger UI: http://127.0.0.1:8000/docs (backend container'ını ayrıca expose etmek için `docker compose up` sırasında port eklenebilir)

Durdurmak için:

```powershell
docker compose down
# Veritabanını da silmek için:
docker compose down -v
```

---

## Yerel Geliştirme Kurulumu

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# .env dosyasını düzenle: GEMINI_API_KEY, RESEND_API_KEY
```

## Çalıştırma

### Backend

```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

API ayağa kalktıktan sonra:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Health: http://127.0.0.1:8000/health

Demo verisini yüklemek için (backend ilk açılışta otomatik seed yapar):

```powershell
curl -X POST http://127.0.0.1:8000/api/seed
```

### Frontend

Ayrı bir terminalde:

```powershell
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173

Vite proxy sayesinde `/api/*` istekleri otomatik olarak `http://127.0.0.1:8000`'a yönlendirilir — CORS ayarı gerekmez.

## Testler

```powershell
cd backend
pytest
```

## Endpoint Listesi

| Method | Path | Açıklama |
|---|---|---|
| GET | `/health` | Servis sağlık kontrolü |
| POST | `/api/seed` | Demo verisini sıfırla ve yükle |
| GET | `/api/orders` | Tüm siparişleri listele |
| GET | `/api/orders/{order_id}` | Tek sipariş detayı |
| GET | `/api/products` | Tüm ürünleri listele |
| GET | `/api/shipments` | Tüm kargo kayıtlarını listele |
| GET | `/api/tasks` | Tüm görevleri listele |
| GET | `/api/dashboard/summary` | Yönetici paneli özeti |
| POST | `/api/chat` | AI chat (Kişi 2) |
| PATCH | `/api/tasks/{id}` | Görev durumunu güncelle (onay/red) |
| GET | `/api/messages` | Chat mesaj geçmişi |
| POST | `/api/ai/tasks/generate` | AI günlük brifing (Gemini) |
| POST | `/api/alerts/send` | Yönetici uyarı maili |

## Ekip İş Bölümü

| Kişi | Sorumluluk |
|---|---|
| Kişi 1 | Backend altyapı, DB, CRUD, dashboard servisi, read-only endpoint'ler |
| Kişi 2 | Gemini AI entegrasyonu, tool calling, `/api/chat`, `/api/tasks/generate`, `/api/alerts/send` |
| Kişi 3 | `frontend/src/pages/ChatPage.jsx` — müşteri chat arayüzü |
| Kişi 4 | `frontend/src/pages/DashboardPage.jsx` ve diğer sayfalar — yönetici paneli |

## Teknoloji Yığını

- **Backend**: FastAPI + Python 3.11+
- **AI**: Gemini API (google-generativeai)
- **DB**: SQLite + SQLAlchemy 2.x
- **Validation**: Pydantic v2
- **E-posta**: Resend API
- **Frontend**: Vite + React 18 + react-router-dom v6 + Chart.js 4 + react-chartjs-2

## Notlar

- CORS `*` olarak açık (MVP). Production'da daraltılmalı.
- `POST /api/seed` sadece demo/geliştirme ortamında kullanılır.
- `.env` dosyası asla git'e eklenmemelidir.

## Future Work

- Case 6: Analitik ve içgörü üretimi
- Gerçek WhatsApp Business API entegrasyonu
- Gerçek kargo firması API entegrasyonu
- Kullanıcı yetkilendirme
- Rate limiting
- Production deployment
