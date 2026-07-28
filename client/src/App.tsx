import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Nav } from "./components/Nav";
import { DashboardPage } from "./routes/DashboardPage";
import { CategoriesPage } from "./routes/CategoriesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
