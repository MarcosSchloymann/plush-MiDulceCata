import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { ProductsPage } from "@/pages/admin/ProductsPage";
import { ProductEditorPage } from "@/pages/admin/ProductEditorPage";
import { SocialPage } from "@/pages/admin/SocialPage";
import { AppearancePage } from "@/pages/admin/AppearancePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="productos/nuevo" element={<ProductEditorPage />} />
        <Route path="productos/:id" element={<ProductEditorPage />} />
        <Route path="redes" element={<SocialPage />} />
        <Route path="apariencia" element={<AppearancePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
