import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";


const HomePage = lazy(() => import("./Pages/HomePage"));
const CoinsDetailsPage = lazy(() => import("./Pages/CoinsDetailsPage"));
const CoinChartPage = lazy(() => import("./Pages/CoinChartPage"));
const ExchangesPage = lazy(() => import("./Pages/ExchangesPage"));
const ExchangeDetailsPage = lazy(() => import("./Pages/ExchangeDetailsPage"));

export default function RouterComponent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/coin/:coin_id" element={<CoinsDetailsPage />} />
          <Route path="/coin/:coin_id/chart" element={<CoinChartPage />} />
          <Route path="/exchanges" element={<ExchangesPage /> }></Route>
          <Route path="/exchange/:id" element={<ExchangeDetailsPage />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}
