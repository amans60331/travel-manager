# Deployment & Testing Guide - TravelGenie AI

This guide covers how to deploy the TravelGenie application to production and test it thoroughly.

## 1. Prerequisites

Before deploying, ensure you have:
- A **GitHub Account** (to host your code).
- A **Vercel Account** (for Frontend).
- A **Render Account** (for Backend).
- Your **Gemini API Key**.
- Your **Web3Forms Access Key** (`4d6fa68d-b78f-4081-a9f9-c93fa3d148c0`).

---

## 2. Deploying the Backend (Server)

We will use **Render** (free tier) for the Node.js backend.

1.  **Push Code to GitHub**: Ensure your latest code is pushed to a GitHub repository.
2.  **Create New Web Service on Render**:
    - Log in to Render.com -> New -> Web Service.
    - Connect your GitHub repo.
3.  **Configure Settings**:
    - **Name**: `travel-manager-api` (or similar)
    - **Root Directory**: `server` (Important! The server code is in the `server` folder)
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
4.  **Environment Variables**:
    - Add the following keys:
        - `GEMINI_API_KEY`: Your actual Google Gemini API Key.
        - `PORT`: `10000` (Render creates this automatically, but good to know).
        - `MONGODB_URI`: (Optional) If you have a Mongo Atlas cluster. If not, the app will fallback to `destinations.json` (Safe for MVP).
5.  **Deploy**: Click "Create Web Service".
6.  **Copy URL**: Once deployed, copy the service URL (e.g., `https://travel-manager-api.onrender.com`).

---

## 3. Deploying the Frontend (Client)

We will use **Vercel** for the React frontend.

1.  **Prepare for Vercel**:
    - Update `client/src/api/agent.js` (or `client/.env.production`) to point to your **Production Backend URL** instead of `localhost:5000`.
    - *Tip:* Create a `.env.production` file in `client/` with:
      ```
      VITE_API_URL=https://travel-manager-api.onrender.com
      ```
    - Ensure your code uses `import.meta.env.VITE_API_URL` for API calls.

2.  **Import to Vercel**:
    - Log in to Vercel -> Add New -> Project.
    - Select your GitHub repo.
3.  **Configure Settings**:
    - **Root Directory**: `client` (Important!)
    - **Framework Preset**: Vite
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  **Environment Variables**:
    - Add `VITE_API_URL` with your Render backend URL.
5.  **Deploy**: Click "Deploy".

---

## 4. Production Testing Steps

Once deployed, perform these tests to ensure everything works:

### **Test 1: Initial Load & connectivity**
- [ ] Open the Vercel URL.
- [ ] Does the Preloader (F1 Car) show up and finish?
- [ ] Do you see the "AI Travel Planner" chat window?
- [ ] **Critical:** Check the Console (F12 -> Console). Are there any red errors connecting to the backend?

### **Test 2: Basic Chat Flow**
- [ ] Type "Hi".
- [ ] Does the AI respond with greeting? (If yes, Backend is connected).

### **Test 3: Planning a Trip**
- [ ] Type: "Plan a trip to Goa for 3 days with 20k budget".
- [ ] Does it ask clarifying questions or show the plan?
- [ ] **Verify Itinerary Text:** Does the AI provide a Day-by-Day text itinerary? (We fixed this!).
- [ ] **Verify Rich Content:** Does the "Budget Breakdown" card appear?
- [ ] **Verify Links:** Click "Book Accommodation". Are the buttons correctly labeled (Booking.com, Skyscanner)? Do they open valid URLs?

### **Test 4: Destination Switching**
- [ ] While on the Goa plan, type: "Actually, change to Manali".
- [ ] Does the AI acknowledge the switch?
- [ ] Does it generate a NEW plan for Manali? (We fixed the "Stuck" bug!).

### **Test 5: Contact Form**
- [ ] Go to `/contact`.
- [ ] Fill out the form.
- [ ] Click Send.
- [ ] Do you see "✅ Message received!"?
- [ ] **Check Email:** Check `amans60331@gmail.com` to confirm you received the message via Web3Forms.

### **Test 6: Mobile Responsiveness**
- [ ] Open the site on your phone or use Chrome DevTools (Mobile View).
- [ ] Is the chat window usable?
- [ ] Are the buttons clickable?

---

## 5. Troubleshooting Common Production Issues

- **Backend "Not Found" / CORS Error**:
  - Check if `VITE_API_URL` in Vercel matches your Render URL EXACTLY (no trailing slash usually better).
  - Check server logs in Render dashboard.
- **"Stuck" on Loading**:
  - The backend might be sleeping (Render free tier sleeps after inactivity). It takes ~50 seconds to wake up. Just wait.
- **MongoDB Errors**:
  - If you didn't set `MONGODB_URI`, ignore logs about connection failure. The app falls back to JSON automatically.

Ready to launch! 🚀
