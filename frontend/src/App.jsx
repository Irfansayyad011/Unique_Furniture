import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));

const PublicLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
    <CartDrawer />
    <Footer />
  </>
);

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '1rem', color: 'var(--text-muted)' }}>Authenticating...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '1rem', color: 'var(--text-muted)' }}>Loading...</div>
);

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:category" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route element={<ProtectedRoute roles={['customer']} />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                  </Route>
                </Route>

                <Route path="/admin/login" element={<AuthPage />} />
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                <Route element={<ProtectedRoute roles={['owner']} />}>
                  <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                </Route>

                <Route element={<ProtectedRoute roles={['admin', 'owner']} />}>
                  <Route path="/admin/products/new" element={<ProductForm />} />
                  <Route path="/admin/products/:id/edit" element={<ProductForm />} />
                  <Route path="/owner/products/new" element={<ProductForm />} />
                  <Route path="/owner/products/:id/edit" element={<ProductForm />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>

          <Toaster
            position="bottom-right"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: { iconTheme: { primary: '#5C3D2E', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
