

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**A modern, feature-rich todo application that helps you stay organized with intelligent task management, recurring tasks, and beautiful calendar views.**

[Features](#-features) • [Installation](#-getting-started) • [Usage](#-usage-examples) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 🎯 What Problem Does This Solve?

Traditional todo applications often fall short when it comes to managing complex, recurring tasks and visualizing your schedule. Many apps either lack calendar integration, struggle with timezone handling, or make it cumbersome to set up recurring tasks that adapt to your workflow.

**This application solves these challenges by:**

- **🔄 Intelligent Recurring Tasks**: Automatically generates recurring task instances based on flexible patterns (daily, weekly, monthly, yearly) with custom intervals and end dates. No more manually creating the same task repeatedly.

- **📅 Seamless Calendar Integration**: Visualize your tasks in a beautiful, interactive calendar view that shows your schedule at a glance. Navigate between months effortlessly and see all your tasks organized by date.

- **🌍 Timezone-Aware Architecture**: Built with timezone conventions in mind, ensuring tasks appear at the correct times regardless of where you are or when you created them.

- **🎨 Personalized Experience**: Multiple theme options, customizable task colors, and an intuitive interface that adapts to your preferences.

- **⚡ Real-Time Synchronization**: Fast, responsive UI with optimistic updates and efficient data caching using React Query.

- **🔐 Flexible Authentication**: Support for both traditional password-based authentication and OAuth (Google), giving you the flexibility to choose how you sign in.

---

## ✨ Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and complete tasks with rich metadata
- 📅 **Calendar View**: Interactive monthly calendar with task visualization
- 🔄 **Recurring Tasks**: Set up tasks that automatically repeat (daily, weekly, monthly, yearly) with custom intervals
- 🎯 **Priority Levels**: Organize tasks with high, medium, or low priority
- 🏷️ **Categories**: Categorize tasks for better organization
- 🎨 **Color Coding**: Assign custom colors to tasks for visual organization
- ⏰ **Time Management**: Set specific times for tasks or mark them as all-day events
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Views & Organization
- **Today View**: See all tasks due today in a focused, organized view
- **Upcoming View**: Browse and manage tasks scheduled for future dates
- **Completed View**: Track your completed tasks and maintain a history
- **Calendar View**: Visual calendar representation of all your tasks

### User Experience
- 🌓 **Multiple Themes**: Choose from various color themes including dark, light, and custom options
- 🔍 **Natural Language Date Parsing**: Type dates naturally (e.g., "tomorrow", "next Monday") and the app understands
- ⌨️ **Keyboard Shortcuts**: Navigate efficiently with keyboard shortcuts
- 🎭 **Drag & Drop**: Reorder tasks with intuitive drag-and-drop functionality
- 📊 **Task Details Drawer**: View and edit comprehensive task information in a side drawer

### Technical Features
- 🔐 **Secure Authentication**: Password-based and OAuth (Google) authentication
- 💾 **Session Management**: Redis-backed session storage for scalability
- 🗄️ **PostgreSQL Database**: Robust data persistence with Prisma ORM
- ⚡ **Optimistic Updates**: Instant UI feedback with background synchronization
- 🔄 **Automatic Recurring Task Generation**: Cron jobs automatically create recurring task instances
- 🎯 **Type Safety**: Full TypeScript implementation across frontend and backend

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Redis** (for session storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personalTodoApp.git
   cd personalTodoApp
   ```

2. **Install dependencies for all packages**
   ```bash
   # Install common package dependencies
   cd common
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up the database**
   ```bash
   cd backend
   # Create a .env file (see Environment Variables below)
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/todoapp?schema=public"
   
   # Session & Security
   SESSION_SECRET="your-super-secret-session-key-here"
   REDIS_URL="redis://localhost:6379"
   
   # Server
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   
   # OAuth (Optional - for Google sign-in)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/v1/oauth/google/callback"
   ```

   Create a `.env` file in the `frontend` directory (if needed):
   ```env
   VITE_API_URL="http://localhost:3000"
   ```

5. **Start Redis** (if running locally)
   ```bash
   # macOS (using Homebrew)
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   
   # Or use Docker
   docker run -d -p 6379:6379 redis:latest
   ```

6. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run build
   npm start
   # Or for development with auto-reload, use nodemon or tsx
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# The dist folder contains the production build
# Serve it with your preferred static file server
```

---

## 💡 Usage Examples

### Creating a Task

1. Click the **"+"** button or press the keyboard shortcut
2. Enter the task title and description
3. Select a due date using the date picker or type naturally (e.g., "tomorrow", "next Friday")
4. Optionally set:
   - Priority level (High, Medium, Low)
   - Category
   - Color
   - Specific time (or mark as all-day)
5. Click **"Add Task"**

### Setting Up Recurring Tasks

1. Create a new task as described above
2. Toggle **"Recurring"** switch
3. Select recurrence pattern:
   - **Daily**: Every day, every 2 days, etc.
   - **Weekly**: Every week, every 2 weeks, etc.
   - **Monthly**: Every month, every 3 months, etc.
   - **Yearly**: Every year
4. Set an interval (e.g., every 2 weeks)
5. Optionally set an end date for the recurrence
6. Save the task

The system will automatically create new instances of the task based on the pattern you've set.

### Using Calendar View

1. Navigate to **Calendar View** from the sidebar
2. Use the arrow buttons or month/year picker to navigate between months
3. Click on any date to see tasks for that day
4. Click on a task to view details or edit
5. Tasks are color-coded based on your custom colors

### Keyboard Shortcuts

- `M` - Toggle sidebar
- `+` or `N` - Create new task
- `Esc` - Close modals/drawers

### Natural Language Date Examples

The app understands various date formats:
- "tomorrow"
- "next Monday"
- "in 3 days"
- "next week"
- "December 25"
- "2024-12-31"

---

## 🏗️ Architecture

This application follows a **monorepo structure** with three main packages:

```
personalTodoApp/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Express + TypeScript + Prisma
└── common/            # Shared types and utilities
```

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for data fetching and caching
- React Router for navigation
- Radix UI components
- Lucide React for icons

**Backend:**
- Express.js with TypeScript
- Prisma ORM for database management
- PostgreSQL for data persistence
- Redis for session storage
- Node-cron for recurring task automation
- Google OAuth for authentication

**Shared:**
- Zod for schema validation
- Custom type definitions in `@shiva200701/todotypes`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the code style guidelines below
4. **Test your changes** thoroughly
5. **Commit your changes**: `git commit -m 'Add some amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description of your changes

### Code Style Guidelines

- **TypeScript**: Use TypeScript for all new code. Avoid `any` types when possible.
- **Formatting**: Follow the existing code style. The project uses ESLint for linting.
- **Components**: Use functional components with hooks. Keep components focused and reusable.
- **Naming**: Use descriptive names for variables, functions, and components.
- **Comments**: Add comments for complex logic, but prefer self-documenting code.
- **Commits**: Write clear, descriptive commit messages.

### Areas for Contribution

- 🐛 **Bug Fixes**: Report or fix bugs you encounter
- ✨ **New Features**: Implement features from the [Todo.md](./Todo.md) roadmap
- 📝 **Documentation**: Improve documentation, add examples, or fix typos
- 🎨 **UI/UX Improvements**: Enhance the user interface and experience
- ⚡ **Performance**: Optimize queries, reduce bundle size, or improve load times
- 🧪 **Testing**: Add unit tests, integration tests, or E2E tests

### Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser)

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if you've changed functionality
3. Add tests if applicable
4. Ensure all tests pass
5. Request review from maintainers

---

## 📄 License

This project is licensed under the **ISC License**.

See the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/personalTodoApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/personalTodoApp/discussions)

### Getting Help

- Check the [Issues](https://github.com/yourusername/personalTodoApp/issues) page for common problems
- Search existing discussions for similar questions
- Open a new issue for bugs or feature requests
- Start a discussion for questions or ideas

---

## 🙏 Acknowledgements

### Technologies & Libraries

- **[React](https://react.dev/)** - UI library
- **[Express.js](https://expressjs.com/)** - Web framework
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Database
- **[Redis](https://redis.io/)** - Session storage
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[React Query](https://tanstack.com/query)** - Data synchronization
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Zod](https://zod.dev/)** - Schema validation
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[date-fns](https://date-fns.org/)** - Date utility library

### Inspiration

This project was inspired by the need for a todo application that combines the best features of calendar apps and task managers, with a focus on recurring tasks and timezone awareness.

---

## 📈 Roadmap

See [Todo.md](./Todo.md) for planned features and improvements.

### Upcoming Features
- 🔍 Search & Filter functionality
- 🏷️ Multiple tags per task
- 🔔 Browser notifications for due tasks
- 📦 Bulk operations (select multiple tasks)
- 📝 Rich text editor for descriptions
- ✅ Subtasks support
- ⏰ Overdue tasks section with rescheduling
- 📤 Export/Import functionality

---

<div align="center">

**Made with ❤️ by Shiva raghav Rajasekar**

⭐ Star this repo if you find it helpful!

</div>
