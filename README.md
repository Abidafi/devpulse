# DevPulse - Internal Tech Issue & Feature Tracker

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-24.x-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌐 Live Demo

**API Base URL**: [https://devpulse-api.onrender.com](https://devpulse-api.onrender.com)

## 📋 Project Overview

DevPulse is a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions. It provides a robust API for managing issues with role-based access control, authentication, and comprehensive filtering capabilities.

## ✨ Features

- 🔐 **JWT Authentication** - Secure login and registration
- 👥 **Role-Based Access Control** - Contributor and Maintainer roles
- 🐛 **Issue Management** - Create, read, update, and delete issues
- 🔍 **Advanced Filtering** - Filter by type, status, and sort by date
- 🛡️ **Security** - Password hashing, token validation, SQL injection prevention
- 📊 **Data Validation** - Request validation with express-validator
- 🚀 **Production Ready** - Connection pooling, error handling, CORS enabled

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24.x | Runtime environment |
| TypeScript | 5.3.3 | Type-safe development |
| Express.js | 4.18.2 | Web framework |
| PostgreSQL | Latest | Relational database |
| bcrypt | 5.1.1 | Password hashing |
| jsonwebtoken | 9.0.2 | Authentication |
| pg | 8.11.3 | PostgreSQL driver |

## 📦 Installation

### Prerequisites

- Node.js 24.x or higher
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devpulse.git
   cd devpulse
