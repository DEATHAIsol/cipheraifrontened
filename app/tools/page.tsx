"use client";
import toolsData from "@/data/tools.json";
import { useState } from "react";
import Image from "next/image";

// Tool type definition
type Tool = {
  icon_url: string;
  default_status: boolean;
  tool_identifier: string;
  name: string;
  category: string;
  description: string;
  read_more: string;
};

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Get unique categories from tools data and count tools per category
  const categoriesWithCount = ["All", ...Array.from(new Set(toolsData.map((tool: Tool) => tool.category)))].sort().map(category => {
    const count = category === "All" 
      ? toolsData.length 
      : toolsData.filter(tool => tool.category === category).length;
    return { name: category, count };
  });

  // Filter tools based on search and category
  const filteredTools = toolsData.filter((tool: Tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tool_identifier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (activeCategory === "All" || tool.category === activeCategory);
  });

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4 text-[#3a3238]">TOOL INTEGRATIONS</h1>
      <p className="text-lg text-[#5c7c7d] mb-8">Explore our powerful selection of tools designed to enhance your Solana experience</p>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search tools by name, category, or functionality..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full max-w-xl mb-8 px-4 py-3 rounded-lg border border-[#d1c7b9] bg-[#f5f0e6] text-[#3a3238] focus:outline-none focus:ring-2 focus:ring-[#9e4244]"
      />

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categoriesWithCount.map(cat => (
          <button
            key={cat.name}
            className={`category-button px-4 py-2 rounded-full font-bold text-sm transition-colors duration-200 ${activeCategory === cat.name ? "bg-[#9e4244] text-white" : "bg-[#f5f0e6] text-[#9e4244] hover:bg-[#e9e4da]"}`}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name}
            <span className="ml-2 text-xs font-normal">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="stat-card group px-5 py-3 bg-[#f5f0e6] rounded-lg flex items-center gap-3 shadow-sm hover:bg-gradient-to-r hover:from-[#f5f0e6] hover:to-[#e9e2d6] transition-all duration-300 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#5c7c7d] bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-4 h-4 text-[#5c7c7d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <span className="text-sm text-[#5c7c7d]">Total Tools:</span>
            <span className="text-lg font-bold text-[#3a3238] ml-1">{toolsData.length}</span>
          </div>
        </div>
        <div className="stat-card group px-5 py-3 bg-[#f5f0e6] rounded-lg flex items-center gap-3 shadow-sm hover:bg-gradient-to-r hover:from-[#f5f0e6] hover:to-[#e9e2d6] transition-all duration-300 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#9e4244] bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-4 h-4 text-[#9e4244]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="text-sm text-[#5c7c7d]">Categories:</span>
            <span className="text-lg font-bold text-[#3a3238] ml-1">{categoriesWithCount.length - 1}</span>
          </div>
        </div>
        <div className="stat-card group px-5 py-3 bg-[#f5f0e6] rounded-lg flex items-center gap-3 shadow-sm hover:bg-gradient-to-r hover:from-[#f5f0e6] hover:to-[#e9e2d6] transition-all duration-300 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#5c7c7d] bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-4 h-4 text-[#5c7c7d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <span className="text-sm text-[#5c7c7d]">Default Enabled:</span>
            <span className="text-lg font-bold text-[#3a3238] ml-1">{toolsData.filter(tool => tool.default_status).length}</span>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-[#3a3238] text-xl font-bold">
            {searchTerm 
              ? "Search Results" 
              : activeCategory === "All" 
                ? "All Tools" 
                : activeCategory}
          </h3>
          <div className="ml-3 h-px bg-[#d1c7b9] w-16 sm:w-32"></div>
        </div>
        <span className="bg-[#f5f0e6] text-[#5c7c7d] text-sm px-2 py-1 rounded-full">
          {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}
        </span>
      </div>
      {filteredTools.length > 0 ? (
        <div className="tools-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: Tool, index) => (
            <ToolCard 
              key={tool.tool_identifier} 
              tool={tool} 
              index={index}
              hoveredTool={hoveredTool}
              setHoveredTool={setHoveredTool}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f5f0e6] rounded-xl border border-[#d1c7b9] transform transition-all hover:scale-[1.01] shadow-sm">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-[#9e4244] opacity-10 animate-ping"></div>
            <Image 
              src="/chiperailogo.png" 
              alt="No results" 
              width={60} 
              height={60} 
              className="relative z-10 mx-auto opacity-70"
            />
          </div>
          <h3 className="text-lg font-medium text-[#3a3238] mb-2">No tools found</h3>
          <p className="text-sm text-[#5c7c7d] mb-4 max-w-md mx-auto">
            We couldn&apos;t find any tools matching your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}

// ToolCard component (copied from homepage for consistency)
function ToolCard({ 
  tool, 
  index, 
  hoveredTool,
  setHoveredTool
}: { 
  tool: Tool; 
  index: number; 
  hoveredTool: string | null;
  setHoveredTool: (id: string | null) => void;
}) {
  return (
    <div
      className="tool-card group relative"
      onMouseEnter={() => setHoveredTool(tool.tool_identifier)}
      onMouseLeave={() => setHoveredTool(null)}
      style={{
        animationDelay: `${0.05 * index}s`,
      }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9e4244] to-[#5c7c7d] opacity-50 rounded-xl transform group-hover:scale-105 transition-all duration-300"></div>
      {/* Card content */}
      <div className="tool-card-inner relative z-10 bg-white bg-opacity-95 backdrop-blur-sm p-5 rounded-xl border border-[#d1c7b9] shadow-lg transform transition-all duration-300 group-hover:translate-y-1 group-hover:translate-x-1 h-full flex flex-col">
        {/* Card header with icon and title */}
        <div className="flex items-start mb-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#f5f0e6] mr-3 shadow-sm flex-shrink-0">
            <Image
              src={tool.icon_url}
              alt={tool.name}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            {/* Title in div with fixed height to ensure consistent spacing */}
            <div className="h-[2.5rem] flex items-center">
              <h3 className="font-bold text-lg text-[#3a3238] line-clamp-1">{tool.name}</h3>
            </div>
            <span className="text-xs px-2 py-1 bg-[#f5f0e6] rounded-full text-[#5c7c7d] inline-block mt-1">
              {tool.category}
            </span>
          </div>
        </div>
        {/* Description with a fixed height */}
        <div className="h-[4.5rem] mb-4">
          <p className="text-sm text-[#3a3238] line-clamp-3">
            {tool.description}
          </p>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${
            hoveredTool === tool.tool_identifier ? "animate-shine" : ""
          }`}></div>
        </div>
      </div>
    </div>
  );
} 