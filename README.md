# Barbershop Hub API

[![Status](https://img.shields.io/badge/status-in__development-orange.svg)]()
[![.NET Version](https://img.shields.io/badge/.NET-10.0-blue.svg)](https://dotnet.microsoft.com/)

**Barbershop Hub API** is a robust backend solution designed to centralize and manage a comprehensive barbershop ecosystem. It bridges the gap between clients and multiple partner establishments, allowing users to discover barbershops and book appointments dynamically based on the real-time availability of individual professionals.

## ✨ Key Features
- **Centralized Hub:** Manages multiple partner barbershops within a single platform.
- **Dynamic Real-Time Scheduling:** Queries and books time slots based on live availability data per barber, preventing double-bookings.
- **Relational Data Modeling:** Optimized SQL Server schema to map complex relationships between barbershops, services, barbers, schedules, and clients.
- **Efficient RESTful Routing:** Well-structured API endpoints designed for clean consumption by any frontend or mobile application.

## 🛠️ Tech Stack
- **Framework:** .NET 10 Web API
- **Language:** C#
- **Database:** Microsoft SQL Server
- **ORM:** Entity Framework Core (EF Core)

## 🗄️ Database Model Insights
The relational database focuses heavily on temporal scheduling logic:
- `Barbershops` 1 ── N `Barbers`
- `Barbers` 1 ── N `Schedules/Availability`
- `Appointments` linking `Clients`, `Barbers`, and specific `Services`.

## 🚀 Getting Started (Local Development)

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/barbershop-hub-api.git](https://github.com/your-username/barbershop-hub-api.git)
   cd barbershop-hub-api
