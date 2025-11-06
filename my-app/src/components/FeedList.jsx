import React, { useEffect, useState } from "react";
import FeedCard from "./FeedCard";
import { feedData } from "../data/postData";

const FeedList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Simulating backend fetch
    setTimeout(() => {
      setPosts(feedData);
    }, 500);
  }, []);

  return (
    <div className="bg-[#3A2E22] min-h-screen py-10 px-6">
      <h2 className="text-[#F3E5D8] text-2xl font-bold mb-6 text-center">
        Latest Insights 🔍
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
        {posts.length > 0 ? (
          posts.map((post) => <FeedCard key={post.id} post={post} />)
        ) : (
          <p className="text-[#C6B29A] text-center">Loading feed...</p>
        )}
      </div>
    </div>
  );
};

export default FeedList;
