# SudzLaundry - Mini Order Management System

An AI-first lightweight system for laundry stores to manage daily orders, calculate billing, and track statuses.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. How to Run
Start the development server (runs both Express backend and Vite frontend):
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## Features Implemented

- **POST `/api/orders`**: Create a new order with multiple garments. Automatically calculates the total bill and generates a unique ID (`ORD-{timestamp}`).
- **PATCH `/api/orders/:id/status`**: Updates order status with validation (`RECEIVED` -> `PROCESSING` -> `READY` -> `DELIVERED`).
- **GET `/api/orders`**: Lists all orders with real-time filtering by status or search (customer name/phone).
- **GET `/api/dashboard`**: Provides aggregate statistics for total orders, total revenue, and order distribution per status.
- **Frontend Dashboard**: A clean, responsive React interface built with Tailwind CSS and Framer Motion for interactive management.

---

## AI Usage Report

### 1. AI Tools Used
- **Google AI Studio (Gemini 2.0 Flash)**: Used for architecture design, boilerplate scaffolding, and logic refinement.

### 2. Sample Prompts
- *"Generate a complete and clean backend project for a Mini Laundry Order Management System..."*
- *"Implement an Express server with endpoints for creating orders, updating status, and a dashboard summary."*
- *"Build a React dashboard using Tailwind CSS and Lucide icons that integrates with these Express endpoints."*

### 3. What AI Got Wrong or Lacked
- **Initial Logic**: The first iterations lacked robust state management for the garment items in the frontend form.
- **Error Handling**: Standard AI outputs often omit comprehensive check-constraints for enum statuses (e.g., preventing invalid status strings via API).
- **ID Collisions**: Simple `Math.random()` IDs were initially suggested; I improved this to `ORD-{timestamp}` for better readability and uniqueness in this scale.

### 4. Improvements & Refinements
- **Type Safety**: Manually added TypeScript interfaces for both Frontend and Backend to ensure data consistency.
- **UI/UX**: Added `motion/react` for smooth layout transitions and status color-coding.
- **Validation**: Added validation middleware/logic in the PATCH endpoint to ensure only valid statuses are accepted.

### 5. Tradeoffs
- **In-Memory Storage**: Used for speed and compliance with "Mini" requirements. In a production scenario, this would be replaced with MongoDB or PostgreSQL.
- **Authentication**: Skipped to focus on the core order workflow as per the MVP requirement.
- **State Handling**: Used simple `useEffect` hooks rather than a state manager like Redux for simplicity.

### 6. Future Enhancements
- **Persistence**: Add a database layer (MongoDB).
- **Authentication**: Role-based access (Admin vs. Staff).
- **Printable Invoices**: Export orders as PDF for customers.
- **Notifications**: SMS/WhatsApp integration when order is 'READY'.
