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
└── utils/                 # Utility functions
    └── metroUtils.ts      # CSV parsing and data manipulation
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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
