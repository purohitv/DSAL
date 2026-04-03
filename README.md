# DSAL Website (Next.js)

This is the unified "Data Structure and Algorithm Laboratory" platform, built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Prerequisites

- **Node.js** (v18.17 or later)
- **npm** (usually comes with Node.js)

## Getting Started

Since the project structure was manually created, you first need to install the dependencies.

1.  **Open a terminal** in this directory.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
    *Note: This might take a minute as it downloads React, Next.js, and other libraries.*

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Open your browser**:
    Navigate to [http://localhost:3000](http://localhost:3000) to see the website.

## Project Structure

- `app/`: Contains the application routes and pages.
    - `page.tsx`: The main landing page.
    - `library/`: The algorithm library browser.
    - `research/`: The research lab dashboard.
    - `visualizations/[id]/`: Dynamic routing for algorithm visualizations.
- `public/`: Static assets (images, fonts).
- `tailwind.config.ts`: Design system configuration (colors, animations).

## Features

- **Dynamic Routing**: Add new algorithms by simply updating the data source, no new files needed.
- **Scalable Architecture**: Built on Next.js App Router for future API integration.
- **Modern UI**: Glassmorphism and animations using Tailwind CSS.
