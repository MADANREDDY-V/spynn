# SPYNN Dry Cleaning Studio

A premium, static-first web application for a dry cleaning service exclusive to gated communities. 

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **Supabase**.

## Features

- **Premium Design**: Apple/Stripe-inspired aesthetic using custom hex colors.
- **Searchable Price List**: Instant client-side filtering for garment pricing.
- **Booking Flow**: Complete form capturing customer info, community, pickup details, and special instructions.
- **Supabase Integration**: Stores pickup requests and community details securely.
- **AI Stain Detection (Agent Portal)**: Mocked AI flow for pickup agents to analyze stains via uploaded images.
- **Admin Dashboard**: View and manage pickup requests, export to CSV.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase Project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Copy `.env.example` to `.env` and fill in your Supabase details:
   ```bash
   cp .env.example .env
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Create a new Supabase project.
2. Go to the SQL Editor and run the queries found in `database.sql`.
3. Go to Project Settings -> API and copy the URL and Anon Key into your `.env` file.

## Project Structure

- `/src/app`: Next.js App Router pages (Home, Pricing, Book, Communities, Admin, Agent).
- `/src/components`: UI components (shadcn and custom).
- `/src/config`: Global site configuration.
- `/src/data`: Static JSON data (e.g., `pricing.json`).
- `/src/lib`: Utility functions and Supabase client setup.

## Deployment

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Go to Vercel and import the repository.
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in the Vercel dashboard.
4. Click Deploy.
