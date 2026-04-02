import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, useMotionValue, useTransform } from "motion/react";
import logoImage from "@/assets/logo.png";

export function IntroPage() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Mouse position for logo interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const logoRotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const logoRotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const logoScale = useTransform(mouseY, [-300, 300], [1, 1.05]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (currentSection === 0) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          mouseX.set(e.clientX - centerX);
          mouseY.set(e.clientY - centerY);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [currentSection, mouseX, mouseY]);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isScrolling.current) return;

      e.preventDefault();

      if (e.deltaY > 0 && currentSection < 2) {
        // Scroll down
        isScrolling.current = true;
        setCurrentSection(prev => prev + 1);
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      } else if (e.deltaY < 0 && currentSection > 0) {
        // Scroll up
        isScrolling.current = true;
        setCurrentSection(prev => prev - 1);
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      } else if (e.deltaY > 0 && currentSection === 2) {
        // Navigate to login from last section
        navigate("/login");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling.current) return;

      if ((e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") && currentSection < 2) {
        e.preventDefault();
        isScrolling.current = true;
        setCurrentSection(prev => prev + 1);
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      } else if ((e.key === "ArrowUp" || e.key === "PageUp") && currentSection > 0) {
        e.preventDefault();
        isScrolling.current = true;
        setCurrentSection(prev => prev - 1);
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      } else if ((e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") && currentSection === 2) {
        navigate("/login");
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection, navigate]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
    >
      {/* Section 1: Logo Only - Art Installation Style */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{
          opacity: currentSection === 0 ? 1 : 0,
          scale: currentSection === 0 ? 1 : 0.95,
          filter: currentSection === 0 ? "blur(0px)" : "blur(10px)"
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: currentSection === 0 ? "auto" : "none" }}
      >
        {/* Vignette effect */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, transparent 50%, black 100%)'
          }}
        />

        {/* Art Installation - Multiple Logo Objects */}
        <div className="relative w-full h-full">
          {/* Main Center Logo - Large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 2.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              rotateX: logoRotateX,
              rotateY: logoRotateY,
              transformStyle: "preserve-3d",
              perspective: 1000
            }}
          >
            {/* Frame border */}
            <div className="absolute inset-0 -m-8 border border-white/10 backdrop-blur-sm" />

            {/* Glow */}
            <div className="absolute inset-0 blur-[80px] bg-white/20 scale-150" />

            <motion.img
              src={logoImage}
              alt="IGNOA"
              className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
              style={{
                filter: "invert(1) brightness(1.1) drop-shadow(0 20px 60px rgba(255,255,255,0.15))"
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>

          {/* Top Left - Small, Overlapping */}
          <motion.div
            initial={{ opacity: 0, x: -100, y: -50, rotate: 15 }}
            animate={{ opacity: 0.4, x: 0, y: 0, rotate: 8 }}
            transition={{ duration: 2.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[15%] left-[8%] z-10"
            style={{
              rotateX: useTransform(mouseY, [-300, 300], [5, -5]),
              rotateY: useTransform(mouseX, [-300, 300], [-8, 8]),
              transformStyle: "preserve-3d"
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-sm" />
              <motion.img
                src={logoImage}
                alt=""
                className="relative w-32 h-32 md:w-40 md:h-40 object-contain opacity-80"
                style={{
                  filter: "invert(1) brightness(1.2) blur(0.5px)"
                }}
              />
            </div>
          </motion.div>

          {/* Top Right - Medium, Tilted */}
          <motion.div
            initial={{ opacity: 0, x: 100, y: -80, rotate: -20 }}
            animate={{ opacity: 0.6, x: 0, y: 0, rotate: -12 }}
            transition={{ duration: 3, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[20%] right-[12%] z-15"
            style={{
              rotateX: useTransform(mouseY, [-300, 300], [-8, 8]),
              rotateY: useTransform(mouseX, [-300, 300], [12, -12]),
              transformStyle: "preserve-3d"
            }}
          >
            <div className="relative">
              {/* Shadow */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 bg-black/40 blur-xl" />
              {/* Border frame */}
              <div className="absolute inset-0 -m-6 border-2 border-white/20" />
              <motion.img
                src={logoImage}
                alt=""
                className="relative w-44 h-44 md:w-56 md:h-56 object-contain"
                style={{
                  filter: "invert(1) brightness(1.15) drop-shadow(0 10px 30px rgba(0,0,0,0.5))"
                }}
              />
            </div>
          </motion.div>

          {/* Bottom Left - Large, Partially Off-screen */}
          <motion.div
            initial={{ opacity: 0, x: -150, y: 100, scale: 0.8 }}
            animate={{ opacity: 0.3, x: -80, y: 0, scale: 1 }}
            transition={{ duration: 3.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[5%] left-[-5%] z-5"
            style={{
              rotateX: useTransform(mouseY, [-300, 300], [15, -15]),
              rotateY: useTransform(mouseX, [-300, 300], [-15, 15]),
              transformStyle: "preserve-3d"
            }}
          >
            <div className="relative">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-lg" />
              <motion.img
                src={logoImage}
                alt=""
                className="relative w-72 h-72 md:w-96 md:h-96 object-contain opacity-70"
                style={{
                  filter: "invert(1) brightness(1.1) blur(1px)",
                  maskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)"
                }}
              />
            </div>
          </motion.div>

          {/* Bottom Right - Small, Sharp */}
          <motion.div
            initial={{ opacity: 0, x: 120, y: 120, rotate: 25 }}
            animate={{ opacity: 0.5, x: 0, y: 0, rotate: 18 }}
            transition={{ duration: 2.6, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[25%] right-[15%] z-25"
            style={{
              rotateX: useTransform(mouseY, [-300, 300], [-10, 10]),
              rotateY: useTransform(mouseX, [-300, 300], [10, -10]),
              transformStyle: "preserve-3d"
            }}
          >
            <div className="relative">
              {/* Glass frame effect */}
              <div className="absolute inset-0 -m-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-sm" />
              <motion.img
                src={logoImage}
                alt=""
                className="relative w-28 h-28 md:w-36 md:h-36 object-contain"
                style={{
                  filter: "invert(1) brightness(1.3) contrast(1.1) drop-shadow(0 0 20px rgba(255,255,255,0.3))"
                }}
                whileHover={{ rotate: 22, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Middle Right - Very Small, Far Out */}
          <motion.div
            initial={{ opacity: 0, x: 200, rotate: -30 }}
            animate={{ opacity: 0.25, x: 50, rotate: -15 }}
            transition={{ duration: 3.5, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[45%] right-[-3%] z-8"
            style={{
              rotateX: useTransform(mouseY, [-300, 300], [20, -20]),
              rotateY: useTransform(mouseX, [-300, 300], [20, -20]),
              transformStyle: "preserve-3d"
            }}
          >
            <motion.img
              src={logoImage}
              alt=""
              className="w-20 h-20 md:w-24 md:h-24 object-contain opacity-60"
              style={{
                filter: "invert(1) brightness(1.4) blur(0.8px)"
              }}
            />
          </motion.div>

          {/* Top Center - Medium, Behind Main */}
          <motion.div
            initial={{ opacity: 0, y: -150, scale: 1.2 }}
            animate={{ opacity: 0.15, y: -40, scale: 1 }}
            transition={{ duration: 4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 z-5"
          >
            <div className="relative">
              {/* Heavy blur for depth */}
              <motion.img
                src={logoImage}
                alt=""
                className="w-80 h-80 md:w-[28rem] md:h-[28rem] object-contain"
                style={{
                  filter: "invert(1) brightness(1) blur(4px)",
                  opacity: 0.4
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 3.5 }}
          className="absolute bottom-16 flex flex-col items-center gap-3 z-30"
        >
          <motion.p
            className="text-[10px] text-white/30 tracking-[0.3em] uppercase font-light"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll to continue
          </motion.p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }}
        />
      </motion.div>

      {/* Section 2: Brand Name + Slogan */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{
          opacity: currentSection === 1 ? 1 : 0,
          y: currentSection === 1 ? 0 : currentSection < 1 ? 100 : -100
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: currentSection === 1 ? "auto" : "none" }}
      >
        {/* Vignette effect */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, transparent 50%, black 100%)'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Brand Name - Serif */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: currentSection === 1 ? 1 : 0,
              y: currentSection === 1 ? 0 : 40
            }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 md:mb-16"
          >
            <h1
              className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] text-white mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                letterSpacing: "0.02em"
              }}
            >
              IGNOA
            </h1>

            {/* Decorative line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: currentSection === 1 ? "80%" : 0 }}
              transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1px] bg-white/20 mx-auto"
            />
          </motion.div>

          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: currentSection === 1 ? 1 : 0,
              y: currentSection === 1 ? 0 : 30
            }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/90 leading-relaxed"
              style={{
                fontFamily: "'Cabinet Grotesk', 'Pretendard', sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em"
              }}
            >
              가치를 선별하고 의도를 담아 거래하는
              <br />
              경매 기반 중고거래 플랫폼
            </p>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSection === 1 ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <motion.p
            className="text-[10px] text-white/30 tracking-[0.3em] uppercase font-light"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll to enter
          </motion.p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }}
        />
      </motion.div>

      {/* Section 3: Login Preview (before navigation) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          opacity: currentSection === 2 ? 1 : 0,
          y: currentSection === 2 ? 0 : 100
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: currentSection === 2 ? "auto" : "none" }}
      >
        {/* Vignette effect */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, transparent 50%, black 100%)'
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: currentSection === 2 ? 1 : 0,
            scale: currentSection === 2 ? 1 : 0.95
          }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center"
        >
          <h2
            className="text-5xl sm:text-6xl md:text-7xl text-white mb-8"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              letterSpacing: "0.05em"
            }}
          >
            Welcome
          </h2>
          <motion.p
            className="text-lg text-white/60 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSection === 2 ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Scroll to continue
          </motion.p>
        </motion.div>

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }}
        />
      </motion.div>

      {/* Section indicator dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => {
              if (!isScrolling.current) {
                setCurrentSection(index);
              }
            }}
            className="group relative w-2 h-2 transition-all"
            aria-label={`Go to section ${index + 1}`}
          >
            <div
              className={`w-full h-full rounded-full transition-all duration-500 ${
                currentSection === index
                  ? "bg-white scale-125"
                  : "bg-white/30 group-hover:bg-white/50"
              }`}
            />
            {currentSection === index && (
              <motion.div
                layoutId="activeSection"
                className="absolute inset-0 rounded-full border border-white/50"
                style={{ scale: 2 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
