# 🐝 Smart Beehive Monitoring and Decision-Support System

## Overview

The Smart Beehive Monitoring and Decision-Support System is an AI-powered cloud platform designed to improve modern beekeeping through real-time monitoring, predictive analytics, queen presence detection, and intelligent decision support.

The system integrates IoT sensors, cloud computing, machine learning, deep learning, audio analytics, and web technologies to provide continuous hive monitoring and proactive recommendations for beekeepers.

This research was developed as a final-year undergraduate project at the Sri Lanka Institute of Information Technology (SLIIT).

---

## Live Demonstrations

### Monitoring Dashboard

🔗 https://your-monitoring-dashboard.vercel.app

### Research Information Website

🔗 https://your-research-website.vercel.app

---

## Key Features

### Real-Time Hive Monitoring

* Live temperature monitoring
* Live humidity monitoring
* Sound activity monitoring
* Vibration/activity monitoring
* Battery and power monitoring
* Firebase real-time synchronization

### Hive Health Prediction

* Hive health percentage prediction
* Colony condition classification
* Environmental risk assessment
* Activity level prediction

### Swarming Risk Prediction

* Swarming probability estimation
* Risk percentage generation
* Early warning alerts

### Queen Presence Detection

* Audio-based queen detection
* Live microphone analysis
* Uploaded audio analysis
* Confidence score generation

### LSTM-Based Forecasting

* Future hive health prediction
* Temperature forecasting
* Humidity forecasting
* Early risk detection

### Decision Support System

* Automated recommendations
* Swarming prevention suggestions
* Hive management guidance
* Environmental adjustment recommendations

### AI Chatbot Assistant

* Hive condition explanations
* Alert interpretation
* Beekeeping guidance
* Interactive support

### Cloud Dashboard

* Real-time data visualization
* Interactive charts and graphs
* Prediction cards
* Alert notifications
* Responsive user interface

---

# System Architecture

```text
IoT Sensors
      │
      ▼
ESP32 Controller
      │
      ▼
Firebase Realtime Database
      │
      ▼
Data Preprocessing
      │
      ├── Hive Health Prediction
      ├── Swarming Risk Prediction
      ├── LSTM Forecasting
      └── Queen Presence Detection
                    │
                    ▼
          Decision Support Engine
                    │
                    ▼
             AI Chatbot
                    │
                    ▼
            React Dashboard
                    │
                    ▼
            Vercel Deployment
                    │
                    ▼
               Beekeeper
```

---

## Screenshots

### System Architecture

![Architecture](images/architecture/system-architecture.png)

### Dashboard

![Dashboard](images/dashboard/dashboard-home.png)

### Hive Health Prediction

![Prediction](images/dashboard/hive-health.png)

### Queen Detection

![Queen Detection](images/queen-detection/queen-detection.png)

### Firebase Realtime Database

![Firebase](images/firebase/firebase-data.png)

---

## Technology Stack

### Hardware

* ESP32
* DHT22 Temperature and Humidity Sensor
* Sound Sensor
* Vibration Sensor
* Power Monitoring Module

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Flask
* Node.js
* Express.js

### Cloud Services

* Firebase Realtime Database
* Vercel

### Machine Learning

* Python
* Scikit-Learn
* TensorFlow
* Keras
* Random Forest
* LSTM

### Audio Processing

* Librosa
* NumPy
* Pandas

### Development Tools

* Visual Studio Code
* Google Colab
* GitHub

---

## Machine Learning Models

### Hive Health Prediction

Algorithm: Random Forest

Input Features:

* Temperature
* Humidity
* Sound Activity
* Vibration Activity

Output:

* Hive Health Percentage
* Hive Condition Status

### Swarming Risk Prediction

Algorithm: Random Forest

Output:

* Swarming Risk Percentage
* Risk Category

### Queen Presence Detection

Audio Classes:

* Queen Present
* Queen Missing
* Noise / No Bee

Audio Features:

* MFCC
* Chroma Features
* Spectral Centroid
* RMS Energy

### Hive Forecasting

Algorithm: LSTM

Forecasts:

* Future Hive Health
* Future Temperature
* Future Humidity
* Future Activity Trends

---

## System Workflow

1. Sensors collect hive environmental data.
2. ESP32 transmits data to Firebase.
3. Data preprocessing prepares sensor values.
4. Machine learning models generate predictions.
5. LSTM forecasts future hive conditions.
6. Audio models detect queen presence.
7. Decision support engine generates recommendations.
8. Chatbot explains alerts and recommendations.
9. Dashboard visualizes all outputs.
10. Users access the platform through a deployed web application.

---

## Evaluation Results

| Component                | Accuracy |
| ------------------------ | -------- |
| Hive Health Prediction   | 86%      |
| Swarming Risk Prediction | 84%      |
| Activity Classification  | 88%      |
| Queen Presence Detection | 85%+     |

### Forecasting Metrics

* MAE (Mean Absolute Error)
* RMSE (Root Mean Square Error)
* Trend Similarity Analysis

---

## Project Structure

```text
Smart-Beehive-Monitoring-and-Decision-Support-System
│
├── README.md
├── LICENSE
│
├── frontend
│
├── backend
│
├── ml-models
│   ├── hive-health
│   ├── swarming-risk
│   ├── lstm-forecasting
│   └── queen-detection
│
├── datasets
│
├── docs
│   ├── Proposal.pdf
│   ├── Final_Report.pdf
│   └── Presentation.pdf
│
├── deployment
│   └── vercel
│
└── images
    ├── architecture
    ├── dashboard
    ├── firebase
    └── queen-detection
```

---

## Research Contributions

* Smart IoT-based hive monitoring
* AI-powered hive health prediction
* Swarming risk forecasting
* Audio-based queen detection
* LSTM-based predictive analytics
* Intelligent decision support
* AI chatbot integration
* Cloud-based dashboard deployment

---

## Research Team

### Project ID: 25-26J-013

| Member                     | Student ID | Responsibility                     |
| -------------------------- | ---------- | ---------------------------------- |
| N. M. Hewage               | IT22084286 | Cloud Analytics & Decision Support |
| K. J. L. Fernando          | IT22284648 | IoT Environmental Sensing          |
| K. V. P. Weerasinghe       | IT22160348 | Hive Activity Estimation           |
| H. P. M. S. S. Dissanayake | IT22315946 | Audio Analytics & Queen Detection  |

---

## Supervisor

Mr. Dinith Primal

## Co-Supervisor

Mr. Hanojhan Rajahrajasingh

## External Supervisor

Mr. Dhanushka Balasingham

---

## Institution

Sri Lanka Institute of Information Technology (SLIIT)

BSc (Hons) Information Technology

Specialization in Computer Systems and Network Engineering (CSNE)

---

## License

This project is developed for academic and research purposes.
