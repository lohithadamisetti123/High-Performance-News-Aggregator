# High-Performance News Aggregator

This project is a React + Vite application that displays the top stories from HackerNews. It is built in two phases:

- A deliberately slow, unoptimized version (`slow-version` branch) demonstrating common performance anti-patterns.
- An optimized version (`main` branch) with improved Core Web Vitals scores.

## Tech Stack

- React + Vite
- Hacker News Firebase API
- Docker + Docker Compose

## Running the Application (Slow Version)

```bash
# Clone repo
git clone https://github.com/lohithadamisetti123/High-Performance-News-Aggregator.git
cd High-Performance-News-Aggregator

# Checkout slow version
git checkout slow-version

# Install dependencies
npm install

# Copy env example
cp .env.example .env

# Run dev server
npm run dev
```

## Running the Optimized Version (Main)

Instructions for the optimized version are documented in the `main` branch README.
