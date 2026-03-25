import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFetchSessionUserQuery, useGetUsersQuery } from "./store/authApi";
import { SocketProvider } from "./contexts/SocketContext";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserBudgeting from "./pages/user/budgeting/Budgeting";
import UserExpenses from "./pages/user/expenses/Expenses";
import UserSettings from "./pages/user/settings/Settings";
import UserReimbursements from "./pages/user/reimbursements/Reimbursements";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBudget from "./pages/admin/budget/Budget";
import AdminExpenses from "./pages/admin/expenses/Expenses";
import AdminReimbursements from "./pages/admin/reimbursements/Reimbursements";
import AdminReport from "./pages/admin/report/Report";
import AdminUser from "./pages/admin/user/User";
import AdminSettings from "./pages/admin/settings/Settings";

import Login from "./pages/auth/Login";
import Qr from "./pages/auth/Qr";

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
    </SocketProvider>
  );
};

export default App;
