import { NextPage } from "next";
import React, { useEffect } from "react";

const Recursion: NextPage = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
  }, []);

  return (
    <div>
      <h2>You have now reached the fourth level of recursion!!</h2>
    </div>
  );
};

export default Recursion;
