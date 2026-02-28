import React from "react";
import {
  FaLinkedin,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#dad5cd] py-3 px-10 font-times text-black ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col items-center text-[17px]  text-center space-y-3 md:ml-[25rem]">
          <div className="font-bold text-lg">UNICARE</div>

          <div className="flex space-x-4 text-gray-600 text-xl">
            <a
              href="#"
              className="hover:scale-125 transition-transform duration-300"
            >
              <FaLinkedin />
            </a>
            <a
              href="#"
              className="hover:scale-125 transition-transform duration-300"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="hover:scale-125 transition-transform duration-300"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="hover:scale-125 transition-transform duration-300"
            >
              <FaYoutube />
            </a>
          </div>

          <p className="text-gray-600">
            © {new Date().getFullYear()} UNICARE Counseling. All rights
            reserved.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 text-[17px] mt-6 text-gray-700 ">
          <div className="flex items-center space-x-2">
            <FaPhoneAlt />
            <span>251954236476</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope />
            <span>unicare@aau.edu.et</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
