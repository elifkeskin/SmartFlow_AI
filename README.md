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
├── frontend/         # Statik HTML arayüzler (Kişi 3 & 4)
└── docs/             # Proje dokümanları
```

## Kurulum

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# .env dosyasını düzenle: GEMINI_API_KEY, RESEND_API_KEY
```

## Çalıştırma

```powershell
cd backend
uvicorn app.main:app --reload
```

API ayağa kalktıktan sonra:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Health: http://127.0.0.1:8000/health

Demo verisini yüklemek için:

```powershell
curl -X POST http://127.0.0.1:8000/api/seed
```

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
| POST | `/api/tasks/generate` | AI günlük brifing (Kişi 2) |
| POST | `/api/alerts/send` | Yönetici uyarı maili (Kişi 2) |

## Ekip İş Bölümü

| Kişi | Sorumluluk |
|---|---|
| Kişi 1 | Backend altyapı, DB, CRUD, dashboard servisi, read-only endpoint'ler |
| Kişi 2 | Gemini AI entegrasyonu, tool calling, `/api/chat`, `/api/tasks/generate`, `/api/alerts/send` |
| Kişi 3 | `frontend/chat.html` — müşteri chat arayüzü |
| Kişi 4 | `frontend/dashboard.html` — yönetici dashboard arayüzü |

## Teknoloji Yığını

- **Backend**: FastAPI + Python 3.11+
- **AI**: Gemini API (google-generativeai)
- **DB**: SQLite + SQLAlchemy 2.x
- **Validation**: Pydantic v2
- **E-posta**: Resend API
- **Frontend**: HTML + Tailwind CDN + Vanilla JS

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
