<div align="center">

# 🌿 TripTribe

### Your Ultimate Tour Management Companion

A modern, dark-themed platform for groups to create private tours, track shared expenses, share locations, and manage travel documents effortlessly.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://tour-management-system-lovat.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**🚀 [Live Demo](https://tour-management-system-lovat.vercel.app/)**

</div>

---

## ✨ Features

### 🔐 Authentication
- Secure signup with profile picture upload
- Contact information management
- JWT-based authentication
- Profile customization

### 🌍 Tour Management
- Create private tours with cover images
- Join tours via unique invitation codes
- Comprehensive tour dashboard
- Multi-tab interface (Overview, Expenses, Members, Map, Documents, Settlements)

### 💰 Expense Tracking
- **Equal Split** - Everyone shares equally
- **Unequal Split** - Custom amounts per member
- Automatic balance calculation
- Smart settlement plan (who owes whom)
- Visual expense breakdown
- Real-time notifications for new expenses

### 📍 Location Sharing
- Optional real-time location sharing
- Interactive map with member locations
- Toggle location sharing on/off
- Privacy-focused (only tour members can see)

### 📄 Document Management
- Upload tickets, reservations, passports
- Share PDFs and images
- Emergency contact storage
- Secure document download

### 🔔 Smart Notifications
- Expense added alerts
- Document upload notifications
- Member join/leave updates
- Settlement confirmations
- Unread count badge

### 💳 Payment Settlements
- Create settlement requests
- Confirm payment receipts
- Track pending/completed status
- Integration with balance calculations

### 🌤️ Weather Integration
- Real-time weather for destination
- 5-day forecast
- Current conditions display

### 📱 PWA Support
- Install as mobile app
- Offline access
- Add to home screen
- Native app experience

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Framer Motion |
| **Database** | MongoDB + Mongoose |
| **Authentication** | NextAuth.js |
| **Maps** | Leaflet + React-Leaflet |
| **Icons** | React Icons |
| **Notifications** | React Hot Toast |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/AdnanCS58/tour-management-system.git

# Navigate to project
cd tour-management-system

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
