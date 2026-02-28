import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../services/api";
const Signup = () => {
  const navigate = useNavigate();
  const [headCounselorExists, setHeadCounselorExists] = useState(null); // null means loading
const Backend_URL = process.env.REACT_APP_API_URL ;
  useEffect(() => {
    const checkHeadCounselor = async () => {
      try {
        const res = await API.get(`${Backend_URL}/head-counselor/check`);
        setHeadCounselorExists(res.data.exists); // true or false
      } catch (error) {
        console.error("Error checking head counselor existence", error);
        setHeadCounselorExists(false); // or handle error differently
      }
    };
    checkHeadCounselor();
  }, []);

  if (headCounselorExists === null) {
    return <div>Loading...</div>; // Or some spinner
  }

  return (
    <div className="min-h-screen bg-white font-times">
      <div className="flex items-center justify-center ">
        <div className="flex bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl w-[1450px] h-[600px] overflow-hidden">
          <div className="bg-gray-200 w-1/2 flex items-center justify-center p-0">
            <img
              src="/images/signup.png"
              alt="Illustration"
              className="w-full h-full object-cover opacity-60"
            />
          </div>

          <div className="w-1/2 p-10 flex flex-col items-center justify-center">
            <h1 className="text-[50px] font-bold text-black mb-3 text-center">
              Welcome To UniCare
            </h1>

            <p className="text-[#558862] mb-6 text-[20px] font-semibold text-center">
              Are You New To UniCare?
            </p>

            <div className="flex space-x-6 mb-6">
              <button
                onClick={() => navigate("/StudentForm")}
                className="px-6 py-2 bg-gray-200 text-black border border-black rounded-full font-semibold hover:bg-green-700 transition"
              >
                Student
              </button>

              <button
                onClick={() => navigate("/CounselorForm")}
                className="px-6 py-2 text-black border border-black rounded-full font-semibold hover:bg-green-700 transition"
              >
                Counselor
              </button>

              {/* Only show this button if head counselor doesn't exist */}
              {!headCounselorExists && (
                <button
                  onClick={() => navigate("/admin")}
                  className="px-6 py-2 text-black border border-black rounded-full font-semibold hover:bg-green-700 transition"
                >
                  Head Counselor
                </button>
              )}
            </div>

            <div className="flex items-center w-3/4 mb-4">
              <div className="flex-grow h-px bg-black" />
              <span className="mx-3 text-gray-500">OR</span>
              <div className="flex-grow h-px bg-black" />
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-3/4 py-2 border bg-[#558862] border-black text-white rounded-full font-medium hover:bg-green-700 transition"
            >
              Sign In
            </button>

            <p className="text-lg text-black mt-5 text-center w-3/4">
              By signing up, you agree to the{" "}
              <span className="underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>,
              including{" "}
              <span className="underline cursor-pointer">cookie use</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
