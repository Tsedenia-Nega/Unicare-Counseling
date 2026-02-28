import React from "react";
import { Mail, User, MessageCircle } from "lucide-react";
import Footer from "./Footer";

const ContactUs = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#3B7962] rounded-t-3xl" />
          <h2 className="text-4xl font-bold text-[#3B7962] mb-8 text-center">
            Get in Touch
          </h2>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                <User size={18} /> Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B7962] shadow-sm transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                <Mail size={18} /> Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B7962] shadow-sm transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                <MessageCircle size={18} /> Your Message
              </label>
              <textarea
                rows={4}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B7962] shadow-sm transition duration-200 resize-none"
              ></textarea>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                className="bg-[#3B7962] hover:bg-[#2e5b44] text-white font-semibold px-8 py-3 rounded-xl shadow-md transition duration-300"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ContactUs;
