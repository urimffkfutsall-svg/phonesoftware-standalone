# PhoneSoftware - Standalone

Sistem i pavarur per menaxhimin e dyqaneve te telefonave mobil.

## Funksionalitetet
- Menaxhimi i riparimeve (Repairs)
- Inventari (Inventory)
- Klientet / CRM (Customers)
- Stafi dhe teknicientet (Staff)
- Raportet (Reports)
- QR Code per gjurmimin e riparimeve
- Multi-tenant (shume firma ne nje sistem)

## Instalimi - Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

API: http://localhost:8001
Dokumentimi: http://localhost:8001/docs

## Struktura Backend
backend/
  server.py        <- Pika hyrese
  auth.py          <- JWT & bcrypt
  database.py      <- MongoDB
  requirements.txt
  .env             <- Konfigurimi
  routers/
    phonesoftware/
      __init__.py
      auth.py
      repairs.py
      customers.py
      inventory.py
      staff.py
      reports.py
      tenants.py
      public.py
      models.py
      database.py
