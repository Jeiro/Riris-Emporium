import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { useAuth } from './hooks';

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = React.lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const OrderDetail = React.lazy(() => import('./pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const FAQ = React.lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const Shipping = React.lazy(() => import('./pages/Shipping').then(m => ({ default: m.Shipping })));
const Returns = React.lazy(() => import('./pages/Returns').then(m => ({ default: m.Returns })));
const Privacy = React.lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = React.lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Cookies = React.lazy(() => import('./pages/Cookies').then(m => ({ default: m.Cookies })));
const SizeGuide = React.lazy(() => import('./pages/SizeGuide').then(m => ({ default: m.SizeGuide })));
const Careers = React.lazy(() => import('./pages/Careers').then(m => ({ default: m.Careers })));
const Press = React.lazy(() => import('./pages/Press').then(m => ({ default: m.Press })));
const Wishlist = React.lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const CartPage = React.lazy(() => import('./pages/Cart').then(m => ({ default: m.CartPage })));
const UserOrders = React.lazy(() => import('./pages/UserOrders').then(m => ({ default: m.UserOrders })));

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('./pages/admin').then(m => ({ default: m.AdminProducts })));
const AddProductPage = React.lazy(() => import('./pages/admin/AddProduct').then(m => ({ default: m.AddProductPage })));
const AdminOrders = React.lazy(() => import('./pages/admin').then(m => ({ default: m.AdminOrders })));
const AdminUsers = React.lazy(() => import('./pages/admin').then(m => ({ default: m.AdminUsers })));
const AdminSettings = React.lazy(() => import('./pages/admin').then(m => ({ default: m.AdminSettings })));
const EditProductPage = React.lazy(() => import('./pages/admin').then(m => ({ default: m.EditProductPage })));

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B]"></div></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/shop" element={<Layout><Shop /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/shipping" element={<Layout><Shipping /></Layout>} />
            <Route path="/returns" element={<Layout><Returns /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
            <Route path="/size-guide" element={<Layout><SizeGuide /></Layout>} />
            <Route path="/careers" element={<Layout><Careers /></Layout>} />
            <Route path="/press" element={<Layout><Press /></Layout>} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/checkout"
              element={
                <Layout>
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <ProtectedRoute>
                    <UserOrders />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <Layout>
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <Layout>
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/cart"
              element={<Layout><CartPage /></Layout>}
            />

            {/* Admin Routes - No Layout wrapper as AdminLayout is inside each page */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/add"
              element={
                <AdminRoute>
                  <AddProductPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <EditProductPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-[#8B5A2B] mb-4">404</h1>
                      <h2 className="text-2xl font-semibold text-[#5D3A1A] mb-4">Page Not Found</h2>
                      <p className="text-[#A67B5B] mb-6">The page you&apos;re looking for doesn&apos;t exist</p>
                      <a href="/" className="btn-primary">Go Home</a>
                    </div>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #E8DFD0',
            color: '#5D3A1A',
          },
        }}
      />
    </>
  );
}

export default App;
