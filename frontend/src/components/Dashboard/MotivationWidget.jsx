import { useState, useEffect } from 'react';

const motivationQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The future depends on what you do today. - Mahatma Gandhi",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "The person who says it cannot be done should not interrupt the person doing it. - Chinese Proverb",
  "You miss 100% of the shots you don't take. - Wayne Gretzky",
  "Whether you think you can or you think you can't, you're right. - Henry Ford",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  "Go confidently in the direction of your dreams. Live the life you have imagined. - Henry David Thoreau",
  "The harder I work, the luckier I get. - Samuel Goldwyn",
  "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart. - Roy T. Bennett",
  "It always seems impossible until it's done. - Nelson Mandela",
  "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
];

const MotivationWidget = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Get quote of the day based on the date
    const today = new Date().getDate();
    const quoteIndex = today % motivationQuotes.length;
    setQuote(motivationQuotes[quoteIndex]);
  }, []);

  if (!quote) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-start gap-3">
        <div className="text-3xl">✨</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">Daily Motivation</h3>
          <p className="text-white/90 italic">"{quote}"</p>
        </div>
      </div>
    </div>
  );
};

export default MotivationWidget;
