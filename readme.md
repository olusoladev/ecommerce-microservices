# E-commerce Microservices

This project is a **NestJS-based microservices architecture** for an e-commerce platform.  
It demonstrates communication between multiple services using **TCP** and **RabbitMQ**, along with MongoDB as the datastore. The system is fully **Dockerized** for local deployment.

---

## 🏗 Architecture Overview

### Services

| Service            | HTTP Port | TCP Port | Responsibilities |
|-------------------|-----------|----------|----------------|
| Customer Service   | 3001      | 4001     | Manage customers, provide validation to Order Service |
| Product Service    | 3002      | 4002     | Manage products, provide validation to Order Service |
| Order Service      | 3003      | 4003     | Handles orders: validates customer & product, calls Payment Service |
| Payment Service    | 3004      | 4004     | Simulates payment, emits payment events to RabbitMQ, manages transaction history |

### Datastore

- **MongoDB Atlas**: stores customers, products, orders, payments, and transaction history  
  Connection string example:  mongodb+srv://sonawap:rvhvcBoOXzp4e7H0@cluster0.nbiuu23.mongodb.net/?appName=Cluster0


### Message Queue

- **RabbitMQ**: asynchronous communication for payment events and transaction logging  
- URL: `amqp://localhost:5672`  
- Queue: `transaction_queue`  

---

## 🔄 Communication Flow

flowchart LR
  A[Customer] -->|HTTP POST /orders| B[Order Service]
  B -->|TCP get_customer| C[Customer Service]
  B -->|TCP get_product| D[Product Service]
  B -->|TCP process_payment| E[Payment Service]
  E -->|Publish payment_completed event| F[RabbitMQ Queue]
  F -->|Worker saves transaction| G[Payment Service DB]
  B -->|HTTP Response| A

## STEPS
1: Customer places an order via HTTP request to Order Service (POST /orders)
2: Order Service validates:
  Customer via TCP call to Customer Service (127.0.0.1:4001)
  Product via TCP call to Product Service (127.0.0.1:4002)
3: Order Service creates an order in MongoDB
4: Order Service calls Payment Service via TCP (127.0.0.1:4004) to simulate payment
5: Payment Service emits payment_completed event to RabbitMQ
6: Worker in Payment Service listens to RabbitMQ and saves transaction history in MongoDB
7: Order Service responds to the customer with order details

💻 Technology Stack
Backend: Node.js + NestJS
Database: MongoDB Atlas
Message Broker: RabbitMQ
Communication: TCP for service-to-service, HTTP for client, RabbitMQ for async events
Containerization: Docker + Docker Compose

Environment Variables
Customer Service .env
PORT=3001  
TCPPORT=4001  
TCPHOST=127.0.0.1  
ENV=development  
MONGO_URI=mongodb+srv://sonawap:rvhvcBoOXzp4e7H0@cluster0.nbiuu23.mongodb.net/?appName=Cluster0  

Product Service .env
PORT=3002  
TCPPORT=4002  
TCPHOST=127.0.0.1  
ENV=development  
MONGO_URI=mongodb+srv://sonawap:rvhvcBoOXzp4e7H0@cluster0.nbiuu23.mongodb.net/?appName=Cluster0  

Order Service .env
PORT=3003  
TCPPORT=4003  
TCPHOST=127.0.0.1  
ENV=development  
MONGO_URI=mongodb+srv://sonawap:rvhvcBoOXzp4e7H0@cluster0.nbiuu23.mongodb.net/?appName=Cluster0  
CUSTOMER_SERVICE_HOST=127.0.0.1  
CUSTOMER_SERVICE_PORT=4001  
PRODUCT_SERVICE_HOST=127.0.0.1  
PRODUCT_SERVICE_PORT=4002  
PAYMENT_SERVICE_HOST=127.0.0.1  
PAYMENT_SERVICE_PORT=4004  

Payment Service .env
PORT=3004  
TCPPORT=4004  
TCPHOST=127.0.0.1  
ENV=development  
FRONTEND_APP_URL=http://localhost:3004  
MONGO_URI=mongodb+srv://sonawap:rvhvcBoOXzp4e7H0@cluster0.nbiuu23.mongodb.net/?appName=Cluster0  
ORDER_SERVICE_HOST=127.0.0.1  
ORDER_SERVICE_PORT=4003  
RABBITMQ_URL=amqp://localhost:5672  
RABBITMQ_QUEUE=transaction_queue  

🚀 Running the Project Locally
Prerequisites  
Docker & Docker Compose installed  
Node.js (optional if running outside Docker)  

Steps
1. Clone the repository
2. Copy .env.example to .env in each service folder and configure if needed
3. Build and start all services using Docker Compose
4. Access services:
Customer Service: http://localhost:3001/health  
Product Service: http://localhost:3002/health  
Order Service: http://localhost:3003/health  
Payment Service: http://localhost:3004/health  
RabbitMQ UI: http://localhost:15672 (guest/guest)  
MongoDB Atlas: use your connection string in each service  

Example Service
🧪 Example API Request
POST http://localhost:3003/orders
Content-Type: application/json
{
  "customerId": "C123",
  "productId": "P456",
}

Response
{
  "data": {
    "customerId": "cust-1",
    "productId": "prod-1",
    "orderId": "ORD-1770112741081",
    "orderStatus": "pending",
    "paymentLink": "http://localhost:3004/pay/ORD-1770112741081"
  },
  "status": 201,
  "message": "Order created successfully"
}

Click on the payment link to simulate payment and payment service will publish the event to rabbitMQ