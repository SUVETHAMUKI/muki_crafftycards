# Muki Crafty Cards v2 | Modern Rebuild Spec & Documentation

Welcome to the modernized full-stack **Muki Crafty Cards v2** greeting card e-commerce platform. Rebuilt on a modern MERN-like stack using Next.js 15, TypeScript, MongoDB (Mongoose), React Query, Zustand, Recharts, and the Gemini API.

---

## 1. Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS + next-themes (Dark Mode Toggle)
- **Backend API**: Next.js Route Handlers (TypeScript API routes)
- **Database**: MongoDB Atlas + Mongoose ODM
- **Auth**: JWT (stored in `httpOnly` secure cookies) + bcrypt password hashing
- **Payments**: Razorpay (India) Integration with Test Mode fallbacks
- **AI Engine**: Gemini API (`gemini-1.5-flash` model for descriptions and FAQ support chatbot)
- **State Management**: Zustand (Client session) + React Query (Data caching, active polling)
- **Analytics**: Recharts (Admin analytics charts)
- **Testing**: Vitest

---

## 2. Environment Variables (`.env.local`)

Copy these variables into a `.env.local` file at the root of the project:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/muki_crafty_cards?retryWrites=true&w=majority

# Authentication Session Secret
JWT_SECRET=super_secret_session_encryption_key_here

# AI Features (Gemini API)
GEMINI_API_KEY=AIzaSy...

# Payments (Razorpay Credentials)
# Leave blank to run in mock payment simulation mode for local testing
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Notifications (SMTP Configurations)
# Leave blank to output mock emails to the terminal console
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@mukicraftycards.com
```

---

## 3. Key Architectural Implementations

### Fallback-Safe Integrations (No Key Required Sandbox)
1. **Mock Checkout Mode**: If `RAZORPAY_KEY_ID` is not specified in env variables, checkout forms will automatically skip the script loaders and trigger a simulated payment completion calling verification handlers directly.
2. **Mock AI Chatbot & Drafts**: If `GEMINI_API_KEY` is not provided, the chatbot and description generator will automatically return friendly template descriptions and mock order details.
3. **Mock SMTP Emails**: If no SMTP credentials are configured, the notification server outputs formatted emails directly to the server terminal console.

### Database Aggregation & Lifecycle Hooks
- **Review Rating Rollups**: Mongoose `post-save` and `post-findOneAndDelete` hooks on the `Review` schema run MongoDB aggregation pipelines to calculate average star ratings (`ratingAvg`) and counts (`reviewCount`) and update the `Product` document.
- **Product Moderation**: Artisan card templates default to `status: 'pending'` and must be approved by an administrator in the Admin Dashboard moderation queue before going live on the storefront.
- **Loyalty Program**: Checkout payments calculate loyalty points (₹10 spent = 1 point) and deduct points used for discounts (10 points = ₹1 off).

### Client-Side Optimizations & Polling
- **Canvas Personalization**: Fabric.js canvas editor is loaded dynamically via `next/dynamic` with `ssr: false` to prevent server-side compilation crashes.
- **Order Tracking Timeline**: React Query active polling (`refetchInterval: 10000`) fetches shipment status updates every 10 seconds, offering live timeline tracking without Socket.io server overhead.

---

## 4. Run Locally

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 5. Run Automated Tests

Execute unit tests using Vitest:
```bash
npx vitest run
```
