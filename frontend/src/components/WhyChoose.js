import React from "react";
import { FaLock, FaBookOpen, FaChartLine } from "react-icons/fa";

const WhyChoose = () => {
  return (
    <section className=" w-full py-16 font-times px-6 md:px-20 bg-[#f5f7f6] text-center">
      <h2 className="text-2xl text-gray-800 md:text-3xl font-bold mb-10">
        Why Choose UNICARE?
      </h2>
      <div className="grid grid-cols-1 h-auto md:grid-cols-3 gap-6 justify-center">
        <FeatureCard
          icon={<FaLock size={40} className="text-green-800" />}
          title="Confidential"
          description="Secure and private counseling sessions"
        />
        <FeatureCard
          icon={<FaBookOpen size={40} className="text-green-800 " />}
          title="Resources"
          description="Mental health articles, Self-help tools, Educational videos"
        />
        <FeatureCard
          icon={<FaChartLine size={40} className="text-green-800" />}
          title="Mood Tracking"
          description="Monitor your mental health journey"
        />
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="border rounded-xl shadow-sm hover:shadow-lg transition duration-300 transform hover:scale-105 text-center px-6 py-8 z-10 hover:z-20">
    <div className="flex justify-center items-center mb-4">{icon}</div>
    <h3 className="text-[30px] font-semibold mb-2">{title}</h3>
    <p className="text-[28px] text-gray-600">{description}</p>
  </div>
);

export default WhyChoose;
