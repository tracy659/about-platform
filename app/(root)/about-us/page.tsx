import Agent from "@/components/Agent";
import React from "react";

const AboutUsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <Agent userName={""} type={"generate"} />
    </div>
  );
};

export default AboutUsPage;
