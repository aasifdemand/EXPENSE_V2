import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFetchSessionUserQuery, useGetUsersQuery } from "./store/authApi";
import { SocketProvider } from "./contexts/SocketContext";
import Loader from "./components/ui/Loader";

// Layouts
const UserLayout = lazy(() => import("./layouts/UserLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));

// User Pages
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const UserBudgeting = lazy(() => import("./pages/user/budgeting/Budgeting"));
const UserExpenses = lazy(() => import("./pages/user/expenses/Expenses"));
const UserSettings = lazy(() => import("./pages/user/settings/Settings"));
const UserReimbursements = lazy(() => import("./pages/user/reimbursements/Reimbursements"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBudget = lazy(() => import("./pages/admin/budget/Budget"));
const AdminExpenses = lazy(() => import("./pages/admin/expenses/Expenses"));
const AdminReimbursements = lazy(() => import("./pages/admin/reimbursements/Reimbursements"));
const AdminReport = lazy(() => import("./pages/admin/report/Report"));
const AdminUser = lazy(() => import("./pages/admin/user/User"));
const AdminSettings = lazy(() => import("./pages/admin/settings/Settings"));

// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Qr = lazy(() => import("./pages/auth/Qr"));

const App = () => {
  const { isAuthenticated, isTwoFactorPending, isTwoFactorVerified, role } =
    useSelector((state) => state?.auth || {});

  // Fetch session on mount (RTK Query)
  useFetchSessionUserQuery();

  // Fetch all users for admin (RTK Query)
  useGetUsersQuery(undefined, {
    skip:
      role !== "superadmin" ||
      !isAuthenticated ||
      isTwoFactorPending ||
      !isTwoFactorVerified,
  });


  return (
    <SocketProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Auth Layout Wrapper */}
          <Route element={<AuthLayout />}>
            {/* 2FA */}
            <Route
              path="/qr"
              element={
                isTwoFactorPending ? (
                  <Qr />
                ) : isAuthenticated ? (
                  role === "superadmin" ? (
                    <Navigate to="/admin/dashboard" />
                  ) : (
                    <Navigate to="/user/dashboard" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Login */}
            <Route
              path="/login"
              element={
                isAuthenticated && !isTwoFactorPending ? (
                  role === "superadmin" ? (
                    <Navigate to="/admin/dashboard" />
                  ) : (
                    <Navigate to="/user/dashboard" />
                  )
                ) : (
                  <Login />
                )
              }
            />
          </Route>


          {/* User Routes */}
          <Route
            path="/user"
            element={
              isAuthenticated && !isTwoFactorPending && role === "user" ? (
                <UserLayout />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="budgeting" element={<UserBudgeting />} />
            <Route path="expenses" element={<UserExpenses />} />
            <Route path="reimbursements" element={<UserReimbursements />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              isAuthenticated && !isTwoFactorPending && role === "superadmin" ? (
                <AdminLayout />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="budget" element={<AdminBudget />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="reimbursements" element={<AdminReimbursements />} />
            <Route path="report" element={<AdminReport />} />
            <Route path="user" element={<AdminUser />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all for undefined routes until layouts are ready */}
          <Route
            path="*"
            element={
              role === "superadmin" && isAuthenticated ? (
                <Navigate to="/admin/dashboard" />
              ) : role === "user" && isAuthenticated ? (
                <Navigate to="/user/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Suspense>
    </SocketProvider>
  );

};

export default App;
