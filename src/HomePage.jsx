import React, { useState, useRef, useEffect } from "react";

function HomePage({ onGetStarted }) {
  const [activeNav, setActiveNav] = useState("home");
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const navItemsRef = useRef({});

  // Refs for scroll animations
  const mainHeadingRef = useRef(null);
  const videoContainerRef = useRef(null);
  const featureTagsRef = useRef(null);
  const ctaContainerRef = useRef(null);
  const featuresSectionRef = useRef(null);
  const howItWorksSectionRef = useRef(null);

  // Generate starfield with stars spawning from edges and moving toward center
  const generateStars = () => {
    const stars = [];
    const starCount = 120; // More stars for continuous flow effect

    // Star colors: subtle purple and blue tones for white background
    const colors = [
      "rgba(125, 82, 253, 0.3)", // Purple
      "rgba(99, 102, 241, 0.25)", // Indigo
      "rgba(139, 92, 246, 0.2)", // Light purple
      "rgba(79, 70, 229, 0.2)", // Blue purple
      "rgba(196, 181, 253, 0.15)", // Lavender
      "rgba(129, 140, 248, 0.15)", // Light indigo
    ];

    // Star sizes: small and medium
    const sizes = [6, 8, 10, 12, 14, 16, 18, 20];

    for (let i = 0; i < starCount; i++) {
      // Stars always start from edges
      let startTop, startLeft, endTop, endLeft;
      const edge = Math.floor(Math.random() * 4); // 0=left, 1=right, 2=top, 3=bottom

      if (edge === 0) {
        // Left edge - move toward center-right
        startLeft = -5; // Start off-screen left
        startTop = Math.random() * 100;
        endLeft = 50 + Math.random() * 20; // End near center
        endTop = 50 + (Math.random() - 0.5) * 20; // End near center vertically
      } else if (edge === 1) {
        // Right edge - move toward center-left
        startLeft = 105; // Start off-screen right
        startTop = Math.random() * 100;
        endLeft = 50 - Math.random() * 20; // End near center
        endTop = 50 + (Math.random() - 0.5) * 20;
      } else if (edge === 2) {
        // Top edge - move toward center-bottom
        startTop = -5; // Start off-screen top
        startLeft = Math.random() * 100;
        endTop = 50 + Math.random() * 20; // End near center
        endLeft = 50 + (Math.random() - 0.5) * 20;
      } else {
        // Bottom edge - move toward center-top
        startTop = 105; // Start off-screen bottom
        startLeft = Math.random() * 100;
        endTop = 50 - Math.random() * 20; // End near center
        endLeft = 50 + (Math.random() - 0.5) * 20;
      }

      const duration = 12 + Math.random() * 8; // 12-20s to reach center (faster flow)
      const delay = Math.random() * 3; // Stagger start times (more frequent spawning)

      stars.push({
        id: i,
        startTop: `${startTop}%`,
        startLeft: `${startLeft}%`,
        endTop: `${endTop}%`,
        endLeft: `${endLeft}%`,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: duration,
        delay: delay,
      });
    }

    return stars;
  };

  const [starfield] = useState(() => generateStars());

  // Update indicator position when active nav changes
  useEffect(() => {
    if (indicatorRef.current && navItemsRef.current[activeNav]) {
      const activeItem = navItemsRef.current[activeNav];
      const navContainer = navRef.current;

      if (activeItem && navContainer) {
        const navRect = navContainer.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        indicatorRef.current.style.left = `${itemRect.left - navRect.left}px`;
        indicatorRef.current.style.width = `${itemRect.width}px`;
      }
    }
  }, [activeNav]);

  const handleNavigateToCommunication = () => {
    onGetStarted("any");
  };

  const handleNavClick = (navId, handler) => {
    setActiveNav(navId);
    if (handler) handler();
  };

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-revealed");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all scrollable sections
    const sections = [
      mainHeadingRef.current,
      videoContainerRef.current,
      featureTagsRef.current,
      ctaContainerRef.current,
      featuresSectionRef.current,
      howItWorksSectionRef.current,
    ].filter(Boolean);

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <>
      {/* Fixed Background Layer - Never Scrolls */}
      <div style={styles.fixedBackground}>
        {/* Enhanced animated background starfield - continuous flow toward center */}
        <div style={styles.stars}>
          {starfield.map((star) => (
            <div
              key={star.id}
              style={{
                ...styles.star,
                top: star.startTop,
                left: star.startLeft,
                width: `${star.size}px`,
                height: `${star.size}px`,
                fontSize: `${star.size}px`,
                color: star.color,
                animation: `flowToCenter-${star.id} ${star.duration}s linear infinite`,
                animationDelay: `${star.delay}s`,
              }}
            >
              <div style={styles.starDot} />
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Foreground Container */}
      <div style={styles.scrollContainer}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <img
              src="https://res.cloudinary.com/drvllglbk/image/upload/f_png/cs_srgb/q_auto/hear_me_logo_jvyfgf.jpg"
              alt="He@r Me Logo"
              style={styles.logoImage}
              onError={(e) => {
                console.error("Logo failed to load from Cloudinary");
                if (!e.target.src.includes("hear_me_logo_jvyfgf.jpg")) {
                  e.target.src =
                    "https://res.cloudinary.com/drvllglbk/image/upload/hear_me_logo_jvyfgf.jpg";
                } else if (!e.target.src.includes("/logo.png")) {
                  e.target.src = "/logo.png";
                }
              }}
            />
          </div>
          <nav ref={navRef} style={styles.nav}>
            <div ref={indicatorRef} style={styles.navIndicator} />
            <a
              ref={(el) => (navItemsRef.current.home = el)}
              href="#home"
              style={{
                ...styles.navLink,
                ...(activeNav === "home" ? styles.navLinkActive : {}),
              }}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("home");
              }}
            >
              HOME
            </a>
            <a
              ref={(el) => (navItemsRef.current.communicate = el)}
              href="#communicate"
              style={{
                ...styles.navLink,
                ...(activeNav === "communicate" ? styles.navLinkActive : {}),
              }}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("communicate", handleNavigateToCommunication);
              }}
            >
              Communicate
            </a>
            <a
              ref={(el) => (navItemsRef.current.features = el)}
              href="#features"
              style={{
                ...styles.navLink,
                ...(activeNav === "features" ? styles.navLinkActive : {}),
              }}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("features");
              }}
            >
              Features
            </a>
            <a
              ref={(el) => (navItemsRef.current.howitworks = el)}
              href="#howitworks"
              style={{
                ...styles.navLink,
                ...(activeNav === "howitworks" ? styles.navLinkActive : {}),
              }}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("howitworks");
              }}
            >
              How it Works
            </a>
          </nav>
          <button style={styles.contactButton}>Contact</button>
        </header>

        {/* Main Content - Centered Layout */}
        <main style={styles.main}>
          {/* Main Heading */}
          <h1
            ref={mainHeadingRef}
            className="scroll-reveal"
            style={styles.mainHeading}
          >
            Real-time <span style={styles.animatedGradient}>AI-powered</span>{" "}
            communication enabling seamless interaction between deaf and hearing
            individuals.
          </h1>

          {/* Video Container - Centered and Blended */}
          <div
            ref={videoContainerRef}
            className="scroll-reveal"
            style={{
              ...styles.videoContainer,
              animation: "pulseGlow 5s ease-in-out infinite",
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              style={styles.video}
              src="https://res.cloudinary.com/drvllglbk/video/upload/v1766414856/homepage_cnmrax.mov"
            >
              Your browser does not support the video tag.
            </video>
            {/* Video blend overlay */}
            <div style={styles.videoBlendOverlay}></div>
          </div>

          {/* Feature Tags - Subheading with Background */}
          <div
            ref={featureTagsRef}
            className="scroll-reveal"
            style={styles.featureTagsContainer}
          >
            <div style={styles.featureTags}>
              <span style={styles.featureTag}>Conversational AI</span>
              <span style={styles.separator}>·</span>
              <span style={styles.featureTag}>Video</span>
              <span style={styles.separator}>·</span>
              <span style={styles.featureTag}>Voice</span>
              <span style={styles.separator}>·</span>
              <span style={styles.featureTag}>Chat</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div
            ref={ctaContainerRef}
            className="scroll-reveal"
            style={styles.ctaContainer}
          >
            <button
              onClick={handleNavigateToCommunication}
              style={styles.primaryButton}
            >
              Let's Communicate
            </button>
            <button
              onClick={handleNavigateToCommunication}
              style={styles.secondaryButton}
            >
              Get Started
            </button>
          </div>

          {/* Additional Info */}
          <p style={styles.additionalInfo}>
            Sign up and start building! You don't pay until you scale.
          </p>

          {/* Features Section - Cloudinary Video */}
          <div
            ref={featuresSectionRef}
            className="scroll-reveal"
            style={styles.featuresSection}
          >
            <h2 style={styles.sectionTitle}>Key Features</h2>
            <div style={styles.cloudinaryVideoContainer}>
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=drvllglbk&public_id=hero_section_cards_ywbrqp&profile=cld-default&autoplay=true&loop=true&muted=true&controls=false&player_controls=false"
                style={styles.cloudinaryVideo}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Key Features Video"
              ></iframe>
            </div>
          </div>

          {/* How It Works Section */}
          <div
            ref={howItWorksSectionRef}
            className="scroll-reveal"
            style={styles.howItWorksSection}
          >
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <div style={styles.stepsContainer}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <h3 style={styles.stepTitle}>Start Communication</h3>
                <p style={styles.stepText}>
                  Click "Let's Communicate" to begin your session
                </p>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <h3 style={styles.stepTitle}>Choose Your Mode</h3>
                <p style={styles.stepText}>
                  Use hand gestures or speech recognition for interaction
                </p>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <h3 style={styles.stepTitle}>Communicate Seamlessly</h3>
                <p style={styles.stepText}>
                  Real-time translation between sign language and speech
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add keyframe animations */}
      <style>{`
        /* Logo styling for white background */
        img[alt="He@r Me Logo"] {
          mix-blend-mode: normal;
        }
        img[alt="He@r Me Logo"]:hover {
          mix-blend-mode: normal;
        }
        
        ${starfield
          .map((star) => {
            return `
            @keyframes flowToCenter-${star.id} {
              0% {
                left: ${star.startLeft};
                top: ${star.startTop};
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
              }
              5% {
                opacity: 0.8;
                transform: translate(-50%, -50%) scale(1);
              }
              70% {
                left: ${star.endLeft};
                top: ${star.endTop};
                opacity: 0.6;
                transform: translate(-50%, -50%) scale(1);
              }
              85% {
                left: ${star.endLeft};
                top: ${star.endTop};
                opacity: 0.2;
                transform: translate(-50%, -50%) scale(0.8);
              }
              100% {
                left: ${star.endLeft};
                top: ${star.endTop};
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
              }
            }
          `;
          })
          .join("")}
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 40px rgba(96, 165, 250, 0.2)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.15));
          }
          33% {
            filter: drop-shadow(0 0 60px rgba(37, 99, 235, 0.35)) drop-shadow(0 0 90px rgba(29, 78, 216, 0.25)) drop-shadow(0 0 120px rgba(30, 64, 175, 0.15));
          }
          66% {
            filter: drop-shadow(0 0 70px rgba(168, 85, 247, 0.4)) drop-shadow(0 0 100px rgba(217, 70, 239, 0.3)) drop-shadow(0 0 130px rgba(236, 72, 153, 0.2));
          }
        }
        
        /* Sora-style scroll reveal animations */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        
        .scroll-reveal.scroll-revealed {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        button:hover {
          filter: brightness(1.2);
        }
        
        /* Scroll effect - elements come forward */
        main > * {
          position: relative;
          z-index: 2;
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* Sticky header scroll effect */
        header {
          transition: all 0.3s ease;
        }
        
        @supports (backdrop-filter: blur(10px)) {
          header {
            backdrop-filter: blur(10px);
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 36px !important;
          }
          .videoContainer {
            max-width: 100% !important;
            margin: 40px 0 !important;
          }
          .ctaContainer {
            flex-direction: column !important;
            width: 100%;
          }
          button {
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  // Fixed Background Layer - Never Scrolls
  fixedBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "#ffffff",
    zIndex: 0,
    overflow: "hidden",
  },

  stars: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "120%",
    height: "120%",
    pointerEvents: "none",
    zIndex: 1,
    overflow: "visible",
  },

  star: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    transform: "translate(-50%, -50%)",
  },

  starDot: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "currentColor",
    boxShadow: "0 0 6px currentColor, 0 0 12px currentColor",
    filter: "blur(0.5px)",
  },

  // Scrollable Foreground Container
  scrollContainer: {
    position: "relative",
    zIndex: 10,
    minHeight: "100vh",
    color: "#1a1a1a",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 60px",
    position: "relative",
    zIndex: 10,
  },

  logo: {
    display: "flex",
    alignItems: "center",
    height: "110px",
    backgroundColor: "transparent",
  },

  logoImage: {
    height: "110px",
    width: "auto",
    maxWidth: "none",
    objectFit: "contain",
    display: "block",
    backgroundColor: "transparent",
  },

  nav: {
    display: "flex",
    gap: "40px",
    alignItems: "center",
    position: "relative",
  },

  navIndicator: {
    position: "absolute",
    bottom: "-8px",
    height: "3px",
    background: "linear-gradient(90deg, #7D52FD 0%, #6366f1 100%)",
    borderRadius: "2px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow:
      "0 0 10px rgba(125, 82, 253, 0.4), 0 0 20px rgba(99, 102, 241, 0.3)",
    zIndex: 1,
  },

  navLink: {
    color: "#1a1a1a",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    cursor: "pointer",
    opacity: 0.8,
    padding: "8px 16px",
    borderRadius: "6px",
    position: "relative",
    zIndex: 2,
  },

  navLinkActive: {
    color: "#7D52FD",
    opacity: 1,
    fontWeight: "600",
    textShadow: "none",
  },

  contactButton: {
    padding: "10px 24px",
    backgroundColor: "rgba(125, 82, 253, 0.1)",
    color: "#7D52FD",
    border: "1px solid rgba(125, 82, 253, 0.3)",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 15px rgba(125, 82, 253, 0.1)",
  },

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0px 20px",
    textAlign: "center",
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "calc(100vh - 60px)",
    animation: "fadeInUp 0.8s ease-out",
    marginTop: "-30px",
    transform: "translateZ(0)",
  },

  videoContainer: {
    width: "100%",
    maxWidth: "900px",
    aspectRatio: "16/9",
    borderRadius: "0",
    overflow: "visible",
    position: "relative",
    margin: "8px 0",
    backgroundColor: "transparent",
    filter:
      "drop-shadow(0 0 40px rgba(125, 82, 253, 0.2)) drop-shadow(0 0 60px rgba(99, 102, 241, 0.15))",
    zIndex: 2,
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    borderRadius: "24px",
    opacity: 0.95,
  },

  videoBlendOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "120%",
    height: "120%",
    background: "transparent",
    pointerEvents: "none",
    zIndex: -1,
  },

  mainHeading: {
    fontSize: "48px",
    fontWeight: "700",
    lineHeight: "1.1",
    marginBottom: "4px",
    marginTop: "0px",
    letterSpacing: "-1px",
    maxWidth: "1000px",
    color: "#1a1a1a",
  },

  animatedGradient: {
    background:
      "linear-gradient(90deg, #9CFFAC 0%, #9CFFAC 25%, #FFFFFF 50%, #7D52FD 75%, #7D52FD 100%)",
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: "700",
    animation: "gradientShift 4s ease-in-out infinite",
    display: "inline-block",
  },

  featureTagsContainer: {
    marginTop: "24px",
    marginBottom: "8px",
    padding: "16px 32px",
    backgroundColor: "rgba(125, 82, 253, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(125, 82, 253, 0.2)",
    backdropFilter: "blur(10px)",
    display: "inline-block",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
  },

  featureTags: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: "400",
    opacity: 1,
  },

  featureTag: {
    color: "#7D52FD",
    fontWeight: "400",
  },

  separator: {
    color: "rgba(0, 0, 0, 0.3)",
  },

  ctaContainer: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "16px 48px",
    background: "linear-gradient(135deg, #7D52FD 0%, #6366f1 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 8px 32px rgba(125, 82, 253, 0.3)",
    letterSpacing: "0.5px",
  },

  secondaryButton: {
    padding: "16px 48px",
    backgroundColor: "transparent",
    color: "#7D52FD",
    border: "2px solid #7D52FD",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 16px rgba(125, 82, 253, 0.1)",
    letterSpacing: "0.5px",
  },

  additionalInfo: {
    marginTop: "12px",
    fontSize: "13px",
    opacity: 0.6,
    fontWeight: "400",
    color: "#666",
  },

  featuresSection: {
    marginTop: "80px",
    width: "100%",
    maxWidth: "1400px",
    marginBottom: "40px",
  },

  cloudinaryVideoContainer: {
    width: "100%",
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "transparent",
    aspectRatio: "16/9",
    marginTop: "40px",
  },

  cloudinaryVideo: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    pointerEvents: "none",
  },

  sectionTitle: {
    fontSize: "36px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "40px",
    color: "#1a1a1a",
    letterSpacing: "-1px",
  },

  howItWorksSection: {
    marginTop: "100px",
    width: "100%",
    maxWidth: "1200px",
    marginBottom: "60px",
  },

  stepsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    marginTop: "40px",
    flexWrap: "wrap",
  },

  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "250px",
    maxWidth: "300px",
    textAlign: "center",
    padding: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "16px",
    border: "1px solid rgba(125, 82, 253, 0.2)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  },

  stepNumber: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "rgba(125, 82, 253, 0.1)",
    border: "2px solid rgba(125, 82, 253, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: "#7D52FD",
    margin: "0 auto 20px",
    boxShadow: "0 0 20px rgba(125, 82, 253, 0.15)",
  },

  stepTitle: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#1a1a1a",
  },

  stepText: {
    fontSize: "15px",
    color: "rgba(0, 0, 0, 0.7)",
    lineHeight: "1.6",
  },
};

// Add hover effects via CSS-in-JS
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
    }
    a:hover {
      opacity: 1 !important;
    }
    /* Hide Cloudinary video controls */
    iframe[src*="player.cloudinary.com"] {
      pointer-events: none;
    }
  `;
  if (!document.head.querySelector("style[data-home-styles]")) {
    styleSheet.setAttribute("data-home-styles", "true");
    document.head.appendChild(styleSheet);
  }
}

export default HomePage;
