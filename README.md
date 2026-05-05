# ETHARA - Team Task Manager

Ethara is a powerful, full-stack project management application designed for teams to collaborate on tasks, track progress via a Kanban board, and manage projects efficiently.

![App Screenshot](https://raw.githubusercontent.com/siddharth192002/ETHARA/main/client/public/logo.png) <!-- Replace with actual screenshot link if available -->

## 🚀 Features

- **Project Management**: Create and organize multiple projects.
- **Kanban Board**: Drag-and-drop task management with status tracking (To Do, In Progress, Done).
- **Role-Based Access**: 
  - **Admins**: Full control over projects, tasks, and team members.
  - **Members**: Can view projects and update statuses of assigned tasks.
- **Real-time Stats**: Dashboard with overdue task tracking and project analytics.
- **Secure Authentication**: JWT-based login and registration system.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Axios (API Management)
- CSS3 (Vanilla for styling)
- React Router (Navigation)

**Backend:**
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (Authentication)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siddharth192002/ETHARA.git
   cd ETHARA
   ```

2. **Backend Setup:**
   - Go to the `server` directory.
   - Create a `.env` file and add your credentials:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRE=30d
     ```
   - Install dependencies and start:
     ```bash
     npm install
     npm start
     ```

3. **Frontend Setup:**
   - Go to the `client` directory.
   - Create a `.env` file:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
   - Install dependencies and start:
     ```bash
     npm install
     npm run dev
     ```

## 🌐 Deployment

The project is configured for deployment on **Railway**.

- **Backend**: Set up as a Node.js service pointing to the `server` root.
- **Frontend**: Set up as a Static/Vite service pointing to the `client` root.
- **Environment Variables**: Ensure `VITE_API_URL` points to your production backend URL (ending in `/api`).

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Siddharth](https://github.com/siddharth192002)
