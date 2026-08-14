# Setup & Build Guide

## Requirements
- **Windows PC**: .NET 10 SDK, Node.js v20+
- **Android Device**: Vivo Phone running Android 8.0+ (API 26+) on same local Wi-Fi.

## 1. Windows Backend (.NET 10)
```bash
cd windows
dotnet restore
dotnet test VivoPhotoManager.slnx
dotnet run --project VivoPhoto.Server
```
*Server starts on `http://0.0.0.0:5000` and listens for UDP discovery probes on port `8888`.*

## 2. React Web Dashboard
```bash
cd web/dashboard
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

## 3. Android Kotlin App
Open `android/VivoPhotoApp` in Android Studio, connect your Vivo device via Wi-Fi or USB debugging, and build/run `app`.
