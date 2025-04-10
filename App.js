import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Outlet,
  Navigate,
} from "react-router-dom";
import "./App.css";
import SearchPage from "./SearchPage";
import FilteredNewsPage from "./FilteredNewsPage";

const countries = [
  "United States", "India", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "China", "Japan", "Brazil", "South Africa"
];

const tags = [
  { name: "Politics", color: "#E63946" },
  { name: "Business & Economy", color: "#457B9D" },
  { name: "Health", color: "#2A9D8F" },
  { name: "Technology", color: "#8A3FFC" },
  { name: "Science", color: "#E9C46A" },
  { name: "Sports", color: "#F4A261" },
  { name: "Entertainment", color: "#E76F51" }
];

// Login Page Component
const LoginPage = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "demo" && password === "password") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
    } else {
      setError("Invalid credentials. Try username: demo, password: password");
    }
  };

  return (
    <div className="login-container">
      <h1>Login to Daily Pulse</h1>
      <form onSubmit={handleLogin}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Main News App Component
const NewsApp = ({ setIsAuthenticated }) => {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [scrollIndex, setScrollIndex] = useState(0);
  const [articles, setArticles] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCountryPrompt, setShowCountryPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      const apiKey = "976f973c-69e0-4825-b693-86dd145aa4c5";
      const baseUrl = "https://content.guardianapis.com/search";
      const params = {
        "api-key": apiKey,
        "order-by": "newest",
        "page-size": 8,
        "show-fields": "headline,thumbnail,trailText"
      };

      try {
        const response = await fetch(`${baseUrl}?${new URLSearchParams(params)}`);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.response.results);
        } else {
          console.error("Failed to fetch news:", response.status);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && search.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    if (selectedCountry) {
      navigate(`/filtered-news?tag=${encodeURIComponent(tag)}&country=${encodeURIComponent(selectedCountry)}`);
    } else {
      setShowCountryPrompt(true);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    if (selectedTag) {
      navigate(`/filtered-news?tag=${encodeURIComponent(selectedTag)}&country=${encodeURIComponent(country)}`);
    }
    setShowCountryPrompt(false);
  };

  const scrollLeft = () => {
    setScrollIndex((prev) => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    setScrollIndex((prev) => Math.min(prev + 1, articles.length - 3));
  };

  const speakArticle = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="header-bar">
        <h1 className="heading">&nbsp;&nbsp;&nbsp;The Daily Pulse 📡</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="content">
        <input
          type="text"
          placeholder="🔍 Search news..."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <h2 className="section-title">📢 Prime Bulletin</h2>
        <div className="insights-container">
          <button className="scroll-button left" onClick={scrollLeft}>&#9664;</button>
          <div className="insights-wrapper" style={{ transform: `translateX(-${scrollIndex * 220}px)` }}>
            {articles.map((article, index) => (
              <div 
                key={index} 
                className="insight-box"
                onClick={() => speakArticle(`${article.webTitle}. ${article.fields.trailText}`)}
              >
                <img 
                  src={article.fields?.thumbnail || "https://via.placeholder.com/150"} 
                  alt={article.webTitle} 
                  className="article-thumbnail"
                />
                <h3 className="article-title">{article.webTitle}</h3>
              </div>
            ))}
          </div>
          <button className="scroll-button right" onClick={scrollRight}>&#9654;</button>
        </div>

        <h2 className="section-title">🔥 Popular Tags</h2>
        <div className="tags-container">
          {tags.map((tag) => (
            <span 
              key={tag.name} 
              className="tag-box" 
              style={{ backgroundColor: tag.color, cursor: "pointer" }}
              onClick={() => handleTagClick(tag.name)}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {(showCountryPrompt || selectedTag) && (
          <>
            <h3 className="section-title" style={{ marginTop: "1rem" }}>🌍 Choose a country as well</h3>
            <select className="dropdown" value={selectedCountry} onChange={handleCountryChange}>
              <option value="">Select a Country</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<NewsApp setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/filtered-news" element={<FilteredNewsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
