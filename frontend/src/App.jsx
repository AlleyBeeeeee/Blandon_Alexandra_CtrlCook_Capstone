import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ViewRecipe from "./pages/ViewRecipe.jsx";
import CustomizeRecipe from "./pages/CustomizeRecipe.jsx";
import MyCookBook from "./pages/MyCookBook.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import RandomRecipe from "./pages/RandomRecipe.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/recipe/:id" element={<ViewRecipe />} />
        <Route path="/view/:id" element={<ViewRecipe />} />
        <Route path="/customize" element={<CustomizeRecipe />} />
        <Route path="/customize/:id" element={<CustomizeRecipe />} />
        <Route path="/mycookbook" element={<MyCookBook />} />
        <Route path="/random" element={<RandomRecipe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
