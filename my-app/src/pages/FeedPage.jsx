import React, { useState, useEffect } from "react";
import FeedCard from "../components/FeedCard";
import postsData from "../data/postsData";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);

  // Simulate fetching from backend
  useEffect(() => {
    setTimeout(() => setPosts(postsData), 500);
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0D0B] p-6">
      <h1 className="text-2xl font-semibold text-[#C6B29A] text-center mb-8">
        Personalized AI Feed
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => <FeedCard key={post.id} post={post} />)
        ) : (
          <p className="text-center text-[#C6B29A]">Loading feed...</p>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
