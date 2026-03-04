# Riris Emporium - E-Commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase.

## 📋 Quick Start

```bash
cd app
npm install
npm run dev
# Visit http://localhost:5173
```

## 🛠️ Technology Stack

### Frontend
- **React 18** + TypeScript for type safety
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Router DOM** for routing
- **Zustand** for state management
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Node.js + Express** (optional API fallback)

## 🏗️ Project Structure

```
riri5/
├── app/                          # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Layout wrappers
│   │   │   ├── product/         # Product components
│   │   │   ├── cart/            # Cart components
│   │   │   └── ui/              # Base UI components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── UserOrders.tsx   # User's orders (user only)
│   │   │   ├── OrderDetail.tsx
│   │   │   └── ...
│   │   ├── services/            # API & Supabase integration
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── cartService.ts
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state stores
│   │   ├── lib/                 # Utility libraries
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   └── utils.ts
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
└── server/                       # Optional Node.js API
```

## 🔐 Environment Setup

Create `app/.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from [Supabase Dashboard](https://app.supabase.com) → Settings → API.

## 🚀 Key Features

### User Features
- ✅ **Authentication** (Sign up / Login / Forgot password)
- ✅ **Product Browsing** (Categories, filters, search)
- ✅ **Shopping Cart** (Add/remove/update items)
- ✅ **Checkout** (Supabase Postgres backend)
- ✅ **Order Tracking** (View order history and status)
- ✅ **User Profile** (Update personal info)

### Admin Features
- ✅ **Product Management** (Create, edit, delete products)
- ✅ **User Management** (View and manage users)
- ✅ **Order Management** (View all orders, update status)
- ✅ **Admin Dashboard** (Analytics and quick stats)
- ✅ **Admin Orders** (`/admin/orders` - all orders)

### User Orders Route
- `/orders` → Shows **user's own orders** only
  - Protected route (login required)
  - Wrapped with Layout
  - Click "View" to see order details
  - Empty state when no orders

### Admin Orders Route
- `/admin/orders` → Shows **all orders in system**
  - Admin-only access
  - Search and filter by status
  - Can update order status
  - Shows customer details

## 📦 Services

### authService.ts
```typescript
- register(email, password, name, lastName)
- login(email, password)
- logout()
- getCurrentUser()
- updateProfile(data)
- changePassword(newPassword)
- forgotPassword(email)
- resetPassword(token, newPassword)
```

### productService.ts
```typescript
- getProducts(options)
- getProduct(id)
- getCategories()
- getProductsByCategory(category)
- getFeaturedProducts()
- createProduct(data)           // Admin only
- updateProduct(id, data)       // Admin only
- deleteProduct(id)             // Admin only
- addReview(productId, review)
```

### orderService.ts
```typescript
- createOrder(orderData)
- getOrders()                   // User's orders
- getOrder(id)
- getAllOrders()                // Admin: all orders
- updateOrderStatus(id, status) // Admin only
- cancelOrder(id)
```

### cartService.ts
```typescript
- getCart()
- addItem(productId, quantity)
- updateItem(itemId, quantity)
- removeItem(itemId)
- clearCart()
- applyCoupon(code)
- removeCoupon()
```

## 🔒 Security & Row Level Security (RLS)

All data access is controlled by Supabase RLS policies:

- **users table** - Users can only read/update their own profile
- **orders table** - Users can only see their own orders; admins see all
- **products table** - Public read; admin-only write
- **reviews table** - Authenticated users can create; public can read

## 🎨 Styling

- **Color Scheme**: Warm, earthy tones
  - Primary: `#8B5A2B` (Brown)
  - Secondary: `#A67B5B` (Tan)
  - Light: `#F5F1E8` (Beige)
  - Border: `#E8DFD0` (Light tan)

- **Font**: Playfair Display (headers), Default (body)

## 🚦 Routes

### Public Routes
- `/` - Home page
- `/shop` - Product listing
- `/product/:id` - Product details
- `/about`, `/contact`, `/faq` - Info pages
- `/login`, `/register` - Auth pages

### Protected Routes (login required)
- `/profile` - User profile
- `/orders` - User's order history
- `/orders/:id` - Order details
- `/cart`, `/checkout` - Checkout flow

### Admin Routes (admin only)
- `/admin` - Admin dashboard
- `/admin/products` - Manage products
- `/admin/products/add` - Add new product
- `/admin/orders` - Manage all orders
- `/admin/users` - Manage users

## 🛢️ Database Schema

### Tables
- **users** - User profiles
- **products** - Product catalog
- **categories** - Product categories
- **cart_items** - Shopping cart
- **orders** - Customer orders
- **order_items** - Order line items
- **reviews** - Product reviews
- **coupons** - Discount codes

## 🧪 Testing

1. **User Registration & Login**
   - Sign up as new user
   - Login with credentials
   - Update profile

2. **Products & Shopping**
   - Browse products
   - Filter by category
   - Add to cart
   - Update quantities

3. **Checkout & Orders**
   - Complete checkout
   - View order in `/orders`
   - Admin views in `/admin/orders`

## 📝 Common Tasks

### Add a New Page
```typescript
// 1. Create src/pages/NewPage.tsx
export const NewPage = () => {
  return <Layout>{/* your content */}</Layout>;
};

// 2. Add to App.tsx routes
const NewPage = React.lazy(() => import('./pages/NewPage').then(m => ({ default: m.NewPage })));
<Route path="/new-page" element={<Layout><NewPage /></Layout>} />
```

### Add a New Service Method
```typescript
// src/services/exampleService.ts
export const exampleService = {
  getData: async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    if (error) throw error;
    return data;
  }
};
```

### Add Admin-Only Feature
```typescript
// Use AdminRoute wrapper in App.tsx
<Route
  path="/admin/new-feature"
  element={
    <AdminRoute>
      <NewAdminPage />
    </AdminRoute>
  }
/>
```

## 🐛 Troubleshooting

**Issue**: "Admin access required" but you're admin
- Check: `isAdmin` flag in useAuth hook
- Check: User role in Supabase

**Issue**: Can't see orders in `/orders`
- Check: User logged in
- Check: Orders exist in database with user_id match
- Check: RLS policies allow access

**Issue**: Admin can't see all orders in `/admin/orders`
- Check: User has admin role
- Check: AdminRoute is protecting the route

**Issue**: Cart not persisting
- Check: Zustand store is persisting to localStorage
- Check: Browser's local storage not cleared

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is private and not licensed for public use.
#   R i r i s - E m p o r i u m  
 