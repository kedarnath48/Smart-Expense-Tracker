# Smart Expense Tracker

A full-stack expense tracking application built with Spring Boot backend and vanilla JavaScript frontend, featuring comprehensive expense management capabilities.

## Features

- **Backend (Spring Boot 3.3.0)**
  - Java 17
  - Maven build system
  - Spring Web (REST APIs)
  - Spring Data JPA (Database operations)
  - H2 Database (In-memory for development)
  - Spring Boot DevTools (Hot reload)
  - Jackson JSON processing with LocalDate support

- **Frontend**
  - Vanilla JavaScript
  - Responsive HTML/CSS design
  - Real-time expense tracking

- **Expense Management**
  - Add new expenses with category, amount, description, and date
  - View all expenses in a formatted list
  - Delete expenses with confirmation
  - Real-time total calculation
  - Date validation and formatting

## Getting Started

### Prerequisites

- Java 17 or later
- Maven 3.6+ (or use the Maven wrapper included)

### Running the Application

1. **Backend (Spring Boot):**
   ```bash
   mvn spring-boot:run
   ```

2. **Using Maven Wrapper (Windows):**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. **Using VS Code:**
   - Open the project in VS Code
   - Use Ctrl+Shift+P and search for "Spring Boot: Run"
   - Or use the Spring Boot Dashboard extension

4. **Frontend:**
   - Open `Frontend/index.html` in your web browser
   - Or use VS Code's Live Server extension for better development experience

### Testing the Application

Once the backend is running, you can access:

- **Frontend Interface:** `Frontend/index.html` (open in browser)
- **API Base URL:** http://localhost:8081/api/expenses
- **H2 Database Console:** http://localhost:8081/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: `password`

### API Endpoints

- **GET** `/api/expenses` - Get all expenses
- **POST** `/api/expenses` - Create a new expense
- **GET** `/api/expenses/{id}` - Get expense by ID
- **PUT** `/api/expenses/{id}` - Update existing expense
- **DELETE** `/api/expenses/{id}` - Delete expense
- **GET** `/api/expenses/category/{category}` - Get expenses by category
- **GET** `/api/expenses/total` - Get total expenses amount
- **GET** `/api/expenses/count` - Get total expense count

