# Resumable Chunked Transfer Protocol & SHA-256 Verification

## Protocol Sequence

```text
📱 Android                               💻 Windows Server
    │                                           │
    ├───── 1. POST /api/transfers/start ───────>│
    │   (mediaItemId, fileName, size, sha256)   │ (Checks .temp session state)
    │<──── Session ID & Transferred Offset ─────┤
    │                                           │
    ├───── 2. POST /api/transfers/chunk ───────>│ (Appends chunk data to .part file)
    │      Header: X-Session-Id                 │
    │      Header: X-Chunk-Offset               │
    │<──── Updated BytesTransferred Status ─────┤
    │                                           │
    │      [ Repeat for remaining chunks ]      │
    │                                           │
    ├───── 3. POST /api/transfers/verify ──────>│ (Computes destination SHA-256)
    │      Header: X-Session-Id                 │ (Compares source vs dest hash)
    │<──── 200 OK (Verified Bitwise Identical) ─┤ (Moves .part to E:\Vivo Photo)
```

## Hash Integrity & Resumability
- **Chunk Size**: 64 KB streaming buffers.
- **Resumability**: If connection drops mid-transfer, re-initiating `/api/transfers/start` returns the existing `.part` file byte offset, allowing upload to resume without re-transferring completed bytes.
- **Atomic Move**: Files are saved with `.part` extension until `/api/transfers/verify` confirms 100% SHA-256 match.
