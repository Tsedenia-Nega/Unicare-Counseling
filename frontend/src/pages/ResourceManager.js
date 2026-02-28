import React, { useState, useEffect } from "react";
import API from "../services/api";
import Footer from "../components/Footer";

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
const backendURL = process.env.REACT_APP_API_URL;
  const itemsPerPage = 6;

  const API_BASE = `${backendURL}/resources`;

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await API.get(API_BASE);
      setResources(res.data.resources);
      const categories = [
        ...new Set(res.data.resources.map((r) => r.category)),
      ];
      setUniqueCategories(categories);
    } catch (err) {
      console.error("Failed to fetch resources");
    }
  };

  const filteredResources = resources.filter((res) => {
    const matchCategory =
      !selectedCategory || res.category === selectedCategory;
    const matchSearch = res.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResources.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-[#3B7962] mb-8">
          Explore Mental Wellness Resources
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-1/4 bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-[#3B7962] mb-4">
              Filter by Category
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory("")}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  selectedCategory === ""
                    ? "bg-[#3B7962] text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    selectedCategory === cat
                      ? "bg-[#3B7962] text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B7962]"
              />
            </div>

            {/* Resource Cards */}
            {currentItems.length === 0 ? (
              <p className="text-center text-lg text-gray-500">
                No resources found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentItems.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xl font-semibold text-[#3B7962] mb-2">
                        {res.title}
                      </h4>
                      <p className="text-base text-gray-700 mb-3">
                        {res.description}
                      </p>
                      <span className="inline-block  text-black text-sm ">
                        Category :{res.category}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedResource(res)}
                        className="text-sm text-white bg-[#3B7962] px-4 py-2 rounded hover:bg-[#2f5f4f]"
                      >
                        View
                      </button>
                      {res.media_type === "image" ? (
                        <img
                          src={`${backendURL}/uploads/certification/${res.media_url}`}
                          alt={res.title}
                          className="w-20 h-16 object-contain rounded"
                        />
                      ) : (
                        <span className="text-sm text-[#3B7962]">{res.media_type}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border text-[#3B7962] hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border text-[#3B7962] hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* View Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white p-6 rounded-xl shadow-lg w-full relative transition-all duration-300 ${
              isMaximized ? "h-screen max-w-full m-0 rounded-none" : "max-w-2xl"
            }`}
          >
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#3B7962]">
                {selectedResource.title}
              </h2>
              <button
                onClick={() => setIsMaximized((prev) => !prev)}
                className="text-sm px-3 py-1 rounded  text-black "
              >
                {isMaximized ? "−" : "⛶ "}
              </button>
            </div>

            <p className="mb-4 text-gray-700">{selectedResource.description}</p>

            <div className="w-full h-[60vh] overflow-hidden">
              {selectedResource.media_type === "image" ? (
                <img
                  src={`${backendURL}/uploads/certification/${selectedResource.media_url}`}
                  alt={selectedResource.title}
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <iframe
                  src={selectedResource.media_url}
                  title={selectedResource.title}
                  className="w-full h-full border rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ResourceManager;
