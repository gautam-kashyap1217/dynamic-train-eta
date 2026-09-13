import { BrowserRouter, Routes, Route } from "react-router";

import Home from "./pages/Home";
import TrainResults from "./pages/TrainResults";
import LiveStatus from "./pages/LiveStatus";
import TrainDetails from "./pages/TrainDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/train-results"
          element={<TrainResults />}
        />

      <Route 
      path="/live-status" 
      element={<LiveStatus />} 
      />

        <Route
          path="/train/:trainNumber"
          element={<TrainDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;