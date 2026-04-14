# ArenaPulse (VenueFlow Cricket Experience System)

ArenaPulse is a comprehensive, microservices-based full-stack application designed to enhance the live stadium experience for cricket fans. It delivers real-time match updates, crowd analytics, user engagement features, and seamless notifications.

## 🚀 Technologies Used

### Frontend
- **React 18** & **Vite**: For a fast, modern frontend development experience.
- **Material UI (@mui)** & **Emotion**: For designing a robust and responsive UI.
- **Framer Motion**: For dynamic UI micro-animations and transitions.
- **Socket.io-client**: For establishing real-time WebSocket connections with the backend.

### Backend Structure
- **API Gateway**: Built with Node.js, Express, and `http-proxy-middleware` to route all incoming HTTP requests to their respective microservices.
- **Microservices**: A dedicated set of containerized Node.js services:
  - `user-service`: Manages user authentication and profiles.
  - `crowd-service`: Analyzes venue crowd data and metrics.
  - `match-service`: Handles live cricket match data, scores, and events.
  - `queue-service`: Manages asynchronous task queues.
  - `notification-service`: Broadcasts live updates back to the client natively using WebSockets.

### Infrastructure & Databases
- **MongoDB**: Primary NoSQL database for persistent data storage.
- **Redis**: In-memory data store for state-management, caching, and accelerating real-time operations.
- **Apache Kafka & Zookeeper**: Distributed event streaming platform used to reliably decouple communication and transfer high-throughput data between microservices.
- **Docker & Docker Compose**: Used collectively to containerize and orchestrate the entire development environment securely.

## 📂 Project Structure

```text
ArenaPulse/
├── client/                 # React + Vite Frontend
├── gateway/                # Express API Gateway orchestrating traffic
├── services/               # Core backend microservices
│   ├── crowd-service/
│   ├── match-service/
│   ├── notification-service/
│   ├── queue-service/
│   └── user-service/
├── shared/                 # Shared utilities (e.g., Kafka connect logic)
├── infra/                  # Infrastructure configurations
├── tests/                  # Centralized test directory
├── docker-compose.yml      # Container orchestration
└── package.json            # Global scripts and dependencies
```

## 🛠️ Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker & Docker Compose](https://www.docker.com/)

### Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd ArenaPulse
   ```

2. **Environment Variables**:
   Copy the example environment configuration into a `.env` file at the root.
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies** (Root, Client, and Gateway):
   ```bash
   npm install
   cd client && npm install
   cd ../gateway && npm install
   # Depending on your workflow, you may want to install dependencies inside each service folder as well.
   ```

4. **Spin up the Infrastructure**:
   Start up all the services, databases, and message brokers via Docker Compose.
   ```bash
   docker-compose up -d
   ```

### ⚓ Container Port Mapping Reference
- **API Gateway**: `8080`
- **Frontend Client**: `3000`
- **Notification Service (WebSockets)**: `5000`
- **MongoDB**: `27018`
- **Redis**: `6379`
- **Kafka**: `9092`
- **Zookeeper**: `2181`

## 👨‍💻 Development

When running in development, services default to listening for local code changes.

- **To run the frontend client manually:**
  ```bash
  cd client
  npm run dev
  ```

- **To run a specific service manually (e.g., match-service):**
  ```bash
  cd services/match-service
  npm run dev
  ```
> **Note:** Be aware of `EADDRINUSE` port collision errors on Windows if attempting to run a service locally while its corresponding Docker container is also actively bound to that port.

## 🧪 Testing and Linting

From the root directory you can utilize global commands configured in the `package.json`:

```bash
# Run Jest tests
npm run test

# Run ESLint validation
npm run lint

# Format code with Prettier
npm run format
```
