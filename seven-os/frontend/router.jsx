import { BrowserRouter, Routes, Route } from "react-router-dom";

import OpportunitiesPage from "../hooks/pages/OpportunitiesPage.jsx";
import WorkforcePage from "../hooks/pages/WorkforcePage.jsx";
import DeepMindPage from "../hooks/pages/DeepMindPage.jsx";

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
