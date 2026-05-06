import { BrowserRouter, Routes, Route } from "react-router-dom";

import OpportunitiesPage from "./pages/OpportunitiesPage";
import WorkforcePage from "./pages/WorkforcePage";
import DeepMindPage from "./pages/DeepMindPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OpportunitiesPage />} />
        <Route path="/workforce" element={<WorkforcePage />} />
        <Route path="/deep-mind" element={<DeepMindPage />} />
      </Routes>
    </BrowserRouter>
  );
}
