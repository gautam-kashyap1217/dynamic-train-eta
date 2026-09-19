# 🚆 RailZen

### AI-Powered Dynamic Train ETA Prediction & Railway Congestion Monitoring

RailZen is an AI-powered railway intelligence platform designed to provide
dynamic train ETA predictions by considering real-time train movement,
current delay, speed, distance, historical delay patterns, railway network
features, congestion and weather conditions.

## 🚀 Features

- Dynamic train ETA prediction
- Live train status
- AI/ML-based ETA prediction
- Confidence monitoring
- P10 / P50 / P90 ETA ranges
- Railway route visualization
- Congestion monitoring
- Weather-aware prediction
- Station-wise ETA
- Interactive railway map

## 🧠 Technology Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Leaflet

### Backend
- Python
- FastAPI
- NetworkX
- SQLite

### Machine Learning
- LightGBM / XGBoost
- Scikit-learn
- Joblib

## 🏗️ Architecture

Frontend → FastAPI Backend → Feature Pipeline → ML Model → ETA Prediction

## ▶️ Running Locally

### Backend

```bash
cd backend

python -m venv .venv