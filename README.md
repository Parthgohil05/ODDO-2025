# SkillSwap Platform

This repository contains the full-stack application for SkillSwap, a platform designed to facilitate skill exchange between users. Users can offer their skills, request skills they need, and connect with other users to initiate swap requests.

## Features Built

Thus far, the platform includes the following functionalities:

*   **User Authentication:** Secure user registration and login functionalities.
*   **User Profile Management:** Users can manage their profiles, including adding skills they offer, skills they want, a personal bio, contact information, and location.
*   **Skill Offering and Requesting:** Users can post skills they are willing to teach or tasks they need assistance with.
*   **Swap Request Management:** Functionality to send and manage swap requests between users, including updating request statuses (e.g., "Connected," "Requested").
*   **Real-time Notifications:** A system for users to receive notifications for new swap requests.
*   **Responsive User Interface:** A user-friendly interface built with React, Vite, TypeScript, and Shadcn/UI, designed to be responsive across various devices. The UI incorporates a custom "royal" theme for a distinctive aesthetic.
*   **Database Management:** Utilizes MongoDB for efficient and scalable data storage.

## Technologies Used

*   **Backend:** Node.js, Express.js, Mongoose
*   **Frontend:** React, Vite, TypeScript, Shadcn/UI, Tailwind CSS, React Query (Tanstack Query), Axios
*   **Database:** MongoDB

## Getting Started

Follow these steps to set up and run the SkillSwap platform on your local machine.

### Prerequisites

*   Node.js (LTS version recommended)
*   MongoDB (Community Server or MongoDB Atlas)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:** In the `backend` directory, create a file named `.env` and add your MongoDB connection URI. Replace `your_database_name` with your actual database name.
    ```
    MONGODB_URI=mongodb://localhost:27017/parthdb
    JWT_SECRET=your_jwt_secret_key
    ```
    *Note: For `JWT_SECRET`, choose a strong, random string.*
4.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The backend server will start on `http://localhost:5000` (or the port you configured).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend application will typically open in your browser at `http://localhost:5173` (or a similar port).

## Usage

Once both the backend and frontend servers are running:

1.  **Register a new user** or **log in** with existing credentials.
2.  **Update your profile** to add skills you offer and skills you are looking for.
3.  **Explore** offered skills on the homepage.
4.  **Connect** with other users by sending swap requests.
5.  **Check notifications** for incoming requests.
