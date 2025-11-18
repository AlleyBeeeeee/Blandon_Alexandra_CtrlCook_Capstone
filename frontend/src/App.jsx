import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // imports routing components.
import axios from "axios"; // imports axios
import Navbar from "./components/Layout/Navbar";
import "./App.css";

axios.defaults.baseURL = "http://localhost:5000"; // sets the default express server host

function App() {
  return (
    <Router>
      <Navbar />
      <div>
        {/* <Routes> */}
        {/* routes for user authentication. */}
        {/* <Route path="/login" element={<LoginView />} /> */}
        {/* <Route path="/register" element={<LoginView />} /> */}
        {/* catch-all route (path="*") displays the notfound component for any unmatched url */}
        {/* <Route path="*" element={<NotFound />} /> */}
        {/* </Routes> */}
      </div>
    </Router>
  );
}

export default App;
