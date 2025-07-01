"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import toolsData from "@/data/tools.json"
import { ReactNode, isValidElement } from "react"

type Tool = {
  icon_url: string
  default_status: boolean
  tool_identifier: string
  name: string
  category: string
  description: string
  read_more: string
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cursorTrailsRef = useRef<HTMLDivElement[]>([])
  const router = useRouter()
  
  // Tool integrations state
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  // Wallet connection related states
  const { publicKey, disconnect, signMessage, connected, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [signature, setSignature] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)

  // Carousel auto-scroll logic
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    let frame: number;
    let start: number | null = null;
    let scrollWidth = 0;
    const duration = 10000;
    if (carousel) {
      scrollWidth = carousel.scrollWidth / 2; // since we duplicate images
    }

    function step(timestamp: number) {
      if (!carousel) return;
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      const progress = elapsed / duration;
      carousel.scrollLeft = progress * scrollWidth;
      frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  // Handle signature request - using useCallback to avoid dependency cycle
  const handleSignMessage = useCallback(async () => {
    if (!publicKey || !signMessage || isLoading) return
    
    try {
      const message = new TextEncoder().encode(
        `Sign this message for authenticating with Cipher AI: ${publicKey.toString()}`
      )
      
      const sig = await signMessage(message)
      const signatureString = Buffer.from(sig).toString("base64")
      
      localStorage.setItem("walletSignature", signatureString)
      localStorage.setItem("walletPublicKey", publicKey.toString())
      setSignature(signatureString)

      // Optional: Send API request to register user
      fireUserRequest(publicKey.toString(), signatureString)
    } catch (error) {
      console.error("Error signing message:", error)
      localStorage.removeItem("walletSignature")
      localStorage.removeItem("walletPublicKey")
      disconnect()
      setSignature(null)
    } finally {
      setIsSigning(false) // Ensure isSigning is always reset when the process completes
    }
  }, [publicKey, signMessage, isLoading, disconnect]);

  // Load saved signature from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSignature = localStorage.getItem("walletSignature")
      if (storedSignature) {
        setSignature(storedSignature)
      }
      setIsLoading(false)
    }
  }, [])

  // Handle wallet connection and signature
  useEffect(() => {
    // Reset isSigning when wallet disconnects to prevent button getting stuck
    if (!connected && isSigning) {
      setIsSigning(false)
    }

    if (isLoading || connecting) return

    // Check if the connected wallet matches the stored wallet
    if (connected && publicKey) {
      const storedPublicKey = localStorage.getItem("walletPublicKey")
      const storedSignature = localStorage.getItem("walletSignature")
      
      // If we have a stored signature and the wallet key matches what we stored
      if (storedPublicKey === publicKey.toString() && storedSignature && !signature) {
        // Restore the signature from localStorage
        setSignature(storedSignature)
        setIsSigning(false)
      } else if (!signature && isSigning) {
        // New wallet connection or signature needed
        handleSignMessage()
      }
    } else if (!connected && !connecting && signature) {
      // Clear signature if wallet is fully disconnected
      setSignature(null)
      localStorage.removeItem("walletSignature")
      localStorage.removeItem("walletPublicKey")
    }
  }, [connected, publicKey, isLoading, connecting, signature, isSigning, handleSignMessage])

  // Helper function to fire API request
  const fireUserRequest = (publicKey: string, signature: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_key: publicKey, signature })
    });
  };

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
                         tool.tool_identifier.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch && (activeCategory === "All" || tool.category === activeCategory)
  })

  // Handle category change with animation
  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
  };

  // Handle scroll animation
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle mouse movement for cursor effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Create cursor trails
  useEffect(() => {
    const trailCount = 10
    const trails: HTMLDivElement[] = []

    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement("div")
      trail.className = "cursor-trail"
      document.body.appendChild(trail)
      trails.push(trail)
    }

    cursorTrailsRef.current = trails

    return () => {
      trails.forEach((trail) => {
        if (document.body.contains(trail)) {
          document.body.removeChild(trail)
        }
      })
    }
  }, [])

  // Animate cursor trails
  useEffect(() => {
    const trails = cursorTrailsRef.current
    if (trails.length === 0) return

    let positions: { x: number; y: number }[] = Array(trails.length).fill({ x: 0, y: 0 })

    const animateTrails = () => {
      positions = [mousePosition, ...positions.slice(0, -1)]

      trails.forEach((trail, index) => {
        const position = positions[index]
        if (position) {
          trail.style.left = `${position.x}px`
          trail.style.top = `${position.y}px`
          trail.style.opacity = `${1 - index / trails.length}`
          trail.style.width = `${8 - (index / trails.length) * 6}px`
          trail.style.height = `${8 - (index / trails.length) * 6}px`
        }
      })

      requestAnimationFrame(animateTrails)
    }

    const animationId = requestAnimationFrame(animateTrails)
    return () => cancelAnimationFrame(animationId)
  }, [mousePosition])

  // Create decorative elements
  useEffect(() => {
    const elements: ReactNode[] = []

    // Circles
    for (let i = 0; i < 5; i++) {
      const size = 100 + Math.random() * 200
      elements.push(
        <div
          key={`circle-${i}`}
          className="decorative-circle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 90}%`,
            top: `${100 + Math.random() * 1500}px`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />,
      )
    }

    // Squares
    for (let i = 0; i < 3; i++) {
      const size = 50 + Math.random() * 100
      elements.push(
        <div
          key={`square-${i}`}
          className="decorative-square"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 90}%`,
            top: `${300 + Math.random() * 1200}px`,
            transform: `rotate(${Math.random() * 45}deg)`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />,
      )
    }

    // Lines
    for (let i = 0; i < 4; i++) {
      elements.push(
        <div
          key={`line-${i}`}
          className="decorative-line"
          style={{
            left: `${10 + Math.random() * 20}%`,
            top: `${200 + i * 400 + Math.random() * 200}px`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />,
      )
    }

    // Add elements to the DOM or store them in a ref
    const container = document.getElementById('decorative-elements-container');
    if (container) {
      container.innerHTML = '';
      const fragment = document.createDocumentFragment();
      elements.forEach(element => {
        if (isValidElement(element)) {
          const reactElement = element as React.ReactElement<{
            className?: string;
            style?: React.CSSProperties;
          }>;
          const div = document.createElement('div');
          div.className = reactElement.props.className || "";
          Object.assign(div.style, reactElement.props.style);
          fragment.appendChild(div);
        }
      });
      container.appendChild(fragment);
    }

    // Return cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [])

  // Handle connect wallet button click
  const handleConnectWallet = () => {
    if (!connected) {
      setIsSigning(true)
      setVisible(true)
    } else if (connected && publicKey) {
      if (!signature) {
        const storedSignature = localStorage.getItem("walletSignature")
        if (storedSignature && localStorage.getItem("walletPublicKey") === publicKey.toString()) {
          setSignature(storedSignature)
          router.push("/chat")
        } else {
          setIsSigning(true)
        }
      } else {
        router.push("/chat")
      }
    }
  }

  // Listen for wallet adapter events to properly reset states
  useEffect(() => {
    // Create a cleanup function that resets the states
    const resetStates = () => {
      setIsSigning(false)

    }
    if (!connected && localStorage.getItem("walletSignature") === null) {
      resetStates()
    }
    
    return () => {
    }
  }, [connected])

  // Animation for feature boxes
  const [boxVisible, setBoxVisible] = useState([false, false, false]);
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setBoxVisible([true, false, false]), 100),
      setTimeout(() => setBoxVisible([true, true, false]), 700),
      setTimeout(() => setBoxVisible([true, true, true]), 1300),
    ];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Typing animation for hero heading
  const heroText = 'Your AI powered\nAssistant for Solana';
  const [typedHero, setTypedHero] = useState('');
  useEffect(() => {
    let i = 0;
    const text = heroText;
    function typeNext() {
      setTypedHero(text.slice(0, i + 1));
      i++;
      if (i < text.length) {
        setTimeout(typeNext, 80);
      }
    }
    typeNext();
  }, []);

  return (
    <div className="page-container">
      {/* Background Pattern */}
      <div className="bg-pattern"></div>

      {/* Full page grid background */}
      <div className="full-page-grid">
        {/* Hero Section - Two Column Layout */}
        <section className="w-full max-w-7xl mx-auto pt-20 pb-10 px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Text and Button */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#232021] mb-6 leading-tight whitespace-pre-line">
              {typedHero}
            </h1>
            <p className="text-lg text-[#5c7c7d] mb-8">The Solana Ecosystem, At Your Command.</p>
            <button
              onClick={handleConnectWallet}
              className={`
                relative overflow-hidden group
                px-8 py-4 min-w-[220px]
                font-bold tracking-wide space-grotesk-bold
                rounded-full text-white text-lg
                bg-[#3b5b6d] hover:bg-[#2d4655] transition-all duration-300
                shadow-lg
                border-0 outline-none focus:outline-none
                ${isLoading || isSigning ? "cursor-wait opacity-80" : "cursor-pointer"}
              `}
              disabled={isLoading || isSigning}
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : isSigning ? (
                <span>Signing...</span>
              ) : connected && (signature || localStorage.getItem("walletSignature")) ? (
                <span>Start Chatting</span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
            {!(connected && (signature || (typeof window !== 'undefined' && localStorage.getItem('walletSignature')))) && (
              <div className="w-full flex justify-left mt-10 mb-2">
                <span className="text-[#9e4244] font-bold text-2xl uppercase tracking-wide text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  CONNECT WALLET TO START CHATTING!
                </span>
              </div>
            )}
          </div>
          {/* Right: Video Placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl aspect-video rounded-3xl shadow-2xl overflow-hidden bg-black">
              <video
                src="/random.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/banner-placeholder.svg"
              />
            </div>
          </div>
        </section>

        {/* Feature Boxes Section */}
        <section className="w-full py-16 flex justify-center items-center">
          <div className="max-w-7xl w-full px-4 flex flex-col md:flex-row gap-8">
            {/* Box 1 */}
            <div className={`flex-1 bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center transition-all duration-700 ${boxVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#232021]">Intelligent Asset Optimization</h3>
              <p className="text-base md:text-lg text-[#3b5b6d]">
                Cipher AI leverages advanced machine learning algorithms to deliver data-driven insights for optimal asset management. From dynamic market analysis to personalized portfolio strategies, our platform empowers users to make informed, strategic investment decisions with precision and confidence.
              </p>
            </div>
            {/* Box 2 */}
            <div className={`flex-1 bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center transition-all duration-700 ${boxVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#232021]">Real-Time Blockchain Intelligence</h3>
              <p className="text-base md:text-lg text-[#3b5b6d]">
                Harness the power of real-time analytics with Cipher AI. Our platform continuously monitors and interprets on-chain activity across the Solana ecosystem, providing actionable intelligence that supports effective asset management, risk assessment, and market trend identification.
              </p>
            </div>
            {/* Box 3 */}
            <div className={`flex-1 bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center transition-all duration-700 ${boxVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#232021]">Integrated Solana Ecosystem Access</h3>
              <p className="text-base md:text-lg text-[#3b5b6d]">
                Cipher AI offers a unified interface to the Solana blockchain's most sophisticated tools and platforms. Whether you're managing DeFi positions, participating in token launches, or tracking NFTs and analytics, Cipher AI streamlines the experience—enhancing efficiency, clarity, and control across all operations.
              </p>
            </div>
          </div>
        </section>

        {/* Partner Carousel Section */}
        <section className="w-full py-10 flex flex-col items-center">
          <div ref={carouselRef} className="w-full max-w-5xl overflow-x-auto no-scrollbar scrollbar-hide" style={{ scrollBehavior: 'auto' }}>
            <div className="flex gap-8 items-center px-4" style={{ minWidth: '1400px', width: 'max-content' }}>
              {/* Carousel Images (duplicated for infinite loop) */}
              {[
                { src: '/birdeye.png', alt: 'Birdeye' },
                { src: '/cmc.png', alt: 'CoinMarketCap' },
                { src: '/coingecko.png', alt: 'CoinGecko' },
                { src: '/dexscreener.png', alt: 'Dexscreener' },
                { src: '/fluxbeam.png', alt: 'Fluxbeam' },
                { src: '/jupiter.svg', alt: 'Jupiter' },
                { src: '/raydium.svg', alt: 'Raydium' },
                { src: '/rugcheck.jpg', alt: 'Rugcheck' },
                { src: '/solana.png', alt: 'Solana' },
              ].concat([
                { src: '/birdeye.png', alt: 'Birdeye' },
                { src: '/cmc.png', alt: 'CoinMarketCap' },
                { src: '/coingecko.png', alt: 'CoinGecko' },
                { src: '/dexscreener.png', alt: 'Dexscreener' },
                { src: '/fluxbeam.png', alt: 'Fluxbeam' },
                { src: '/jupiter.svg', alt: 'Jupiter' },
                { src: '/raydium.svg', alt: 'Raydium' },
                { src: '/rugcheck.jpg', alt: 'Rugcheck' },
                { src: '/solana.png', alt: 'Solana' },
              ]).map(({ src, alt }, i) => (
                <div key={alt + i} className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-center min-w-[120px] min-h-[80px] h-24 w-32">
                  <Image src={src} alt={alt} width={100} height={60} className="object-contain max-h-12 max-w-[90px]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="w-full">
          {/* Enhanced Tool Integrations Section */}
          <div
            className="w-full max-w-6xl mx-auto px-4 mb-20 fade-in-up delay-200"
            style={{
              opacity: scrollY > 100 ? 1 : 0,
              transform: `translateY(${Math.max(0, 20 - scrollY / 10)}px)`,
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            <div className="section-heading-wrapper mb-8 text-center flex flex-col items-center">
              <h2 className="section-heading mb-2">TOOL INTEGRATIONS</h2>
              <p className="text-[#5c7c7d] max-w-2xl mx-auto">
                Explore our powerful selection of tools designed to enhance your Solana experience
              </p>
            </div>

            {/* Connect Wallet to Start Chatting Text */}
            {!(connected && (signature || (typeof window !== 'undefined' && localStorage.getItem('walletSignature')))) && (
              <div className="w-full flex justify-center mt-8 mb-4">
                <span className="text-[#9e4244] font-bold text-lg uppercase tracking-wide text-center">CONNECT WALLET TO START CHATTING!</span>
              </div>
            )}

            {/* Improved Search and Filter Controls */}
            <div className="mb-8 flex flex-col gap-6">
              <div className="relative mx-auto w-full max-w-xl">
                <input
                  type="text"
                  placeholder="Search tools by name, category, or functionality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-4 pl-12 bg-[#f5f0e6] border-2 border-[#d1c7b9] text-[#3a3238] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9e4244] focus:border-transparent transition-all shadow-sm"
                />
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9e4244]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9e4244] hover:text-[#8a3a3c] transition-colors"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Enhanced Category Selection */}
              <div className="category-selector relative">
                <div className="category-backdrop bg-[#f5f0e6] rounded-2xl p-3 shadow-sm max-w-5xl mx-auto">
                  <div className="flex flex-wrap justify-center gap-2">
                    {categoriesWithCount.map(({name, count}) => (
                      <button
                        key={name}
                        onClick={() => handleCategoryChange(name)}
                        className={`category-button relative py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                          activeCategory === name
                            ? "text-white"
                            : "text-[#3a3238] hover:text-[#9e4244]"
                        }`}
                      >
                        {/* Background elements */}
                        <span className={`absolute inset-0 ${
                          activeCategory === name 
                            ? "bg-gradient-to-r from-[#9e4244] to-[#9e4244] opacity-100" 
                            : "bg-white opacity-70"
                        } rounded-xl transition-all duration-300`}></span>
                        
                        {/* Animated bubbles in background (only for active) */}
                        {activeCategory === name && (
                          <>
                            <span className="absolute w-2 h-2 rounded-full bg-white opacity-30 top-1 right-2 animate-float-slow"></span>
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-20 bottom-1 left-3 animate-float-medium"></span>
                            <span className="absolute w-1 h-1 rounded-full bg-white opacity-30 top-2 left-2 animate-float-fast"></span>
                          </>
                        )}
                        
                        {/* Content */}
                        <span className="relative flex items-center gap-2">
                          <span className="category-name">{name}</span>
                          <span className={`inline-flex items-center justify-center rounded-full text-xs px-1.5 py-0.5 min-w-[1.25rem] ${
                            activeCategory === name 
                              ? "bg-white text-[#9e4244]" 
                              : "bg-[#e6e0d6] text-[#5c7c7d]"
                          } transition-all duration-300`}>
                            {count}
                          </span>
                          
                          {/* Active indicator */}
                          {activeCategory === name && (
                            <span className="ml-1 relative">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tools Grid - Always in a unified grid regardless of filter */}
            <>
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
                  {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
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
                      src="/icon-placeholder.svg" 
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
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveCategory("All");
                    }}
                    className="mt-2 text-[#9e4244] font-medium border border-[#9e4244] rounded-lg px-4 py-2 hover:bg-[#9e4244] hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset filters
                  </button>
                </div>
              )}
            </>
          </div>
        </div>

        {/* FAQ Accordion Section (now at the bottom) */}
        <section className="w-full max-w-3xl mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-[#3a3238] mb-8 text-center">Frequently Asked Questions</h2>
          <FAQAccordion />
        </section>

        {/* Footer with gradient */}
        <footer className="footer-gradient">
          <div className="max-w-5xl mx-auto px-4 flex justify-between items-center relative z-10">
            <p className="text-sm text-[#3a3238] space-grotesk">© 2025 Cipher AI.</p>
            <Link href="#">
              <Image src="/icon-placeholder.svg" alt="Cipher AI" width={60} height={20} />
            </Link>
          </div>
        </footer>
      </div>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-white border border-[#d1c7b9] shadow-lg rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="text-[#9e4244] font-bold text-lg">Please connect wallet</span>
          <button onClick={() => setShowConnectModal(false)} className="ml-4 px-2 py-1 rounded bg-[#f5f0e6] hover:bg-[#e9e4da] text-[#3a3238] font-medium">Dismiss</button>
        </div>
      )}
    </div>
  )
}



// Extracted Tool Card Component for cleaner code and consistent styling
const ToolCard = ({ 
  tool, 
  index, 
  hoveredTool,
  setHoveredTool
}: { 
  tool: Tool; 
  index: number; 
  hoveredTool: string | null;
  setHoveredTool: (id: string | null) => void;
}) => {
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
        
        {/* Card footer */}
        <div className="flex justify-between items-center mt-auto">
          <span className={`text-xs px-2 py-1 rounded-full ${
            tool.default_status 
              ? "bg-[#e6f5f0] text-[#5c7c7d]" 
              : "bg-[#f5f0e6] text-[#9e4244]"
          }`}>
            {tool.default_status ? "Default" : "Optional"}
          </span>
          
          <Link 
            href={tool.read_more} 
            target="_blank"
            className="text-xs bg-[#f5f0e6] hover:bg-[#9e4244] hover:text-white text-[#9e4244] px-3 py-1 rounded-full transition-colors duration-300 flex items-center gap-1"
          >
            <span>Details</span>
            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
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
};

// FAQ Accordion Component
function FAQAccordion() {
  const faqs = [
    {
      q: "What is Cipher AI?",
      a: "Cipher AI is an AI-powered assistant designed for the Solana ecosystem. It helps you analyze on-chain data, manage assets, and access powerful Solana tools—all in one place.",
    },
    {
      q: "How do I connect my wallet?",
      a: "Simply click the 'Connect Wallet' button at the top of the page. Cipher AI supports popular Solana wallets and ensures your connection is secure and private.",
    },
    {
      q: "Is my data safe with Cipher AI?",
      a: "Yes. Cipher AI does not store your private data or require unnecessary permissions. All wallet interactions are handled securely through trusted Solana wallet providers.",
    },
    {
      q: "What can I do with Cipher AI?",
      a: "You can explore wallet activity, track tokens, analyze smart contracts, and use integrated Solana tools for trading, analytics, and more—all powered by AI.",
    },
  ];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-4">
      {faqs.map((faq, idx) => (
        <div key={faq.q} className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border border-[#e9e4da]">
          <button
            className="w-full flex justify-between items-center text-left focus:outline-none"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span className="text-lg font-semibold text-[#3a3238]">{faq.q}</span>
            <span className={`ml-4 transition-transform duration-300 ${openIdx === idx ? 'rotate-45' : ''}`}>+</span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 ${openIdx === idx ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p className="text-[#5c7c7d] text-base">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
