import React, { useState } from "react";
import axios from "axios";
import { Search, Book, Loader2, MenuIcon } from "lucide-react";

const TOPICS = [
  "Array", "String", "Hash Table", "Dynamic Programming", "Math", 
  "Sorting", "Greedy", "Depth-First Search", "Binary Search", "Matrix",
  "Tree", "Breadth-First Search", "Bit Manipulation", "Two Pointers",
  "Prefix Sum", "Heap (Priority Queue)", "Binary Tree", "Stack", "Graph",
  "Sliding Window", "Backtracking", "Union Find", "Linked List",
  "Ordered Set", "Number Theory", "Monotonic Stack", "Trie",
  "Segment Tree", "Bitmask", "Queue", "Divide and Conquer", "Recursion",
  "Combinatorics", "Binary Indexed Tree", "Geometry", "Binary Search Tree",
  "Topological Sort", "Shortest Path", "Monotonic Queue", "Merge Sort",
  "Doubly-Linked List", "Suffix Array", "Minimum Spanning Tree",
  "Strongly Connected Component", "Biconnected Component"
];

const App = () => {
  const [topic, setTopic] = useState("");
  const [recentContests, setRecentContests] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    setHasFetched(false);
  
    try {
      const contestsResponse = await axios.post("https://leetcode-contest-explorer.vercel.app/fetch-contests", {
        topic,
        recentContests
      });
      setQuestions(contestsResponse.data);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching contest questions.");
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setQuestions([]);
    if (topic && recentContests) {
      fetchQuestions();
    } else {
      setError("Please fill in both fields.");
    }
  };

  const handleTopicClick = (selectedTopic) => {
    setTopic(selectedTopic);
    if(showSidebar) setShowSidebar(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #60a5fa;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 #1f2937;
          }
        `}
      </style>

      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Book className="w-6 h-6 mr-2 text-blue-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              LeetCode Contest Explorer
            </h1>
          </div>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`fixed lg:static inset-y-0 left-0 transform ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-gray-800 flex flex-col z-40`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 mt-16 lg:mt-0">
            <h2 className="text-xl font-semibold text-blue-400">Topics</h2>
          </div>
          {/* Scrollable Topics Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTopicClick(t)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      topic === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div onClick={() =>{ if(showSidebar) setShowSidebar(false)}} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-center mb-12">
              <Book className="w-8 h-8 mr-3 text-blue-500" />
              <h1 className="lg:text-4xl md:text-4xl sm:text-3xl text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                LeetCode Contest Explorer
              </h1>
            </div>

            {/* Search Form */}
            <form 
              className="max-w-2xl mx-auto mb-12 bg-gray-800 p-6 rounded-xl shadow-lg"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    type="text"
                    placeholder="Enter topic (or select from sidebar)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full md:w-48">
                  <input
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    type="number"
                    placeholder="Recent contests (e.g., 5)"
                    value={recentContests}
                    onChange={(e) => setRecentContests(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3  bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </form>

            {/* Results */}
            {questions.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-center">Found Questions</h2>
                <div className="grid gap-4">
                  {questions.map((question) => (
                    <a
                      key={question.titleSlug}
                      href={`https://leetcode.com/problems/${question.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition-all transform hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium hover:text-blue-400 transition-colors">
                          {question.titleSlug.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center mt-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            {!loading && hasFetched && questions.length === 0 && (
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-semibold text-gray-600">No questions found</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;