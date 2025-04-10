import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./SearchPage.css"; // Import CSS for styling

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [searchResults, setSearchResults] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if speech is active
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [speechRate, setSpeechRate] = useState(1); // Default speech rate
  const [femaleVoice, setFemaleVoice] = useState(null); // Female voice

  // Fetch search results from The Guardian API
  useEffect(() => {
    const fetchSearchResults = async () => {
      const apiKey = "976f973c-69e0-4825-b693-86dd145aa4c5";
      const baseUrl = "https://content.guardianapis.com/search";
      const params = {
        "api-key": apiKey,
        "q": query, // Use the search query
        "show-fields": "headline,thumbnail,trailText" // Include necessary fields
      };

      try {
        const response = await fetch(`${baseUrl}?${new URLSearchParams(params)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.response.results);
        } else {
          console.error("Failed to fetch search results:", response.status);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  // Load female voice when the component mounts
  useEffect(() => {
    const loadFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find((voice) => voice.name.includes("Female"));
      if (femaleVoice) {
        setFemaleVoice(femaleVoice);
      }
    };

    // Load voices when the voices are changed
    window.speechSynthesis.onvoiceschanged = loadFemaleVoice;
    loadFemaleVoice(); // Initial load
  }, []);

  // Function to extract full article text from the article URL
  const extractFullArticleText = async (url) => {
    try {
      // Use a proxy server to bypass CORS restrictions
      const proxyUrl = "https://api.allorigins.win/raw?url="; // Reliable proxy
      const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Extract text content from the article body
        const articleBody = doc.querySelector(".article-body") || doc.querySelector(".article-body-commercial-selector");
        if (articleBody) {
          return articleBody.textContent.trim(); // Return the full text content
        } else {
          console.error("Article body not found.");
          return null;
        }
      } else {
        console.error("Failed to fetch article:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      return null;
    }
  };

  // Text-to-speech function for full article
  const speakFullArticle = async (url) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); // Stop speaking if already speaking
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true); // Show loading indicator
    const articleText = await extractFullArticleText(url); // Extract full article text
    setIsLoading(false); // Hide loading indicator

    if (!articleText) {
      alert("Failed to fetch article content.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(articleText);
    utterance.lang = "en-US"; // Set language
    utterance.rate = speechRate; // Set speech rate
    utterance.pitch = 1; // Pitch of speech

    // Use female voice if available
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false); // Reset speaking state when done
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="search-container">
      <h1 className="search-heading">Search Page</h1>
      <h2 className="search-query">Results for: "{query}"</h2>

      {isLoading && <div className="loading-indicator">Loading article content...</div>}

      {/* Speed control bar */}
      <div className="speed-control">
        <label htmlFor="speed">Speech Speed:</label>
        <input
          type="range"
          id="speed"
          min="0.5"
          max="2"
          step="0.1"
          value={speechRate}
          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
        />
        <span>{speechRate.toFixed(1)}x</span>
      </div>

      <div className="results-container">
        {searchResults.map((article, index) => (
          <div 
            key={index} 
            className="result-box"
            onClick={() => speakFullArticle(article.webUrl)} // Pass the article URL to extract and read
          >
            <img 
              src={article.fields?.thumbnail || "https://via.placeholder.com/150"} 
              alt={article.webTitle} 
              className="article-thumbnail"
            />
            <h3 className="article-title">{article.webTitle}</h3>
            <p className="article-description">{article.fields.trailText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;