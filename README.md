# STAT Webpage

> Full-stack e-commerce platform for surgical and medical supplies, built with **Next.js (Pages Router)**, **MongoDB/Mongoose**, and **Tailwind CSS**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Page-by-Page Navigation Map](#page-by-page-navigation-map)
- [Component Hierarchy](#component-hierarchy)
- [Data Models](#data-models)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Checkout & Payment Flow](#checkout--payment-flow)
- [Admin Dashboard](#admin-dashboard)
- [Middleware](#middleware)
- [State Management](#state-management)
- [Third-Party Integrations](#third-party-integrations)
- [Utilities](#utilities)
- [Styling](#styling)
- [SEO & Performance](#seo--performance)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Tech Stack

| Layer             | Technology                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| Framework         | Next.js 16 (Pages Router)                                              |
| Language          | JavaScript / TypeScript (middleware)                                   |
| UI                | React 18, Tailwind CSS 3, Framer Motion, React Spring                  |
| Component Library | Headless UI, Heroicons, React Icons                                    |
| Database          | MongoDB via Mongoose                                                   |
| Authentication    | NextAuth.js (Credentials + Google OAuth)                               |
| Payments          | PayPal (`@paypal/react-paypal-js`), Stripe (`@stripe/react-stripe-js`) |
| Email             | Mailchimp Transactional, Nodemailer                                    |
| Image Hosting     | Cloudinary                                                             |
| Forms             | React Hook Form                                                        |
| Security          | reCAPTCHA v2/v3, bcryptjs                                              |
| Analytics         | Google Analytics, Vercel Analytics, Vercel Speed Insights              |
| Charts            | Chart.js + react-chartjs-2                                             |
| Notifications     | React Toastify                                                         |
| Testing           | Jest, Babel, node-mocks-http                                           |
| Deployment        | Vercel                                                                 |

---

## Project Structure

```
statwebpage/
├── components/            # Reusable React components
│   ├── admin/             # Admin panel components
│   ├── auth/              # Authentication (Google login button)
│   ├── checkoutProcess/   # Cart, Shipping, Payment, PlaceOrder
│   ├── contact/           # Contact forms
│   ├── context/           # React contexts (ModalContext)
│   ├── mailChimp/         # Email templates
│   ├── main/              # Layout shell (Header, Footer, Navbar, Layout)
│   ├── optimized/         # Performance-optimized component variants
│   ├── orders/            # Order tracking UI
│   ├── products/          # Product cards, detail views, search
│   ├── providers/         # Context providers (ReCaptcha)
│   ├── recaptcha/         # reCAPTCHA widgets
│   ├── seo/               # SEO-specific components
│   ├── support/           # Support page sections
│   ├── ui/                # Generic UI primitives
│   ├── users/             # Customer/user linking
│   ├── Banner.js          # Promotional banner carousel
│   ├── CheckoutWizard.js  # 4-step checkout progress indicator
│   ├── CookieAcceptancePopup.js  # GDPR cookie consent
│   ├── DropdownLink.js    # Dropdown navigation links
│   ├── FaqSection.js      # FAQ accordion
│   ├── Menu.js            # Navigation menu with manufacturer categories
│   ├── MiniHeader.js      # Compact header bar
│   ├── NewsItem.js        # News article card
│   ├── NewsSection.js     # News listing with animations
│   ├── StaticBanner.js    # Static promotional banner
│   └── timer.js           # Countdown timer
│
├── models/                # Mongoose schemas
│   ├── Batch.js           # Product batch/lot tracking
│   ├── Customer.js        # Customer profiles (CRM data)
│   ├── Estimate.js        # Price estimates with signatures
│   ├── Invoice.js         # Invoices with shipping/tracking
│   ├── News.js            # News articles & videos
│   ├── Order.js           # E-commerce orders
│   ├── Product.js         # Product catalog (pricing tiers)
│   ├── Searched.js        # Search analytics
│   ├── User.js            # Basic user (QuickBooks link)
│   └── WpUser.js          # Web platform user (auth, cart, profile)
│
├── pages/                 # Next.js file-based routing
│   ├── _app.js            # App wrapper (providers, analytics)
│   ├── _document.js       # HTML document (fonts, GTM)
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # Backend API routes
│   ├── news/              # News article pages
│   ├── order/             # Order detail pages
│   ├── products/          # Product catalog pages
│   └── *.js               # Top-level pages (home, cart, login, etc.)
│
├── public/                # Static assets (images, favicon, robots.txt)
├── styles/                # Global CSS (global.css with Tailwind directives)
├── utils/                 # Utility functions & helpers
│   ├── alertSystem/       # Email & SMS notification system
│   ├── functions/         # Shared helper functions
│   ├── Store.js           # Cart state management (React Context)
│   ├── db.js              # MongoDB connection pooling
│   ├── seo.js             # JSON-LD schema generators
│   └── ...                # Date formatting, sorting, etc.
│
├── Middleware.ts           # URL normalization & security middleware
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── jest.config.js          # Jest test configuration
└── package.json            # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Accounts for: Cloudinary, PayPal, Stripe, Google OAuth, reCAPTCHA, Mailchimp

### Installation

```bash
# Clone the repository
git clone https://github.com/bygabymora/statwebpage.git
cd statwebpage

# Install dependencies
npm install

# Create .env.local with required environment variables (see Environment Variables section)

# Run development server
npm run dev
```

### Available Scripts

| Script  | Command                | Description              |
| ------- | ---------------------- | ------------------------ |
| `dev`   | `next dev --webpack`   | Start development server |
| `build` | `next build --webpack` | Create production build  |
| `start` | `next start`           | Start production server  |
| `lint`  | `next lint`            | Run ESLint               |
| `test`  | `jest`                 | Run test suite           |

---

## Architecture Overview

### Request Lifecycle

```
Browser Request
      │
      ▼
┌─────────────┐
│ Middleware.ts│  ← URL normalization, tracking param cleanup, method enforcement
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  _app.js    │  ← Provider tree: Session → Store → Modal → PayPal → Cookie
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Layout.js  │  ← Header + Footer + SEO + Toast notifications
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Page       │  ← Specific page content (SSG, SSR, or CSR)
└─────────────┘
```

### Provider Wrapping Order (`_app.js`)

```
SessionProvider (NextAuth)
 └─ StoreProvider (Cart & cookies context)
     └─ ModalProvider (Global alerts, loading, user data)
         └─ PayPalScriptProvider (lazy-loaded)
             └─ CookieAcceptancePopup (lazy-loaded)
                 └─ <Component /> (page content)
```

### Rendering Strategies

| Strategy                       | Used For                                  |
| ------------------------------ | ----------------------------------------- |
| **SSG** (`getStaticProps`)     | Products index, News index, News articles |
| **SSR** (`getServerSideProps`) | Order details, Admin pages, User profile  |
| **CSR** (client-side)          | Cart, Search results, Checkout steps      |

---

## Page-by-Page Navigation Map

### Public Pages (No Authentication Required)

```
/                        → Homepage (product carousel, banners, news section)
├── /products            → Product catalog (filterable by manufacturer)
│   └── /products/[id]   → Individual product detail page
├── /clearance           → Clearance items (discounted products)
├── /search              → Search results page
├── /news                → News article listing
│   ├── /news/[slug]     → Individual news article
│   └── /news/video      → Video news content
├── /about               → About page (animated with React Spring)
├── /faqs                → Frequently Asked Questions (accordion)
├── /selling             → Secure buying & selling info
├── /support             → Support page (contact methods grid)
├── /tracking            → Delivery tracking (redirects to carrier)
├── /savings             → Savings & discounts showcase
├── /privacy-policy      → Privacy policy
├── /return-policy       → Return policy
├── /terms-of-use        → Terms and conditions
├── /slider              → Product slider/carousel
├── /ManufacturerForm    → Contact form for manufacturers
└── /unsubscribe         → Email list unsubscribe
```

### Authentication Pages

```
/Login                   → Email/password login + Google OAuth
/Register                → Account registration (reCAPTCHA protected)
/recoverAccess           → Password recovery
/authenticateCode        → Email verification / code entry
/unauthorized            → Access denied page
```

### Authenticated User Pages (Login Required)

```
/cart                    → Shopping cart (checkout wizard start)
├── Step 1: Cart         → Review items, quantities, pricing
├── Step 2: Shipping     → Enter/confirm shipping address
├── Step 3: Payment      → Select payment method (PayPal/Stripe)
└── Step 4: Place Order  → Order confirmation & submission
/payment                 → Payment method selection
/profile                 → User profile management
/order-history           → Past orders list
/order/[id]              → Order detail (tracking, payment status, invoice)
/cancel                  → Order cancellation
/email-preview           → Email template preview (dev tool)
```

### Admin Pages (Admin Role Required)

```
/admin/dashboard         → Analytics dashboard (charts, stats)
/admin/products          → Product CRUD (stock management)
/admin/orders            → Order management & tracking
/admin/users             → User account administration
/admin/news              → News content management
```

### Visual Site Map

```
                          ┌──────────┐
                          │  HOME /  │
                          └────┬─────┘
            ┌─────────────────┼─────────────────────┐
            │                 │                      │
     ┌──────▼──────┐   ┌─────▼─────┐         ┌─────▼──────┐
     │  PRODUCTS   │   │   NEWS    │         │   AUTH     │
     │  /products  │   │   /news   │         │  /Login    │
     │  /clearance │   │  /news/   │         │  /Register │
     │  /search    │   │  [slug]   │         └─────┬──────┘
     └──────┬──────┘   └───────────┘               │
            │                              ┌───────▼────────┐
     ┌──────▼──────┐                       │  USER AREA     │
     │    CART     │                       │  /profile      │
     │   /cart     │                       │  /order-history│
     └──────┬──────┘                       │  /order/[id]   │
            │                              └───────┬────────┘
  ┌─────────┼──────────┐                           │
  │    CHECKOUT FLOW   │                   ┌───────▼────────┐
  │ Cart → Shipping →  │                   │  ADMIN PANEL   │
  │ Payment → Confirm  │                   │  /admin/*      │
  └────────────────────┘                   └────────────────┘

                    ┌────────────────────┐
                    │   INFO PAGES       │
                    │  /about  /faqs     │
                    │  /support          │
                    │  /selling  /savings│
                    │  /privacy-policy   │
                    │  /return-policy    │
                    │  /terms-of-use     │
                    │  /tracking         │
                    └────────────────────┘
```

---

## Component Hierarchy

### Layout Shell

```
Layout.js
├── Header.js
│   ├── MiniHeader.js         (top utility bar)
│   ├── Logo + Cart Icon      (inline SVGs)
│   ├── Navbar.js             (main navigation links)
│   └── Menu.js               (product category dropdowns)
├── {Page Content}            (injected children)
├── Footer.js
│   ├── Social media links
│   ├── Newsletter signup
│   ├── Contact info
│   └── ReCaptchaProvider.js
├── ToastContainer            (react-toastify — dynamic import)
├── CustomAlertModal.js       (global alert modal)
├── CustomConfirmModal.js     (global confirm modal)
└── StatusMessage.js          (toast-like notifications)
```

### Product Components

```
ProductItem.js               → Product card (grid/list view)
├── LCPProductImage.js       → Optimized hero image
├── Price display             → Each / Box / Clearance tiers
├── Type selector (Listbox)   → Purchase type toggle
└── Add to Cart button

ProductItemPage.js           → Full product detail page
├── Image gallery
├── Specifications
├── Pricing breakdown
├── RelatedProducts.js       → Carousel of related items
└── Add to Cart / Contact

SearchForm.js                → Search input with filters
```

### Checkout Components

```
CheckoutWizard.js            → Step indicator bar (Framer Motion)

Cart.js                      → Cart item list
├── Item rows (quantity, price, remove)
├── Stock alert badges
└── Listbox quantity selector

Shipping.js                  → Address form
PaymentMethod.js             → Payment option selection
PlaceOrder.js                → Order summary & confirm
```

### News Components

```
NewsSection.js               → Animated news listing (Framer Motion)
└── NewsItem.js              → Article card
    ├── Image / Video thumbnail
    ├── Title + excerpt
    └── Video hover playback
```

---

## Data Models

### WpUser (Web Platform User)

The primary user model for authentication and profile data.

| Field                   | Type                     | Description                                  |
| ----------------------- | ------------------------ | -------------------------------------------- |
| `firstName`, `lastName` | String                   | User name                                    |
| `email`                 | String (unique, indexed) | Login email                                  |
| `password`              | String                   | bcrypt hashed password                       |
| `isAdmin`               | Boolean                  | Admin role flag                              |
| `active`                | Boolean                  | Account active status                        |
| `approved`              | Boolean                  | Account approval status                      |
| `restricted`            | Boolean                  | Restricted access flag                       |
| `companyName`           | String                   | Associated company                           |
| `customerId`            | String                   | CRM customer link                            |
| `resetCode`             | Object                   | `{ code, expireDate }` for password recovery |
| `cart`                  | Array                    | Persisted cart items                         |

### Product

Multi-tier pricing model for medical supplies.

| Field                  | Type            | Description                                                                       |
| ---------------------- | --------------- | --------------------------------------------------------------------------------- |
| `name`, `manufacturer` | String          | Product identity                                                                  |
| `slug`                 | String (unique) | URL-friendly identifier                                                           |
| `gtin`                 | String          | Global Trade Item Number                                                          |
| `image`                | String          | Cloudinary image URL                                                              |
| `keywords`             | Array (indexed) | Search keywords                                                                   |
| `countInStock`         | Number          | Total available units                                                             |
| `each`                 | Object          | Per-unit pricing tier (price, wpPrice, customerPrice, minSalePrice, stock fields) |
| `box`                  | Object          | Per-box pricing tier (same structure)                                             |
| `clearance`            | Object          | Clearance pricing tier (same structure)                                           |
| `isInClearance`        | Boolean         | Clearance flag                                                                    |
| `hotProduct`           | Boolean         | Featured product flag                                                             |
| `callForPrice`         | Boolean         | Price on request                                                                  |

### Order

| Field                         | Type           | Description                                                         |
| ----------------------------- | -------------- | ------------------------------------------------------------------- |
| `wpUser`                      | Object         | `{ userId, firstName, lastName, email }`                            |
| `orderItems`                  | Array          | `{ name, productId, slug, price, quantity, typeOfPurchase, image }` |
| `shippingAddress`             | Object         | Full shipping details                                               |
| `paymentMethod`               | String         | PayPal or Stripe                                                    |
| `totalPrice`                  | Number         | Order total                                                         |
| `isPaid` / `paidAt`           | Boolean / Date | Payment status                                                      |
| `isDelivered` / `deliveredAt` | Boolean / Date | Delivery status                                                     |
| `orderStatus`                 | String         | Current status                                                      |
| `checkoutSessionId`           | String         | Stripe/PayPal session reference                                     |

### Customer (CRM Record)

Extended customer profile linked to QuickBooks.

| Field                                    | Type   | Description                                              |
| ---------------------------------------- | ------ | -------------------------------------------------------- |
| `user`                                   | Object | Link to WpUser (`userId, name, email, userQuickBooksId`) |
| `location`                               | Object | Primary address                                          |
| `billAddr`                               | Object | Billing address                                          |
| `creditLimit`                            | Number | Account credit limit                                     |
| `facilityType`                           | Array  | Types of medical facilities                              |
| `leadStage`                              | String | Sales pipeline stage                                     |
| `mailChimpId`                            | String | Email marketing link                                     |
| `upsAccountNumber`, `fedexAccountNumber` | String | Carrier accounts                                         |

### Additional Models

- **Invoice** — Invoices with shipping parcels and tracking data
- **Estimate** — Price estimates with digital signature support (`signedFile` with signer, date, IP)
- **Batch** — Product lot/batch tracking with expiration dates
- **News** — Articles with video support (mp4, webm, YouTube, Vimeo)
- **Searched** — Search term analytics for business intelligence

---

## API Routes

### Authentication (`/api/auth/`)

| Endpoint                     | Method | Description                             |
| ---------------------------- | ------ | --------------------------------------- |
| `/api/auth/[...nextauth]`    | \*     | NextAuth handler (credentials + Google) |
| `/api/auth/signup`           | POST   | User registration                       |
| `/api/auth/update`           | PUT    | Profile update                          |
| `/api/auth/resetPassword`    | POST   | Set new password                        |
| `/api/auth/requestResetCode` | POST   | Send password reset code via email      |
| `/api/auth/user-session`     | GET    | Fetch current session data              |

### Products (`/api/products/`)

| Endpoint                      | Method | Description                        |
| ----------------------------- | ------ | ---------------------------------- |
| `/api/products/[id]`          | GET    | Product details by ID              |
| `/api/search`                 | GET    | Search products by keyword (regex) |
| `/api/clearance`              | GET    | List clearance products            |
| `/api/featuredProductsJSONLD` | GET    | Featured products structured data  |

### Orders (`/api/orders/`)

| Endpoint                             | Method   | Description                    |
| ------------------------------------ | -------- | ------------------------------ |
| `/api/orders`                        | GET/POST | List or create orders          |
| `/api/orders/[id]`                   | GET/PUT  | Order details or update        |
| `/api/orders/history`                | GET      | User's order history           |
| `/api/orders/lastOrder`              | GET      | Most recent order              |
| `/api/orders/fetchOrLatestInProcess` | GET      | Active/latest in-process order |
| `/api/orders/uploadPO`               | POST     | Upload purchase order document |

### Users (`/api/users/`)

| Endpoint          | Method | Description                                      |
| ----------------- | ------ | ------------------------------------------------ |
| `/api/users/[id]` | GET    | Fetch user data (WpUser, Customer, AccountOwner) |

### Admin (`/api/admin/`)

| Endpoint                     | Method         | Description                     |
| ---------------------------- | -------------- | ------------------------------- |
| `/api/admin/summary`         | GET            | Dashboard statistics            |
| `/api/admin/cloudinary-sign` | POST           | Sign Cloudinary upload requests |
| `/api/admin/products/[id]`   | GET/PUT/DELETE | Product CRUD                    |
| `/api/admin/orders/[id]`     | GET/PUT        | Order management                |
| `/api/admin/users/[id]`      | GET/PUT/DELETE | User management                 |
| `/api/admin/news/[id]`       | GET/PUT/DELETE | News CRUD                       |
| `/api/admin/mainUser/[id]`   | GET/PUT        | Main user administration        |

### Content & SEO

| Endpoint            | Method | Description          |
| ------------------- | ------ | -------------------- |
| `/api/news`         | GET    | News article listing |
| `/api/news-sitemap` | GET    | News sitemap XML     |
| `/api/sitemap`      | GET    | Full sitemap XML     |
| `/api/rss`          | GET    | RSS feed             |

### Other

| Endpoint                 | Method   | Description                           |
| ------------------------ | -------- | ------------------------------------- |
| `/api/checkout_sessions` | POST     | Create Stripe/PayPal checkout session |
| `/api/cart`              | GET/POST | Cart operations                       |
| `/api/estimates`         | GET/POST | Estimate management                   |
| `/api/emails`            | POST     | Send transactional emails             |
| `/api/recaptcha`         | POST     | reCAPTCHA verification                |
| `/api/unsubscribe`       | POST     | Email list unsubscribe                |
| `/api/seed`              | POST     | Database seeding (development)        |

---

## Authentication

### Flow

```
                    ┌────────────┐
                    │  /Login    │
                    └──┬─────┬──┘
                       │     │
              ┌────────▼┐  ┌▼──────────┐
              │ Email/  │  │  Google   │
              │ Password│  │  OAuth    │
              └────┬────┘  └────┬──────┘
                   │            │
                   ▼            ▼
            ┌─────────────────────┐
            │  NextAuth.js        │
            │  [...nextauth].js   │
            └──────────┬──────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  JWT Session     │
            │  (SessionProvider)│
            └──────────────────┘
```

### Key Details

- **Provider**: NextAuth.js with Credentials and Google OAuth providers
- **Session**: JWT-based (stored client-side)
- **Password Hashing**: bcryptjs
- **Registration Protection**: reCAPTCHA v2 checkbox verification
- **Password Recovery**: Email-based reset code with expiration
- **Account Approval**: Admin must approve new accounts (`approved` flag on WpUser)
- **Role Enforcement**: `isAdmin` flag controls admin page access

---

## Checkout & Payment Flow

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌─────────────┐
│  CART    │───▶│ SHIPPING  │───▶│ PAYMENT  │───▶│ PLACE ORDER │
│ Step 1   │    │  Step 2   │    │  Step 3  │    │   Step 4    │
└─────────┘    └───────────┘    └──────────┘    └──────┬──────┘
                                                       │
                                              ┌────────▼────────┐
                                              │ PayPal / Stripe │
                                              │ Checkout Session│
                                              └────────┬────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │  Order Created  │
                                              │  /order/[id]    │
                                              └─────────────────┘
```

### Purchase Types

Products support three pricing tiers that users select before adding to cart:

| Type          | Description                  |
| ------------- | ---------------------------- |
| **Each**      | Individual unit pricing      |
| **Box**       | Bulk/box pricing             |
| **Clearance** | Discounted clearance pricing |

### Payment Processors

- **PayPal** — Via `@paypal/react-paypal-js`, lazy-loaded
- **Stripe** — Via `@stripe/react-stripe-js`, checkout session API

---

## Admin Dashboard

### Dashboard (`/admin/dashboard`)

Displays key business metrics via Chart.js bar charts:

- Total users, orders, products
- Revenue statistics
- Refresh capability

### Product Management (`/admin/products`)

- Full CRUD operations
- Stock status badges: **Out of Stock** (red) / **Low Stock ≤5** (yellow) / **Normal** (green)
- Image thumbnails via Cloudinary
- Search & filter

### Order Management (`/admin/orders`)

- Order listing with status icons
- Payment and delivery tracking
- Invoice management
- Status updates

### User Management (`/admin/users`)

- Account listing with approval status (✓/✗)
- Edit, delete, search
- Role management
- Active/restricted status control

### News Management (`/admin/news`)

- Article CRUD with rich content
- Video support (mp4, webm, YouTube, Vimeo)
- Category and tag management

---

## Middleware

**File**: `Middleware.ts`

The middleware runs on all routes except `/api`, `/_next/static`, `/_next/image`, and `favicon.ico`.

### What It Does

1. **Method enforcement** — Only allows `GET` and `HEAD` requests (returns 405 otherwise)
2. **Encoded query fix** — Handles `%3F` (encoded `?`) in pathnames
3. **Trailing slash normalization** — Removes trailing slashes from `/news` URLs
4. **Tracking parameter cleanup** — Strips UTM params, `gclid`, `fbclid`, `srsltid`, `msclkid`, `_ga`, `mc_cid`, `mc_eid` from `/news` and `/products` URLs
5. **News slug normalization** — Lowercases and cleans `/news/[slug]` paths
6. **Product URL normalization** — Extracts numeric product ID from `/products/` paths
7. **301 redirects** — All normalizations trigger permanent redirects

---

## State Management

### Cart Store (`utils/Store.js`)

React Context + `useReducer` pattern for cart and cookie state.

**State Shape:**

```js
{
  cart: {
    cartItems: [],          // Array of products with quantity & typeOfPurchase
    shippingAddress: {},    // Saved shipping address
  },
  cookieAccepted: false,    // GDPR consent flag
}
```

**Available Actions:**

| Action                  | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `CART_ADD_ITEM`         | Add product (considers typeOfPurchase: Each/Box/Clearance) |
| `CART_UPDATE_ITEM`      | Update item quantity                                       |
| `CART_REMOVE_ITEM`      | Remove item from cart                                      |
| `CART_RESET`            | Clear entire cart                                          |
| `CART_CLEAR_ITEMS`      | Clear items only (keep address)                            |
| `SAVE_SHIPPING_ADDRESS` | Persist shipping address                                   |
| `SAVE_PAYMENT_METHOD`   | Store selected payment method                              |
| `ACCEPT_COOKIES`        | Record cookie consent                                      |

**Persistence**: Cart state is saved to browser cookies via `js-cookie`.

### Modal Context (`components/context/ModalContext.js`)

Global UI state for modals, loading indicators, and user data.

| Feature         | Description                                     |
| --------------- | ----------------------------------------------- |
| Status messages | Success/error/warning toasts                    |
| Alert modals    | Custom message + action callbacks               |
| Confirm modals  | Yes/no confirmation dialogs                     |
| Loading state   | Global loading spinner control                  |
| User data       | Fetched from `/api/users/:id` on session change |
| Customer data   | Associated customer record                      |

---

## Third-Party Integrations

| Service                   | Purpose                           | Package                                               |
| ------------------------- | --------------------------------- | ----------------------------------------------------- |
| **PayPal**                | Payment processing                | `@paypal/react-paypal-js`                             |
| **Stripe**                | Payment processing                | `@stripe/react-stripe-js`, `stripe`                   |
| **Cloudinary**            | Image hosting & optimization      | `@cloudinary/react`, `cloudinary`                     |
| **Google OAuth**          | Social login                      | `next-auth` (Google provider)                         |
| **Google reCAPTCHA**      | Bot protection (v2 + v3)          | `react-google-recaptcha`, `react-google-recaptcha-v3` |
| **Google Analytics**      | Traffic analytics                 | Custom GTM integration                                |
| **Mailchimp**             | Transactional emails              | `@mailchimp/mailchimp_transactional`                  |
| **Nodemailer**            | Email delivery                    | `nodemailer`                                          |
| **QuickBooks**            | Accounting & CRM sync             | Custom integration via IDs                            |
| **Vercel Analytics**      | Performance monitoring            | `@vercel/analytics`                                   |
| **Vercel Speed Insights** | Core Web Vitals                   | `@vercel/speed-insights`                              |
| **Lottie**                | Animated illustrations (404 page) | `lottie-react`                                        |

---

## Utilities

### `utils/db.js` — Database Connection

MongoDB connection management with:

- Connection pooling (`maxPoolSize: 10`, `minPoolSize: 0`)
- Connection caching via `global._mongo`
- Socket timeout: 5 minutes
- Activity tracking

### `utils/seo.js` — SEO Schema Generators

JSON-LD structured data generators for:

- `generateJSONLD()` — News articles (Article schema)
- `generateProductJSONLD()` — Product pages (Product schema)
- `generateNewsPageJSONLD()` — News listing page
- `generateAboutPageJSONLD()` — About page (Organization schema)
- `generateOrganizationJSONLD()` — Organization details
- `generateBreadcrumbJSONLD()` — Breadcrumb navigation

### `utils/productSort.js` — Product Sorting

Product sorting and data enrichment logic.

### `utils/alertSystem/` — Notification System

- `customers/messageManagement.js` — SMS/email messaging
- `documentRelatedEmail/` — Transactional email builders

### Date Utilities

- `dateUtils.js` — Standard date formatting
- `dateWithMonthInLetters.js` — Dates with spelled-out months
- `dateWithTimeUtils.js` — Date + time formatting

### Other

- `data.js` — Static data constants
- `states.json` — US states list
- `error.js` — Error handling helpers
- `manufacturerProfiles.js` — Manufacturer metadata
- `reportWebVitals.js` — Performance monitoring hooks
- `simpleUnsubscribe.js` — Email unsubscribe logic
- `Store.js` — Cart context (see State Management)

---

## Styling

- **Framework**: Tailwind CSS 3 with `@tailwindcss/typography` plugin
- **Global Styles**: `styles/global.css` (Tailwind directives + custom rules)
- **Custom Animations**: Defined in `tailwind.config.js`
  - `timer-pulse` — Pulsing scale animation
  - `banner-fade` — Fade-in animation
- **Motion**: Framer Motion for page transitions and component animations
- **React Spring**: Used for scroll-triggered animations (About page)
- **Icons**: React Icons (FA, BS, AI, FI, MD, IO5) + Heroicons

---

## SEO & Performance

### SEO

- Dynamic `<title>` and `<meta>` tags via Layout.js
- JSON-LD structured data for products, news, organization, breadcrumbs
- XML Sitemap (`/api/sitemap`)
- News Sitemap (`/api/news-sitemap`)
- RSS Feed (`/api/rss`)
- `robots.txt` in `/public`
- Canonical URL management via middleware

### Performance Optimizations

- **Dynamic imports**: Non-critical components (Footer, Header, PayPal, Cookie popup) are lazy-loaded
- **Image optimization**: Next.js Image with Cloudinary + AVIF/WebP formats
- **Font optimization**: Preconnect + preload for Google Fonts with `display=swap`
- **Tree shaking**: `optimizePackageImports` for react-icons, heroicons, framer-motion
- **Code splitting**: Automatic via Next.js pages
- **DB connection pooling**: Cached MongoDB connections (`global._mongo`)
- **LCP optimization**: Dedicated `LCPProductImage` component for hero images
- **Source maps disabled** in production (saves 15-25% JS asset size)

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# PayPal
PAYPAL_CLIENT_ID=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Mailchimp
MAILCHIMP_TRANSACTIONAL_API_KEY=

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

---

## Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build for production                     |
| `npm start`     | Start production server                  |
| `npm run lint`  | Lint code with ESLint                    |
| `npm test`      | Run Jest tests                           |
