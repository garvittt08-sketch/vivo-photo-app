# Vivo Smart Photo Cleaner, Best-Photo Selector & Local Wi-Fi Transfer System

Production-quality local application that scans media on a Vivo Android phone, automatically detects exact duplicates (SHA-256) and similar photos (dHash), selects the best photo per group using multi-factor quality scoring (sharpness, exposure, resolution, compression), allows interactive user review, and streams selected photos safely over local Wi-Fi to a Windows laptop (`E:\Vivo Photo`).

> **100% Offline & Non-Destructive**: Zero cloud storage, zero public internet, zero USB cables. Phone photos are **NEVER** automatically deleted.

```text
📱 VIVO PHONE                   💻 WINDOWS PC                    🌐 WEB DASHBOARD
(Kotlin / Compose)         (.NET 10 Web API + Worker)           (React + TS + Vite)
MediaStore Scanner ──Wi-Fi──> Transfer Receiver (SHA-256) ──> Storage: E:\Vivo Photo
```

## Features
- 🔍 **MediaStore Batch Scanner**: Efficiently scans 6,000+ photos/videos without OOM.
- 👯 **Exact Duplicate Engine**: SHA-256 bitwise hash matching for identical content.
- 📸 **Similar Photo Engine**: 64-bit dHash perceptual hashing with configurable similarity thresholds.
- ⭐ **Best Photo Scoring**: Multi-factor scoring model evaluating Laplacian sharpness, exposure histograms, resolution, and compression penalties.
- ⚡ **Chunked Resumable Transfer**: Streaming upload over local Wi-Fi with SHA-256 verification and resume support.
- 🛡️ **Path Traversal Protection**: Sanitized file paths strictly restricted to `E:\Vivo Photo`.
- 📊 **React Web Dashboard**: Modern UI with real-time transfer monitoring, photo browser, duplicate inspector, and settings.

## Project Structure
```text
vivo-photo-manager/
├── android/VivoPhotoApp/      # Native Kotlin Jetpack Compose Android App
├── windows/                   # C# .NET 10 Solution (Core, Infrastructure, Server, Tests)
├── web/dashboard/             # React + TypeScript + Vite + Tailwind CSS Dashboard
├── docs/                      # Architecture, API, Pairing, Protocol & Setup documentation
└── README.md
```

## Getting Started
See [docs/setup.md](file:///c:/Photo%20Sync%20and%20Photo%20Management%20System/docs/setup.md) for full instructions.
