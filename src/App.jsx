import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Auth pages
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import Documentation from "./pages/Documentation";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import UserManagement from "./pages/UserManagement";


import "./App.css";
import { Toaster } from "react-hot-toast";
import FAQ from "./pages/FAQ";
import Quote from "./pages/Quote";
import Checkouts from "./pages/Checkout";

function App() {
  return (
    <>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route path="/auth/verify-otp" element={<VerifyOTP />} />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route path="/d/docs" element={<Documentation />} />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />

                          <Route path="/dashboard" element={<Dashboard />} />

                          <Route path="/products">
                            <Route path="" element={<Products />} />
                            {/* <Route path="categories" element={<Categories />} /> */}
                          </Route>

                          <Route path="/users" element={<UserManagement />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/quotes" element={<Quote />} />
                          <Route path="/checkouts" element={<Checkouts />} />

                          <Route path="/settings">
                            <Route
                              path=""
                              element={
                                <div className="p-6">
                                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Settings
                                  </h1>
                                </div>
                              }
                            />
                            <Route
                              path="change-password"
                              element={<ChangePassword />}
                            />
                          </Route>

                          <Route path="/docs" element={<Documentation />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthProvider>
          </Router>
        </AppProvider>
      </ThemeProvider>

      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}

export default App;
