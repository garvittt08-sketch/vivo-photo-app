# System Architecture & Security Model

## Overview
The **Vivo Smart Photo Cleaner & Local Wi-Fi Transfer System** is an offline, peer-to-peer media analysis and transfer solution connecting a Vivo Android device to a local Windows PC.

```text
                    SAME LOCAL Wi-Fi NETWORK
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
        📱 VIVO PHONE                      💻 WINDOWS PC
  (Kotlin + Jetpack Compose)           (.NET 10 ASP.NET Core)
  ├── MediaStore Scanner               ├── ASP.NET Core Web API / WebSockets
  ├── Local Hash Cache                 ├── EF Core + SQLite Database
  ├── UDP Discovery Client             ├── Local UDP Discovery Listener (8888)
  ├── Chunked Transfer Client          ├── Chunked Resumable Receiver
  └── Selection Review UI              ├── SHA-256 & dHash Similarity Engine
                                       ├── Best Photo Scoring Engine
                                       └── Storage Manager (E:\Vivo Photo)
                                                 │
                                                 ▼
                                        🌐 REACT WEB DASHBOARD
                                        (Vite + React + TS + Tailwind)
```

## Security & Non-Destructive Principles
1. **Local Wi-Fi Only**: Zero public internet dependencies, zero cloud storage, zero telemetry.
2. **Strict Non-Destruction**: Original media files on the Vivo device are **never deleted**.
3. **Path Traversal Prevention**: Filenames are sanitized and restricted to `E:\Vivo Photo`.
4. **Hash Verification**: Transfers are only finalized after bitwise SHA-256 checksum verification.
