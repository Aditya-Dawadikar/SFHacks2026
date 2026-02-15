# EVBnB Frontend

Frontend application for EVBnB - an EV charging station rental platform.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Material UI (MUI)** for UI components
- **React Router** for navigation

## Prerequisites

- Node.js (v18 or higher)

## Installation

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend/EVBnB
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development mode:
```bash
npm run dev
```

This starts the development server with hot module replacement. The app will be available at `http://localhost:5173`.

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Lint the codebase:
```bash
npm run lint
```

## Project Structure

```
Frontend/EVBnB/
├── index.html            # HTML entry point
├── package.json
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint configuration
├── public/               # Static assets
└── src/
    ├── main.tsx          # Application entry point
    ├── App.tsx           # Root component
    ├── App.css           # App styles
    ├── index.css         # Global styles
    ├── assets/           # Images, fonts, etc.
    └── screens/          # Page components
        ├── LoginScreen.tsx
        ├── OwnerScreen.tsx
        └── TenantScreen.tsx
```

## Connecting to Backend

Make sure the backend server is running on `http://localhost:5000` before using the application. See the Backend README for setup instructions.
