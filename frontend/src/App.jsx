import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router";
import { BarChart3, ShieldCheck } from "lucide-react";

import Home from "./pages/Home";
import TrainResults from "./pages/TrainResults";
import LiveStatus from "./pages/LiveStatus";
import TrainDetails from "./pages/TrainDetails";
import ControllerDashboard from "./pages/ControllerDashboard";
import BenchmarkingDemo from "./pages/BenchmarkingDemo";

const AppNavigation = () => {
  const location = useLocation();

  if (
    location.pathname === "/controller" ||
    location.pathname === "/controller/benchmark"
  ) {
    return (
      <div className="fixed right-5 top-4 z-[9999] flex items-center gap-2">
        <Link
          to="/controller"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-lg transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <ShieldCheck size={17} />
          <span>Control Center</span>
        </Link>

        <Link
          to="/controller/benchmark"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-lg transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <BarChart3 size={17} />
          <span>Evaluation</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed right-5 top-4 z-[9999]">
      <Link
        to="/controller"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-lg transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
      >
        <ShieldCheck size={17} />
        <span>Control Center</span>
      </Link>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppNavigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/train-results" element={<TrainResults />} />
        <Route path="/live-status" element={<LiveStatus />} />
        <Route path="/train/:trainNumber" element={<TrainDetails />} />
        <Route path="/controller" element={<ControllerDashboard />} />
        <Route
          path="/controller/benchmark"
          element={<BenchmarkingDemo />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;