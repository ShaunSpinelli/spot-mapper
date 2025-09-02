# My Trip 🗺️

A beautiful, modern React application for planning and organizing your travel adventures.

## Features

- ✨ Clean, modern UI with Tailwind CSS
- 📱 Fully responsive design
- ➕ Add new trips with details
- 🗑️ Delete trips you no longer need
- 📅 Date range tracking
- 🖼️ Image support for destinations
- 📝 Trip descriptions and notes

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Modern ES modules** support

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd my-trip
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # App header with navigation
│   ├── TripCard.tsx    # Individual trip display card
│   └── AddTripForm.tsx # Form for adding new trips
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles with Tailwind imports
```

## Usage

1. **Adding a Trip**: Click the "Add New Trip" button to open the form
2. **Viewing Trips**: All your trips are displayed as cards on the main page
3. **Deleting Trips**: Click the trash icon on any trip card to remove it

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).