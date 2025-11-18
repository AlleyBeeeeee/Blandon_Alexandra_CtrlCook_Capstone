import { useState } from "react";
import Navbar from "./components/Layout/Navbar";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          {/* routes for user authentication. */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<LoginView />} />
          {/* catch-all route (path="*") displays the notfound component for any unmatched url */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
