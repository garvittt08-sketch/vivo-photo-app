# API & WebSocket Protocol Specification

## REST API Endpoints

### 1. Devices
- `GET /api/devices`: List paired devices.
- `POST /api/devices/pair`: Pair phone with server.

### 2. Media Ingestion & Query
- `GET /api/media`: Query media items.
- `GET /api/media/stats`: Returns scanned totals, duplicate counts, and selected best totals.
- `POST /api/media/batch`: Batch ingest metadata from Android MediaStore.

### 3. Duplicate Groups & Selection
- `GET /api/duplicate-groups`: List exact duplicate and similar photo groups.
- `POST /api/duplicate-groups/select-best`: Manually override selected best photo per group.

### 4. Transfers
- `POST /api/transfers/start`: Start/resume chunked transfer session.
- `POST /api/transfers/chunk`: Upload file chunk with headers `X-Session-Id` and `X-Chunk-Offset`.
- `POST /api/transfers/verify`: Finalize SHA-256 integrity verification.

### 5. Settings
- `GET /api/settings`: Retrieve destination folder & settings.
- `PUT /api/settings`: Update destination path (`E:\Vivo Photo`) or organization mode.
