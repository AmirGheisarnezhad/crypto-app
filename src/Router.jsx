import { lazy, useContext } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./Context/AuthContext";
import ProtectedRoute from "../src/components/ProtectedRoute/ProtectedRoute"; // 🔹 اضافه شد
import MainLayout from "./components/Layouts/MainLayout";
import LoginPage from "./Pages/LoginPage";

const HomePage = lazy(() => import("./Pages/HomePage"));
const CoinsDetailsPage = lazy(() => import("./Pages/CoinsDetailsPage"));
const CoinChartPage = lazy(() => import("./Pages/CoinChartPage"));
const ExchangesPage = lazy(() => import("./Pages/ExchangesPage"));
const ExchangeDetailsPage = lazy(() => import("./Pages/ExchangeDetailsPage"));

export default function RouterComponent() {
  const { isAuthenticated } = useContext(AuthContext);
//
  return (
    <HashRouter>
      <Routes>
        {/* 📌 مسیر لاگین همیشه در دسترس است */}
        <Route path="/login" element={<LoginPage />} />

        {/* 📌 مسیرهای محافظت‌شده فقط در صورت لاگین بودن نمایش داده می‌شوند */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/coin/:coin_id" element={<CoinsDetailsPage />} />
            <Route path="/coin/:coin_id/chart" element={<CoinChartPage />} />
            <Route path="/exchanges" element={<ExchangesPage />} />
            <Route path="/exchange/:id" element={<ExchangeDetailsPage />} />
          </Route>
        </Route>

        {/* 📌 مسیر پیش‌فرض برای ریدایرکت کاربران غیرمجاز */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </HashRouter>
  );
}
