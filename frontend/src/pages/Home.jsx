import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import logo from "../assets/CClogo.png";

function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="home-container">
      <div className="logo-container">
        <img src={logo} alt="Ctrl + Cook Logo" className="logo" />
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-buttons">
          <button type="submit" className="btn">
            Search
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/random")}
          >
            I'm Feeling Lucky
          </button>
        </div>
      </form>
    </div>
  );
}

export default Home;
