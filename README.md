# Canvas App

A simple React-based application where users can create, edit, and manage text objects on a canvas. This project showcases interactive text positioning, font manipulation, and undo-redo functionality for a smooth user experience.

## Features

- Add text to a canvas
- Move, edit, and delete text objects
- Change font size, style, and color
- Undo/Redo functionality
- Mobile responsiveness for text input

## Project Setup and Configuration

### 1. Clone the Repository or Extract ZIP
You can either clone the repository from GitHub or extract the ZIP file of this project.

```bash
git clone <repository-url>
```
### 2. Open the Project in a Code Editor
    - Open the project folder in your preferred code editor, such as Visual Studio Code.

### 3. Navigate to the project directory: ```cd canvas-app```

### 4. Install Dependencies
```
npm install
```
### 5. Start the Development Server
    ```
    npm start
    ```
    - The application will open in your browser at http://localhost:3000.

### 6. Explore Features
    - You can now start exploring the Canvas App. Add, move, edit, or delete text on the canvas using the toolbar.

## Folder Structure
```
canvas-app/
├── public/             # Public assets such as index.html
├── src/
│   ├── canvas/         # Canvas components and styles
│   │   ├── CanvasApp.js  # Main Canvas component
│   │   ├── Canvas.module.css  # Styles for the Canvas component
│   ├── data/           # Contains predefined font options or other data
│   ├── App.js          # Main app entry point
│   ├── index.js        # React app rendering
│   ├── index.css       # Global CSS
└── package.json        # Project metadata and npm scripts
```