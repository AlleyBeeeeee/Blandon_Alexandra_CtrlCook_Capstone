import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";

//  all pages
import SearchView from "./pages/SearchView";
import MyCookbook from "./pages/MyCookbook";
import EditorView from "./pages/EditorView";
import LoginView from "./pages/LoginView";
import NotFound from "./pages/NotFound";
import "./App.css"; // imports global styles

// sets the default express server host for all axios requests
axios.defaults.baseURL = "http://localhost:5000";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<SearchView />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/cookbook" element={<MyCookbook />} />
          <Route path="/editor/:id" element={<EditorView />} />

          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<LoginView />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
