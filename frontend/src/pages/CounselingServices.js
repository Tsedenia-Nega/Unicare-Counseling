import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer"
const CounselingServices = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-[#f5f7f6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 px-4 sm:px-8">
            <h1 className="text-4xl font-bold text-gray-800  mb-4">
              UNICARE Counselling Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive mental health support tailored for university
              students
            </p>
          </div>

          {/* Main Content Container */}
          <div className="ml-0 sm:ml-8 md:ml-12 lg:ml-16 mr-0 sm:mr-8 md:mr-12 lg:mr-16">
            {/* Main Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* In-Person Counselling */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="p-8 flex-grow">
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      In-Person Counselling
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6 text-center">
                    Schedule appointments with our on-campus counselors for
                    face-to-face discussions.
                  </p>
                </div>
                <div className="px-8 pb-8 text-center">
                  <button
                    onClick={() => navigate("/book-appointment")}
                    className="bg-[#3B7962] hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 mx-auto"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Virtual Counselling */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="p-8 flex-grow">
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Virtual Counselling
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6 text-center">
                    Connect with licensed counselors through secure video or
                    chat sessions from the comfort of your Dorm.
                  </p>
                </div>
                <div className="px-8 pb-8 text-center">
                  <button
                    onClick={() => navigate("/book-appointment")}
                    className="bg-[#3B7962] hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 mx-auto"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mood Tracking */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="p-8 flex-grow">
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div className="bg-purple-100 p-3 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Mood Tracking
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6 text-center">
                    Monitor your emotional patterns and gain insights with our
                    daily mood tracking tools.
                  </p>
                </div>
                <div className="px-8 pb-8 text-center">
                  <button
                    onClick={() => navigate("/mood")}
                    className="bg-[#3B7962] hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 mx-auto"
                  >
                    Track Your Mood
                  </button>
                </div>
              </div>

              {/* Communication Forum */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="p-8 flex-grow">
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div className="bg-orange-100 p-3 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Communication Forum
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6 text-center">
                    Join our online community to discuss and share experiences
                    with others in a supportive environment.
                  </p>
                </div>
                <div className="px-8 pb-8 text-center">
                  <button
                    onClick={() => navigate("/chat")}
                    className="bg-[#3B7962] hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 mx-auto"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default CounselingServices;
