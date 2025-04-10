import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./FilteredNewsPage.css"; // Import CSS for styling

const FilteredNewsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tag = queryParams.get("tag");
  const country = queryParams.get("country");

  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1); // Speech speed control (default: normal speed)

  // Fetch filtered news articles based on tag and country
  useEffect(() => {
    const fetchFilteredNews = async () => {
      setIsLoading(true);
      const apiKey = "976f973c-69e0-4825-b693-86dd145aa4c5";
      const baseUrl = "https://content.guardianapis.com/search";
      const params = {
        "api-key": apiKey,
        "q": `${tag} ${country}`,
        "show-fields": "headline,thumbnail,trailText,bodyText"
      };

      try {
        const response = await fetch(`${baseUrl}?${new URLSearchParams(params)}`);
        if (response.ok) {
          const data = await response.json();
          setFilteredArticles(data.response.results);
        } else {
          console.error("Failed to fetch filtered news:", response.status);
        }
      } catch (error) {
        console.error("Error fetching filtered news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tag && country) {
      fetchFilteredNews();
    }
  }, [tag, country]);

  // Text-to-speech function
  const speakArticle = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speechRate; // Set speech speed dynamically
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="filtered-news-container">
      <h1 className="filtered-news-heading">Filtered News</h1>
      <h2 className="filtered-news-subheading">
        Showing results for: <span className="highlight">{tag}</span> in <span className="highlight">{country}</span>
      </h2>

      {isLoading && <div className="loading-indicator">Loading articles...</div>}

      {/* Speech Speed Control */}
      <div className="speech-control">
        <label htmlFor="speechRate">Adjust Speed: {speechRate.toFixed(1)}x</label>
        <input
          id="speechRate"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speechRate}
          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
        />
      </div>

      <div className="filtered-articles-container">
        {filteredArticles.map((article, index) => (
          <div
            key={index}
            className="filtered-article-box"
            onClick={() => speakArticle(`${article.webTitle}. ${article.fields.bodyText}`)}
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

export default FilteredNewsPage;
