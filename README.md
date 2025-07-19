# BA Control Board

A Breathing Apparatus (BA) Control Board application for safety monitoring and tracking of breathing apparatus entries. Built with Astro, React, and Tailwind CSS.

## Features

- **Entry Management**: Add new BA entries with name, pressure, entry time, and comments
- **Pressure Calculations**: Converts pressure readings to time-to-empty using lookup tables
- **Safety Timers**: Real-time countdown to whistle time (6 minutes before calculated empty time)
- **Visual Alerts**: Red highlighting for overdue entries and audio notifications
- **Operational History**: Download functionality for CSV and PDF formats
- **Staging System**: Stage crew entries before finalizing
- **Google Analytics**: Integrated usage tracking

## Technology Stack

- **Framework**: Astro with React integration
- **Styling**: Tailwind CSS v4.1.11
- **TypeScript**: Configured with strict settings

## Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── BAControlBoard.jsx     # Main control board component
│   ├── layouts/
│   │   └── Layout.astro           # Base layout with GA tracking
│   ├── pages/
│   │   └── index.astro            # Root page
│   └── styles/
│       └── global.css             # Tailwind CSS imports
└── package.json
```

## Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Core Functionality

The BAControlBoard component manages:
- **Entry Creation**: Form for adding new BA entries
- **Pressure-to-Time Conversion**: Uses predefined lookup table in `calculateMinutesToEmpty()`
- **Whistle Time Calculation**: Entry time + minutes to empty - 6 minutes
- **Real-time Updates**: Countdown timers update every second
- **Alert System**: Visual and audio notifications for overdue entries

## Safety Features

- Automatic calculation of air supply depletion times
- Countdown timers for safety protocols
- Visual alerts for overdue entries
- Staging system for crew management
- Operational history tracking

## Analytics

Google Analytics is integrated for usage tracking and monitoring.
