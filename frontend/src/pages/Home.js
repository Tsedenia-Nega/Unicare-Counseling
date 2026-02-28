import React from "react";
import { useNavigate,Link } from "react-router-dom";
import WhyChoose from "../components/WhyChoose";
import Chatbot from "./ChatBot";
import Service from "../pages/CounselingServices";
import TeamSection from "../components/TeamSection";
import Footer from "../components/Footer";
const Home = () => {
  return (
    <div className="relative ">
      {/* Hero Section with full-height image split */}
      <div className="w-full min-h-screen  md:min-h-[140vh] font-times bg-gray-100 flex flex-col md:flex-row mt-0 ">
        {/* Left: Background image with content */}
        <div
          className="flex-1 relative flex flex-col justify-start pt-32 md:justify-center items-center text-center bg-cover bg-center "
          style={{ backgroundImage: "url('/images/home3.png')" }}
        >
          {/* Overlay for contrast */}
          <div className="absolute inset-0 bg-white/40 z-0"></div>

          <div className="relative z-10 px-6 text-white">
            <h2 className="text-[45px] md:text-5xl font-semibold  mb-4 leading-snug">
              Unicare
            </h2>

            <h1 className="text-[45px] md:text-5xl font-semibold  mb-4 leading-snug">
              "Your Safe Space for
              <br />
              Guidance & Support"
            </h1>

            <h2 className="text-[20px]  mt-4">
              we provide professinal support to help
              <br />
              navigate life's challenges
              <br />
            </h2>

            {/* Dots */}
            <div className="flex justify-center items-center space-x-2 mt-4 mb-4">
              <span className="w-3 h-3 rounded-full bg-white"></span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
            </div>
            {/* Button */}
            <Link to="/signup">
              <button className="bg-[#3B7962] hover:bg-[#133529] w-48 text-white px-4 py-2 rounded-full shadow transition text-[20px]">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </div>
      <WhyChoose />
      <TeamSection />
      <Service />
      <Chatbot />
      <Footer />
    </div>
  );
};
export default Home;
