# flask-touch

A simple Hello World project using Flask and Redis, containerized with Docker and orchestrated using Docker Compose.

## Features

- Flask web server
- Redis for counting page views
- Dockerized for easy setup and deployment
- Multi-container orchestration with Docker Compose

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
3. Visit `http://localhost:5000` in your browser. You should see the Hello World message and a page view counter.

### Stopping the Project

```bash
docker-compose down --volumes --remove-orphans
```

## Project Structure

```
flask-touch/
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
