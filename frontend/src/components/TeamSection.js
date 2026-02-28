

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import API from "../services/api";
const TeamSection = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
const Backend_URL = process.env.REACT_APP_API_URL ;
const socketURL = process.env.REACT_APP_SOCKET_URL;
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await API.get(
          `${Backend_URL}/counselors/verifiedd`
        );
        setCounselors(res.data.counselors);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  const scroll = (direction) => {
    const scrollAmount = 400;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-60">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 text-center py-6 font-semibold">
        Error: {error}
      </div>
    );

  return (
    // <section className="py-20 mt-10 md:mt-0  bg-[#f5f7f6]" id="team">
      <section className="relative z-0 py-16 mt-0 md:mt-0 bg-[#f5f7f6] clear-both" id="team">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl mt-5 md:mt-1 font-extrabold text-gray-800 mb-3">
            Our Professional Counselors
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Meet our team of certified mental health professionals dedicated to
            your well-being.
          </p>
        </motion.div>

        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-blue-100 transition-colors duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-blue-100 transition-colors duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        <div
          ref={scrollRef}
          className="flex space-x-8 overflow-x-auto pb-4 px-2 scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {counselors.map((counselor, index) => (
            <motion.div
              key={counselor._id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="min-w-[300px] md:min-w-[360px] lg:min-w-[400px] flex-shrink-0 flex flex-col items-center text-center p-4 relative"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Background shape */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl -z-10 shadow-sm border border-white/50" />

              <div className="relative mb-4 group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg group-hover:border-[#3B7962] transition-colors duration-300">
                  {counselor.user_id.profile_picture ? (
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      src={`${socketURL}/uploads/profile_pictures/${counselor.user_id.profile_picture}`}
                      alt={`${counselor.user_id.first_name} ${counselor.user_id.last_name}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-profile.jpg";
                      }}
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="w-full h-full flex items-center justify-center bg-blue-100 text-[#3B7962] text-2xl font-bold"
                    >
                      {counselor.user_id.first_name[0]}
                      {counselor.user_id.last_name[0]}
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
                >
                  Verified
                </motion.div>
              </div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                {`${counselor.user_id.first_name} ${counselor.user_id.last_name}`}
              </h3>

              <p className="text-[#3B7962] text-sm font-medium mb-2">
                {counselor.qualifications[0]}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {counselor.specialization.slice(0, 3).map((spec, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-blue-100 text-[#3B7962] text-xs font-semibold px-3 py-1 rounded-full hover:bg-[#3B7962] hover:text-white transition-colors duration-300"
                  >
                    Specialilzation :{spec}
                  </motion.span>
                ))}
              </div>

              {counselor.Experience && (
                <p className="text-gray-500 text-xs italic mt-2 bg-gray-100/70 px-3 py-1 rounded-full">
                  {counselor.Experience} of experience
                </p>
              )}

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-[#3B7962]/30 to-transparent w-full mt-4"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default TeamSection;
