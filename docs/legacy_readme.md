# Paris Transport Quiz

An interactive quiz application to test your knowledge of all Paris transport stations (Metro, RER, Train, Tramway), built with Next.js 15, React, TypeScript, and Tailwind CSS.

## Features

- 🚇 **Comprehensive Transport Database**: Complete Metro, RER, Train, and Tramway stations
- ⏱️ **Custom Timer**: Start, pause, and reset functionality
- 🎯 **Progress Tracking**: Real-time progress bar and score tracking
- 🔄 **Flexible Settings**: 
  - Choose specific transport modes (Metro, RER, Train, Tramway)
  - Select individual lines to quiz
  - Toggle showing station connections/transfers
  - Random order option
- 📊 **Quiz Mode**: Interactive typing-based quiz to test your knowledge of Paris metro stations
- 🧬 **Intersection Master**: A new advanced mode where you must find stations at the intersection of two criteria (e.g., Line 1 × Rive Gauche)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Line-Colored Interface**: Each station displays with its actual transport line color

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd metro
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Select Metro Lines**: Click the "Settings" button to choose which metro lines to include in your quiz
2. **Configure Options**: Toggle whether to show next/previous stations for hints
3. **Start the Quiz**: Click "Start Quiz" to begin
4. **Guess Stations**: Click on station cards to mark them as guessed
5. **Track Progress**: Watch your progress bar and timer as you complete the quiz
6. **Pause/Resume**: Use the pause button if you need a break
7. **Complete**: Try to identify all stations in the shortest time possible!

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   └── page.tsx           # Main quiz page
├── components/            # Reusable React components
│   ├── Timer.tsx          # Timer component with controls
│   ├── StationCard.tsx    # Individual station display
│   ├── LineFilter.tsx     # Metro line selection
│   └── QuizGame.tsx       # Main quiz game logic
├── data/                  # Metro stations data
│   └── metro-stations.csv # CSV file with station information
├── hooks/                 # Custom React hooks
│   └── useTimer.ts        # Timer functionality hook
├── types/                 # TypeScript type definitions
│   └── metro.ts           # Metro-related interfaces
|── utils/                 # Utility functions
|   └── metroUtils.ts      # CSV parsing and data manipulation
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **React 19**: Frontend library
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **CSV Data**: Simple data storage format

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Data Pipeline

The project includes a Python script to enrich metro data with geographical and historical information:
- **Location**: `scripts/process_data.py`
- **Output**: `src/data/stations-enriched.csv`

To run the pipeline, you'll need Python with `geopandas` and `shapely` installed.
