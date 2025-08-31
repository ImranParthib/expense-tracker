# 💰 Personal Expense Tracker

A full-stack expense tracking application built with **React frontend**, **Flask backend**, and **PostgreSQL database**, all containerized with Docker.

## 🚀 Features

- ✅ **Category Management**: Create and manage expense categories
- ✅ **Expense Tracking**: Add, view, and categorize expenses
- ✅ **Beautiful UI**: Modern React frontend with Bootstrap styling
- ✅ **Real-time Data**: Live updates between frontend and backend
- ✅ **Containerized**: Easy deployment with Docker Compose
- ✅ **API-First**: RESTful API backend that can be used independently

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Flask API     │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   (Port 5432)   │
│   Frontend      │    │   Backend       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern UI library
- **React Bootstrap** - Responsive UI components
- **Axios** - HTTP client for API calls
- **Bootstrap 5** - Styling framework

### Backend

- **Flask** - Python web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Cross-origin resource sharing
- **PostgreSQL** - Relational database

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Ports 3000, 5000, and 5432 available

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd expense-tracker
   ```

2. **Start all services**

   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Database**: localhost:5432

### First Time Setup

1. **Open the React app** at http://localhost:3000
2. **Add categories** (e.g., Food, Transport, Entertainment)
3. **Start adding expenses** with amounts, descriptions, and dates

## 📊 API Endpoints

### Categories

- `GET /categories` - List all categories
- `POST /categories` - Create new category
  ```json
  {
    "name": "Food"
  }
  ```

### Expenses

- `GET /expenses` - List all expenses
- `POST /expenses` - Create new expense
  ```json
  {
    "amount": 25.5,
    "description": "Lunch at restaurant",
    "date": "2025-09-01",
    "category_id": 1
  }
  ```

## 🧪 Testing the API

### Test Categories

```bash
# Get all categories
curl http://localhost:5000/categories

# Create a category
curl -X POST http://localhost:5000/categories
  -H "Content-Type: application/json"
  -d '{"name": "Food"}'
```

### Test Expenses

```bash
# Get all expenses
curl http://localhost:5000/expenses

# Create an expense
curl -X POST http://localhost:5000/expenses
  -H "Content-Type: application/json"
  -d '{
    "amount": 15.99,
    "description": "Coffee and breakfast",
    "date": "2025-09-01",
    "category_id": 1
  }'
```

## 🔧 Development

### Project Structure

```
expense-tracker/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   └── App.js          # Main app component
│   ├── package.json
│   └── Dockerfile
├── app/                     # Flask backend
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── docker-compose.yml      # Multi-service configuration
└── README.md
```

### Running in Development Mode

**Backend only:**

```bash
cd app
pip install -r requirements.txt
python app.py
```

**Frontend only:**

```bash
cd frontend
npm install
npm start
```

**Database only:**

```bash
docker run -d
  -e POSTGRES_USER=postgres
  -e POSTGRES_PASSWORD=postgres
  -e POSTGRES_DB=expense_tracker
  -p 5432:5432
  postgres:13
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View running containers
docker-compose ps
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :5000
   ```

2. **Database connection issues**

   ```bash
   # Check if PostgreSQL container is running
   docker-compose logs db
   ```

3. **Frontend can't connect to backend**
   - Ensure CORS is enabled in Flask
   - Check if backend is running on port 5000
   - Verify API URLs in frontend code

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -f

# Rebuild and start fresh
docker-compose up --build
```

## 🎯 Next Steps

- [ ] Add expense editing and deletion
- [ ] Implement expense filtering and search
- [ ] Add data visualization (charts/graphs)
- [ ] User authentication and authorization
- [ ] Export data to CSV/PDF
- [ ] Mobile-responsive improvements
- [ ] Date range filtering
- [ ] Monthly/yearly expense summaries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy expense tracking! 💸**

## Software Development Life Cycle (SDLC) — Personal Expense Tracker

### 1. Requirements

- Users can add, edit, and delete expenses.
- Categorize expenses (food, transport, etc.).
- View expenses by day, week, month.
- Visualize spending with charts.
- User authentication (optional for privacy).
- Export data (CSV, PDF).

### 2. Design

- Architecture: Flask backend API, database for expenses and categories, frontend for UI and charts.
- Components: Flask (API), database (SQLite/PostgreSQL), frontend (HTML/JS or React), chart library (Chart.js).
- Endpoints: CRUD for expenses and categories, user authentication, export data.
- Project structure: Separate folders for backend and frontend code.

### 3. Implementation

- Build Flask API for expenses, categories, and users.
- Set up database models and migrations.
- Create frontend for data entry, visualization, and export.
- Integrate chart library for spending visualization.
- Add authentication and export features.

### 4. Testing

- Manual and automated testing of API endpoints and frontend UI.
- Validate data, handle errors, and test edge cases.

### 5. Deployment

- Containerize backend and frontend with Docker.
- Use Docker Compose for multi-service orchestration.
- Provide setup and deployment instructions in README.

### 6. Maintenance

- Update dependencies and improve features.
- Monitor for bugs and fix issues.
- Add new functionality based on user feedback.

## Features

- Add, edit, and delete expenses
- Categorize expenses (food, transport, etc.)
- View expenses by day, week, month
- Visualize spending with charts
- User authentication (optional for privacy)
- Export data (CSV, PDF)
- Dockerized for easy setup and deployment

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flask-touch.git
   cd flask-touch
   ```
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Visit `http://localhost:5000` in your browser. You should see the Expense Tracker app homepage.

### Stopping the Project

```bash
docker-compose down --volumes --remove-orphans
```

## Project Structure

```
expense-tracker/
├── app/
│   ├── app.py
│   └── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the MIT License.
