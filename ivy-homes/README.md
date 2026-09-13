# Ivy Homes 🌿

Ivy Homes is a premium, verified real estate ecosystem tailored for the luxury property market in Hyderabad. Featuring a modern, stunning glassmorphic UI, smooth micro-interactions, and a responsive fluid design, it provides users with a seamless and visually striking property discovery experience.

## ✨ Features

- **Luxury Glassmorphic UI:** A visually stunning interface with dynamic glass panels, soft neon glows, and custom blurring effects optimized for ultra-smooth scrolling.
- **Fluid & Responsive Design:** Uses modern CSS flex and grid layouts to ensure perfect presentation across all devices (mobile to 4K displays).
- **Smooth Animations:** Integrated with `framer-motion` for buttery smooth layout transitions, hover interactions, and route changes.
- **Robust Authentication:** Client-side authentication flow interacting seamlessly with the Ivy Homes API. Includes token rotation and auto-refresh using Axios interceptors.
- **Dynamic Property Engine:** Advanced filtering for searching premium verified listings, residential projects, and rental homes.
- **Market Analytics & Insights:** Data visualization using Recharts to present market trends, average prices, and demand indices in real-time.

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Charts:** [Recharts](https://recharts.org/)

## 🔌 API Integration & Architecture

The application communicates with the backend (`https://solve.ivy.homes`) using a custom configured **Axios instance** (`src/lib/api.ts`).

### Authentication & Token Lifecycle
The platform uses secure JWT-based authentication:
- **Interceptors:** Axios request interceptors automatically attach the `access_token` to every secure request.
- **Auto-Refresh:** Before a request is sent, the interceptor checks if the token is expired (or within 60 seconds of expiry). If it is, it transparently makes a call to `/auth/refresh` using the `refresh_token` stored in `localStorage`, updates the tokens, and then proceeds with the original request without interrupting the user's flow.

### Core API Endpoints Implemented
- **Auth:** `/auth/login`, `/auth/refresh`, `/auth/logout`
- **Listings:** `/v1/listings` (with filters: locality, bhk, price range, etc.), `/v1/listings/:id`
- **Rentals:** `/v1/rentals`, `/v1/rentals/:id`
- **Projects:** `/v1/projects`, `/v1/projects/:id`
- **Saved Vault:** `/v1/saved` (GET, POST, DELETE)
- **Health:** `/health`

## 🧮 Mortgage & EMI Estimator

The application features a real-time EMI (Equated Monthly Installment) calculator to help buyers estimate their monthly financial commitments on luxury properties.

### The Mathematical Formula
We use the standard amortization formula to calculate the monthly payments:

**EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]**

Where:
- **P (Principal):** The total loan amount. By default, the calculator assumes an **80% LTV** (Loan-to-Value) ratio, meaning the principal is 80% of the property's total price.
- **R (Monthly Rate):** The monthly interest rate, calculated as `(Annual Interest Rate / 12) / 100`. The default annual rate is set to **8.5%**.
- **N (Tenure):** Total number of monthly installments (`Years × 12`). The default tenure is **20 years** (240 months).

The calculator instantly provides the **Monthly EMI**, **Total Interest Payable**, and the **Total Payment** (Principal + Interest).

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v20 or higher recommended) and `npm` installed.

### 2. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` or `.env.local` file in the root of your project directory and add your API credentials:

```env
NEXT_PUBLIC_API_BASE_URL="https://solve.ivy.homes"
NEXT_PUBLIC_API_KEY="your_api_key_here"
```

> **Note:** Since these environment variables are prefixed with `NEXT_PUBLIC_`, they will be safely injected into the browser bundle at build time. 

### 4. Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform. If you modify your `.env` file while the server is running, make sure to restart the dev server to apply the changes.

## 📂 Project Structure

- `src/app/` - Next.js App Router pages (Home, Login, Dashboard, Listings, Analytics).
- `src/components/` - Reusable UI components (Navbar, Footer, Modals, Cards).
- `src/lib/` - Utility functions, Context providers, and the `api.ts` configured Axios client.
- `public/` - Static assets like images and fonts.

## 🎨 Design System

The application utilizes a custom Tailwind CSS v4 design system configured in `src/app/globals.css`. 
Key aesthetic elements include:
- A dark space-themed `#050814` background.
- High-contrast typography with modern sans-serif fonts.
- Accent colors ranging across Amber, Orange, Violet, and Emerald gradients.
- CSS-accelerated radial gradients to simulate neon glowing spheres without hurting rendering performance.
