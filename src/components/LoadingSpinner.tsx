import React, { useState, useEffect } from "react";
import "./LoadingSpinner.css";

const funFacts = [
  "Did you know? Building habits takes 21 days on average!",
  "Fun fact: 80% of New Year's resolutions fail by February!",
  "Stay consistent—streaks are the key to success!",
  "Fun fact: People are 42% more likely to achieve goals if they write them down!",
  "Listening to the same song every time you start a habit can trick your brain into craving it—hello, Pavlov!"
];

const LoadingSpinner: React.FC = () => {
  const [fact, setFact] = useState(funFacts[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
      setFact(randomFact);
    }, 3000); // Change fact every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Tracking your habits... Hang tight!</p>
      <p className="fun-fact">{fact}</p>
    </div>
  );
};

export default LoadingSpinner;