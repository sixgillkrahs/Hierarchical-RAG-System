# FastAPI Backend

Backend FastAPI da duoc to chuc lai theo cau truc chuyen nghiep de de mo rong.

## Cau truc thu muc

```text
app/
  api/
    routes/
  core/
  dependencies/
  schemas/
  services/
  main.py
```

Y nghia:

- `api/routes`: dinh nghia endpoint
- `core`: config va app-level setup
- `dependencies`: dependency injection cho route
- `schemas`: request/response model
- `services`: business logic va tich hop MinIO

## Cai dat

```powershell
python -m pip install -r requirements.txt
```

## Cau hinh MinIO

Tao file `.env` dua tren `.env.example`:

```powershell
Copy-Item .env.example .env
```

Mac dinh backend doc cac bien moi truong sau:

- `APP_NAME`
- `APP_VERSION`
- `APP_DESCRIPTION`
- `APP_HOST`
- `APP_PORT`
- `APP_RELOAD`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_SECURE`
- `MINIO_PUBLIC_BASE_URL`

Neu chua co MinIO local, co the chay nhanh bang Docker:

```powershell
docker compose -f docker-compose.minio.yml up -d
```

Console MinIO:

- `http://127.0.0.1:9001`
- user: `minioadmin`
- password: `minioadmin`

## Chay server

```powershell
python -m app.main
```

Hoac:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoint mau

- `GET /`
- `GET /health`
- `GET /folders`
- `POST /files/upload`
- `POST /folders`
- `PATCH /folders`
- `DELETE /folders`

## Upload file

Upload bang Swagger tai `http://127.0.0.1:8000/docs` hoac dung curl:

```powershell
curl -X POST "http://127.0.0.1:8000/files/upload" `
  -H "accept: application/json" `
  -H "Content-Type: multipart/form-data" `
  -F "file=@duong-dan-toi-file"
```

## Tao prefix gia lap folder

MinIO khong co folder vat ly nhu tren PC. API nay tao mot object rong voi suffix `/`
de MinIO hien thi nhu mot folder trong console.

```powershell
curl -X POST "http://127.0.0.1:8000/folders" `
  -H "accept: application/json" `
  -H "Content-Type: application/json" `
  -d "{\"folder_path\":\"documents/contracts/2026\"}"
```

API nay chap nhan ca duong dan kieu Windows, vi du `users\\001\\avatars`, va se
tu dong chuan hoa thanh prefix `users/001/avatars/`.

## Lay danh sach folder theo vi tri hien tai

Lay cac folder con truc tiep cua `current_path`. Neu bo trong `current_path` thi se
liet ke folder o root.

```powershell
curl -X GET "http://127.0.0.1:8000/folders?current_path=documents/contracts" `
  -H "accept: application/json"
```

Response mau:

```json
{
  "current_path": "documents/contracts",
  "bucket": "uploads",
  "folders": [
    {
      "name": "2025",
      "path": "documents/contracts/2025",
      "prefix": "documents/contracts/2025/"
    },
    {
      "name": "2026",
      "path": "documents/contracts/2026",
      "prefix": "documents/contracts/2026/"
    }
  ]
}
```

## Doi ten folder

API nay se copy toan bo object tu prefix cu sang prefix moi, sau do xoa prefix cu.

```powershell
curl -X PATCH "http://127.0.0.1:8000/folders" `
  -H "accept: application/json" `
  -H "Content-Type: application/json" `
  -d "{\"current_path\":\"documents/contracts/2026\",\"new_path\":\"documents/contracts/2027\"}"
```

## Xoa folder

API nay xoa de quy tat ca object nam trong prefix folder.

```powershell
curl -X DELETE "http://127.0.0.1:8000/folders" `
  -H "accept: application/json" `
  -H "Content-Type: application/json" `
  -d "{\"folder_path\":\"documents/contracts/2026\"}"
```
