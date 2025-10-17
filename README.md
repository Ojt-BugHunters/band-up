<div align="center">
  <br />
  <h1>🎓 IELTS Trial Test Platform</h1>
  <p>
    A modern, open-source platform that provides realistic IELTS practice tests with automatic scoring, detailed analytics, and personalized feedback for learners worldwide.
  </p>
</div>


## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### 🧰 Prerequisites

Make sure you have the latest version of:

* **Docker** — [Install Docker](https://www.docker.com/get-started)
* **Docker Compose** — [Install Docker Compose](https://docs.docker.com/compose/install/)

## ⚙️ Installation Guide (Docker Compose Setup)

This guide will help you set up the IELTS Trial Test Platform locally using Docker Compose.

---

### 🧩 Step 1 — Create Environment Files

We use three environment files to separate configuration clearly.

#### **1 `.env` (root-level for Compose)**

Create this file in the root folder:

```.env
# ===============================
# 🌐 Global Configuration
# ===============================

# Docker registry (where your images are stored)
REGISTRY=your-dockerhub-username

# Image tags for backend & frontend
BACKEND_TAG=latest
FRONTEND_TAG=latest

# ===============================
# ⚙️ Ports
# ===============================
# Change these if the ports are already used on your local machine
BACKEND_PORT=8080
FRONTEND_PORT=3000
POSTGRES_PORT=5433
REDIS_PORT=6379

# ===============================
# 🧩 Docker Network & Volumes
# ===============================
NETWORK_NAME=ielts-trial-network

PG_VOL=ielts-postgres
REDIS_VOL=ielts-redis

# ===============================
# 🗃️ Database Configuration
# ===============================
PG_USER=postgres
PG_PASS=postgres
PG_DB=ielts_trial_test

# ===============================
# 🧠 Redis Configuration
# ===============================
REDIS_PASSWORD=

# ===============================
# 🔒 Backend API & CORS
# ===============================
# URL for frontend to call backend API
API_URL=http://backend:${BACKEND_PORT}

# Allowed origin for CORS
CORS_FRONTEND_ORIGIN=http://localhost:${FRONTEND_PORT}

# ===============================
# ☁️ CloudFront or Key Paths (optional)
# ===============================
# Adjust these paths according to your local machine setup.
CLOUDFRONT_PRIVATE_KEY_HOST_PATH=/path/to/your/private_key.pem
CLOUDFRONT_PRIVATE_KEY_CONTAINER_PATH=/run/keys/private_key.pem

```

#### **2 `.env.backend` (in folder backend)**

```.env.backend
# ===============================
# 🌐 Application Configuration
# ===============================
SPRING_APPLICATION_NAME=Band-Up
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# ===============================
# 🔑 JWT Configuration
# ===============================
# Keys used for signing and refreshing tokens
JWT_REFRESHKEY=your-refresh-key-base64
JWT_REFRESHEXPIRATION=2592000000    # 30 days in ms
JWT_ACCESSKEY=your-access-key-base64
JWT_ACCESSEXPIRATION=900000          # 15 minutes in ms

# ===============================
# 🔐 OAuth2 Google Login
# ===============================
# Replace with credentials from Google Cloud Console
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your-google-client-id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your-google-client-secret
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_SCOPE=openid,profile,email

# ===============================
# ☁️ AWS S3 + CloudFront
# ===============================
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket-name
CLOUDFRONT_KEYPAIR_ID=your-cloudfront-keypair-id
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
CLOUDFRONT_PRIVATE_KEY_PATH=/app/private_key.pem

# ===============================
# 💳 VNPay Configuration
# ===============================
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_SECRET=your-vnp-secret-key
VNP_TMNCODE=your-vnp-merchant-code

# ===============================
# 📧 Mail Configuration (SMTP)
# ===============================
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_STARTTLS_ENABLE=true
SPRING_MAIL_USERNAME=your-email@example.com
SPRING_MAIL_PASSWORD=your-app-password

# ===============================
# 🔗 URLs
# ===============================
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

#### **3 `.env.frontend` (in folder frontend)**
```.env.frontend
API_URL=http://localhost:8080/api
```

### 🐳 Step 2 — Pull Docker Images (in root folder)
```
docker compose pull
```
### 🚀 Step 3 — Start the Application
```
docker compose up -d
docker compose ps (for showing container status)
```

### 🌐 Step 4 — Verify URLs
| Service                       | URL                                            | Description                           |
| ----------------------------- | ---------------------------------------------- | ------------------------------------- |
| 🖥️ Frontend                  | [http://localhost:3000](http://localhost:3000) | User interface                        |
| ⚙️ Backend API                | [http://localhost:8080/swagger-ui/index.html]([http://localhost:3000](http://localhost:8080/swagger-ui/index.html)) | REST API                              |





