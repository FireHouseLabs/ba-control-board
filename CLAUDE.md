# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Breathing Apparatus (BA) Control Board application built with Astro, React, and Tailwind CSS. The application tracks breathing apparatus entries for safety monitoring, calculating air supply depletion times and providing countdown timers for safety protocols.

## Development Commands

All commands should be run from the project root:

- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build locally
- `npm run astro` - Access Astro CLI commands

## Architecture

### Technology Stack
- **Framework**: Astro with React integration
- **Styling**: Tailwind CSS v4.1.11
- **TypeScript**: Configured with strict settings

### Project Structure
- `src/components/BAControlBoard.jsx` - Main React component handling BA entry management
- `src/pages/index.astro` - Root page that renders the control board
- `src/layouts/Layout.astro` - Base layout component 
- `src/styles/global.css` - Tailwind CSS imports

### Core Functionality
The BAControlBoard component manages:
- **Entry Creation**: Form for adding new BA entries with name, pressure, entry time, and comments
- **Pressure Calculations**: Converts pressure readings to minutes-to-empty using predefined lookup table
- **Countdown Timers**: Real-time countdown to whistle time (6 minutes before calculated empty time)
- **Visual Alerts**: Red highlighting for overdue entries

### Key Business Logic
- Pressure-to-time conversion in `calculateMinutesToEmpty()` function
- Whistle time calculation (entry time + minutes to empty - 6 minutes)
- Real-time countdown updates every second per entry
- Time formatting with MM:SS display and "OVERDUE" status

### Configuration
- Astro config includes React integration and Vite CSS preprocessing
- TypeScript configured for React JSX with react-jsx transform
- Tailwind CSS configured as utility-first CSS framework