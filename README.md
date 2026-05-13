# SmartFlow AI

KOBİ ve üretici kooperatifleri için FastAPI + Gemini tabanlı, tool/function calling kullanan yapay zeka operasyon asistanı.

<img width="1067" height="422" alt="SmartFlow_AI" src="https://github.com/user-attachments/assets/17980c50-805b-48a5-9324-b150ed1538e2" />

## Problem Tanımı

Küçük işletmeler müşteri mesajlarını, sipariş durumlarını, kargo takibini, stok uyarılarını ve günlük görevleri çoğu zaman ayrı araçlarla ve manuel olarak yönetir. Bu durum geciken cevaplara, stok tükenmelerinin geç fark edilmesine, kargo gecikmelerinin müşteriden önce görülememesine ve operasyonel verimsizliğe yol açar.

<img width="1013" height="346" alt="SmartflowAI2" src="https://github.com/user-attachments/assets/a506c8bd-a137-4965-b0e7-3503fabe3a89" />


## Çözüm Özeti

SmartFlow AI müşteri mesajını anlar, sipariş/ürün/kargo/stok verisini tool çağrılarıyla sorgular, müşteriye veri destekli cevap üretir ve yönetici panelinde gecikme, kritik stok, tedarikçi mail taslağı ve günlük görevleri görünür hale getirir.

## Kapsanan Case'ler

| Case | Karşılığı |
|---|---|
| Case 1 - Müşteri İletişiminin Otomasyonu | `/api/chat` müşteri mesajını intent/entity olarak işler ve cevap üretir. |
| Case 2 - Ürün ve Sipariş Takibi | Sipariş, ürün ve özet dashboard endpointleri hazırdır. |
| Case 3 - Kargo Süreçlerinin Yönetimi | Gecikmiş kargo tespit edilir, müşteri/yönetici uyarısı üretilir. |
| Case 4 - Stok ve Envanter Yönetimi | Kritik stoklar belirlenir, tedarikçi mail taslağı gösterilir. |
| Case 5 - İş Akışı ve Görev Yönetimi | `/api/tasks/generate` günlük operasyon brifingi ve görev özeti üretir. |

## Kapsam Dışı

Case 6 analitik/tahmin, gerçek WhatsApp API, gerçek kargo API, ödeme/muhasebe entegrasyonu, rota optimizasyonu, Pinecone/ChromaDB ve multi-agent yapı MVP kapsamı dışındadır. MVP tek ajan + yapısal veri sorgulama + stabil demo yaklaşımını izler.

## Yapay Zeka Yaklaşımı

- Gemini API ile tek merkezi AI ajanı kullanılır.
- Intent classification: `ORDER_STATUS`, `PRODUCT_INFO`, `CARGO_STATUS`, `STOCK_ALERT`, `DAILY_BRIEFING`, `GENERAL`.
- Entity extraction: sipariş numarası ve ürün adı çıkarılır.
- Tool calling: `get_order_status`, `get_product_info`, `get_cargo_status`, `check_stock_alerts`, `draft_supplier_email`, `generate_daily_briefing`, `send_manager_alert`.
- Gemini ana akıştır; API anahtarı yoksa demo kırılmasın diye aynı tool fonksiyonlarını kullanan deterministic fallback çalışır.

## Sistem Mimarisi

```text
Müşteri Chat / Yönetici Dashboard
        |
      FastAPI
        |
 Gemini AI Agent + Tool Dispatcher
        |
 SQLAlchemy / SQLite
        |
 Orders, Products, Shipments, Tasks, Messages
```

## Veri Modeli

Temel tablolar:

- `orders`: sipariş, müşteri, ürün, durum ve tahmini teslimat bilgisi
- `products`: ürün, stok, kritik eşik, tedarikçi ve fiyat bilgisi
- `shipments`: kargo firması, takip no, konum, gecikme günü ve ETA
- `tasks`: operasyon görevleri, öncelik, durum ve ilişkili sipariş/ürün
- `messages`: müşteri mesajı, AI cevabı, intent ve durum

## API Endpointleri

| Method | Path | Açıklama |
|---|---|---|
| GET | `/health` | Sağlık kontrolü |
| POST | `/api/seed` | Demo verisini sıfırlar |
| GET | `/api/orders` | Tüm siparişleri listeler |
| GET | `/api/orders/{order_id}` | Tek sipariş detayı |
| GET | `/api/products` | Tüm ürünleri listeler |
| GET | `/api/shipments` | Tüm kargo kayıtlarını listeler |
| GET | `/api/tasks` | Günlük görevleri listeler |
| PATCH | `/api/tasks/{task_id}` | Görev durumunu günceller |
| POST | `/api/tasks/generate` | AI günlük operasyon brifingi üretir |
| GET | `/api/dashboard/summary` | Yönetici paneli özetini getirir |
| GET | `/api/messages` | Chat mesaj geçmişini listeler |
| POST | `/api/chat` | AI müşteri chat cevabı üretir |
| POST | `/api/alerts/send` | Yönetici e-posta uyarısı gönderir |

## Kurulum

### Docker ile

```powershell
copy backend\.env.example backend\.env
docker compose up --build
```

Uygulama: http://localhost:8080

- Frontend (Nginx): http://localhost:8080
- Backend API: http://localhost:8080/api
- Swagger UI: http://127.0.0.1:8000/docs (backend container'ını ayrıca expose etmek için `docker compose up` sırasında port eklenebilir)

Durdurmak için:

```powershell
docker compose down
# Veritabanını da silmek için:
docker compose down -v
```

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Ayrı terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Statik MVP dosyaları da hazırdır:

- `frontend/chat.html`
- `frontend/dashboard.html`

## Demo Senaryosu

1. `128 numaralı siparişim nerede?`
2. `142 numaralı siparişim neden gelmedi?`
3. `Organik zeytinyağı var mı?`
4. Kritik stok uyarısını ve tedarikçi mail taslağını göster.
5. `/api/tasks/generate` ile günlük operasyon brifingini yenile.

## Kullanılan Teknolojiler

- Backend: FastAPI, Python, SQLAlchemy, SQLite, Pydantic
- AI: Gemini API, function/tool calling, tool destekli fallback
- Harici servis: Resend API
- Frontend teslimleri: HTML + Tailwind CDN + Vanilla JS
- Ek yönetici arayüzü: Vite + React SPA
- Kod paylaşımı ve çalıştırma: GitHub, Docker Compose

## Takım Görev Dağılımı

| Kişi | Sorumluluk |
|---|---|
| Kişi 1 | Backend altyapı, DB, CRUD, dashboard servisi ve read-only endpointler |
| Kişi 2 | Gemini entegrasyonu, tool calling, `/api/chat`, `/api/tasks/generate`, `/api/alerts/send` |
| Kişi 3 | `frontend/chat.html` ve React chat ekranı |
| Kişi 4 | `frontend/dashboard.html`, React dashboard ve yönetici aksiyonları |

## Testler

```powershell
cd backend
.venv\Scripts\python.exe -m pytest
```

## Future Work

- Case 6: Analitik ve içgörü üretimi
- Gerçek WhatsApp Business API
- Gerçek kargo firması API
- Kullanıcı yetkilendirme
- Rate limiting
- Production deployment

  <img width="1013" height="346" alt="SmartflowAI2" src="https://github.com/user-attachments/assets/3c54e1ce-7b3d-4d50-b713-b89536176858" />

