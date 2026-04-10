"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DoorEntrance from "./DoorEntrance";

/* ════════  Interfaces  ════════ */
interface NavItem { id: string; label: string; url: string; sortOrder: number }
interface GalleryCategory { id: string; name: string; slug: string }
interface GalleryImage { id: string; title: string; url: string; caption: string | null; categoryId: string; category?: { name: string } }
interface FormDef { id: string; name: string; slug: string; description: string | null; fields: string }
interface Props {
  settings: Record<string, string>;
  navigation: NavItem[];
  galleryCategories: GalleryCategory[];
  galleryImages: GalleryImage[];
  forms: FormDef[];
}

/* ════════  Chettinad Pattern SVG  ════════ */
const ChettinadBg = ({ color = "#D4A853", opacity = 0.04 }: { color?: string; opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="chPat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="18" fill="none" stroke={color} strokeWidth="0.7" />
        <circle cx="40" cy="40" r="8" fill="none" stroke={color} strokeWidth="0.5" />
        <path d="M40 22L40 0M40 58L40 80M22 40L0 40M58 40L80 40" stroke={color} strokeWidth="0.4" />
        <path d="M28 28L12 12M52 28L68 12M28 52L12 68M52 52L68 68" stroke={color} strokeWidth="0.3" />
        <rect x="36" y="36" width="8" height="8" fill="none" stroke={color} strokeWidth="0.4" transform="rotate(45 40 40)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#chPat)" />
  </svg>
);

/* ════════  Scroll-reveal Hook  ════════ */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ════════  Parallax Hook  ════════ */
function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handler = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setOffset((rect.top - window.innerHeight / 2) * speed);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [speed]);
  return { ref, offset };
}

/* ════════  Animated Counter  ════════ */
function AnimCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const r = useReveal(0.5);
  useEffect(() => {
    if (!r.visible) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [r.visible, target, duration]);
  return <span ref={r.ref}>{count}+</span>;
}

/* ════════  Floating Particles  ════════ */
const FloatingParticles = ({ count = 20, color = "#D4A853" }: { count?: number; color?: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(count)].map((_, i) => {
      const size = 2 + (i % 4);
      const left = (i * 17.3 + 5) % 100;
      const delay = (i * 1.7) % 8;
      const dur = 8 + (i % 6) * 2;
      return (
        <div key={i} className="absolute rounded-full" style={{
          width: size, height: size, background: color, opacity: 0.15,
          left: `${left}%`, bottom: `-${size}px`,
          animation: `siteParticleFloat ${dur}s ease-in-out ${delay}s infinite`,
        }} />
      );
    })}
  </div>
);

/* ════════  Main Component  ════════ */
export default function PublicSite({ settings, navigation, galleryCategories, galleryImages, forms }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [doorComplete, setDoorComplete] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeForm, setActiveForm] = useState<FormDef | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<GalleryImage | null>(null);

  // Parallax refs
  const heroParallax = useParallax(0.4);
  const aboutReveal = useReveal();
  const servicesReveal = useReveal();
  const galleryReveal = useReveal();
  const statsReveal = useReveal();
  const contactReveal = useReveal();

  // Scroll listener for nav + parallax
  useEffect(() => {
    const handler = () => {
      setScrollY(window.scrollY);
      setNavSolid(window.scrollY > 80);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Persist dark mode
  useEffect(() => {
    const saved = localStorage.getItem("ns_dark");
    if (saved === "true") setDarkMode(true);
  }, []);
  useEffect(() => { localStorage.setItem("ns_dark", String(darkMode)); }, [darkMode]);

  // Lock body scroll when modal or lightbox is open
  useEffect(() => {
    if (activeForm || lightboxImg) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeForm, lightboxImg]);

  const handleDoorComplete = useCallback(() => setDoorComplete(true), []);

  const t = darkMode
    ? { bg: "#0f0d1a", card: "#1a1832", text: "#e8e4f0", heading: "#d4af37", accent: "#d4af37", accentHover: "#e5c44a", border: "#2a2745", navBg: "rgba(15,13,26,0.92)", heroBg: "radial-gradient(ellipse at 30% 20%, #1a1832 0%, #0f0d1a 50%, #060510 100%)", sectionAlt: "#161430", footerBg: "#0a0918", shimmer: "rgba(212,175,55,0.08)", logoFilter: "invert(1) brightness(1)" }
    : { bg: "#fffdf8", card: "#ffffff", text: "#2a1f14", heading: "#8B6914", accent: "#c8962e", accentHover: "#a87b20", border: "#f0e4cc", navBg: "rgba(255,253,248,0.88)", heroBg: "radial-gradient(ellipse at 20% 10%, #fdf6e8 0%, #faf0d8 30%, #f5e8c4 60%, #ede0b8 100%)", sectionAlt: "#faf5ea", footerBg: "#1c1408", shimmer: "rgba(200,150,46,0.07)", logoFilter: "none" };

  const filteredImages = activeCategory === "all" ? galleryImages : galleryImages.filter((img) => img.categoryId === activeCategory);

  // Auto-hide nav items that link to sections with no content
  const availableSections = new Set(["#home", "#about", "#services"]);
  if (galleryImages.length > 0) availableSections.add("#gallery");
  if (forms.length > 0) availableSections.add("#contact");
  const visibleNavigation = navigation.filter((nav) => availableSections.has(nav.url));

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;
    setFormError("");
    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: activeForm.id, data: formData }),
      });
      if (res.ok) {
        setFormSuccess(true);
        setFormData({});
        setTimeout(() => { setFormSuccess(false); setActiveForm(null); }, 3000);
      } else {
        const data = await res.json();
        setFormError(data.error || "Submission failed");
      }
    } catch { setFormError("Network error"); }
  };

  const renderField = (field: { name: string; label: string; type: string; required: boolean; options?: string[] }) => {
    const cls = "w-full border rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:scale-[1.01]";
    const st = { backgroundColor: t.card, color: t.text, borderColor: t.border };
    switch (field.type) {
      case "textarea": return <textarea name={field.name} required={field.required} value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} rows={4} className={cls} style={st} />;
      case "select": return (
        <select name={field.name} required={field.required} value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={cls} style={st}>
          <option value="">Select...</option>
          {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
      default: return <input type={field.type} name={field.name} required={field.required} value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} min={field.type === "number" ? "0" : undefined} className={cls} style={st} />;
    }
  };

  const services = [
    { icon: "🛕", title: "Cultural Events", desc: "Traditional celebrations, Pongal, Deepavali & community gatherings" },
    { icon: "🤝", title: "Networking", desc: "Connect with fellow Nagarathars across KSA" },
    { icon: "📚", title: "Heritage Programs", desc: "Language classes, temple history & Chettinad traditions" },
    { icon: "❤️", title: "Community Support", desc: "Benevolent assistance, career guidance & family support" },
    { icon: "🎭", title: "Youth Programs", desc: "Leadership development & cultural education for the next generation" },
    { icon: "🏠", title: "Heritage Tours", desc: "Organized visits to Chettinad ancestral homes & temples" },
  ];

  return (
    <>
      {/* ════ 3D Cinematic Door Entrance ════ */}
      {!doorComplete && <DoorEntrance onComplete={handleDoorComplete} darkMode={darkMode} />}

      <div style={{ backgroundColor: t.bg, color: t.text, minHeight: "100vh" }} className={`transition-colors duration-500 ${doorComplete ? "siteRevealIn" : "opacity-0"}`}>

        {/* ════ Navigation ════ */}
        <nav className="fixed top-0 w-full z-50 transition-all duration-500" style={{
          backgroundColor: navSolid ? t.navBg : "transparent",
          backdropFilter: navSolid ? "blur(20px) saturate(180%)" : "none",
          borderBottom: navSolid ? `1px solid ${t.border}` : "1px solid transparent",
          boxShadow: navSolid ? "0 4px 30px rgba(0,0,0,0.1)" : "none",
        }}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Nagarathar Sangam KSA" className="transition-all duration-500 group-hover:scale-110" style={{ width: 180, height: "auto", filter: t.logoFilter }} />
            </a>
            <div className="hidden md:flex items-center gap-1">
              {visibleNavigation.map((nav) => (
                <a key={nav.id} href={nav.url} className="relative px-4 py-2 text-sm tracking-wide transition-all duration-300 hover:text-amber-500 group" style={{ color: t.text, fontFamily: "'Cinzel', serif" }}>
                  {nav.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </a>
              ))}
              <button onClick={() => setDarkMode(!darkMode)} className="ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 hover:rotate-180 hover:scale-110" style={{ backgroundColor: t.shimmer, border: `1px solid ${t.border}` }}>
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
            <button className="md:hidden text-2xl p-2" onClick={() => setMobileMenu(!mobileMenu)} style={{ color: t.text }}>
              <div className="space-y-1.5 transition-all duration-300" style={{ transform: mobileMenu ? "rotate(90deg)" : "none" }}>
                <span className="block w-6 h-0.5 rounded-full transition-all duration-300" style={{ background: t.accent, transform: mobileMenu ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
                <span className="block w-6 h-0.5 rounded-full transition-all duration-300" style={{ background: t.accent, opacity: mobileMenu ? 0 : 1 }} />
                <span className="block w-6 h-0.5 rounded-full transition-all duration-300" style={{ background: t.accent, transform: mobileMenu ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
              </div>
            </button>
          </div>
          {/* Mobile menu */}
          <div className="md:hidden overflow-hidden transition-all duration-500" style={{
            maxHeight: mobileMenu ? 400 : 0, backgroundColor: t.navBg, backdropFilter: "blur(20px)",
          }}>
            <div className="px-6 pb-4 space-y-1">
              {visibleNavigation.map((nav) => (
                <a key={nav.id} href={nav.url} className="block py-3 text-sm tracking-wide border-b transition-colors duration-300" style={{ color: t.text, borderColor: t.border, fontFamily: "'Cinzel', serif" }} onClick={() => setMobileMenu(false)}>
                  {nav.label}
                </a>
              ))}
              <button onClick={() => { setDarkMode(!darkMode); setMobileMenu(false); }} className="py-3 text-sm" style={{ color: t.accent }}>
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          </div>
        </nav>

        {/* ════ Hero Section with Parallax ════ */}
        <section id="home" ref={heroParallax.ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: t.heroBg }} />
          <ChettinadBg color={t.accent} opacity={darkMode ? 0.07 : 0.09} />
          <FloatingParticles color={t.accent} count={40} />

          {/* Parallax circles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full border-2 opacity-20" style={{ width: 600, height: 600, top: "10%", left: "-10%", borderColor: t.accent, transform: `translateY(${heroParallax.offset * 0.5}px)` }} />
            <div className="absolute rounded-full border-2 opacity-15" style={{ width: 400, height: 400, bottom: "5%", right: "-5%", borderColor: t.accent, transform: `translateY(${heroParallax.offset * 0.3}px)` }} />
            <div className="absolute rounded-full opacity-15" style={{ width: 250, height: 250, top: "30%", right: "15%", background: `radial-gradient(circle, ${t.accent}, transparent)`, transform: `translateY(${heroParallax.offset * 0.7}px)` }} />
            <div className="absolute rounded-full opacity-10" style={{ width: 150, height: 150, top: "60%", left: "10%", background: `radial-gradient(circle, ${t.accent}, transparent)`, transform: `translateY(${heroParallax.offset * 0.4}px)` }} />
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center px-6 max-w-4xl" style={{ transform: `translateY(${scrollY * 0.15}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
            {/* Animated logo */}
            <div className="mx-auto mb-8 heroLogoFloat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Nagarathar Sangam KSA" className={`mx-auto ${darkMode ? "heroLogoGlowDark" : "heroLogoGlow"}`} style={{ width: 320, height: "auto" }} />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 heroTitleReveal" style={{ fontFamily: "'Cinzel Decorative', cursive", color: t.accent, textShadow: darkMode ? `0 0 80px ${t.accent}66, 0 0 40px ${t.accent}33` : `0 2px 20px ${t.accent}22` }}>
              {settings.hero_title || "Nagarathar Sangam"}
            </h1>
            <div className="w-40 h-1 mx-auto mb-6 heroLineReveal" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`, boxShadow: `0 0 12px ${t.accent}44` }} />
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 heroSubReveal" style={{ fontFamily: "'Cormorant Garamond', serif", opacity: 0.85, lineHeight: 1.8 }}>
              {settings.hero_subtitle || "Preserving Our Heritage, Building Our Future in the Kingdom"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center heroButtonsReveal">
              <a href="#about" className="group relative px-10 py-4 rounded-full text-white font-medium overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: t.accent, fontFamily: "'Cinzel', serif", boxShadow: `0 8px 32px ${t.accent}44` }}>
                <span className="relative z-10">Discover More</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </a>
              <a href="#contact" className="px-10 py-4 rounded-full font-medium border-2 transition-all duration-500 hover:scale-105" style={{ borderColor: t.accent, color: t.accent, fontFamily: "'Cinzel', serif" }}>
                Join Us
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scrollIndicator">
            <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: `${t.accent}55` }}>
              <div className="w-1 h-2 rounded-full scrollDot" style={{ background: t.accent }} />
            </div>
          </div>
        </section>

        {/* ════ Stats Bar ════ */}
        <section className="relative py-12 overflow-hidden" style={{ background: darkMode ? "linear-gradient(90deg, #1a1832, #0f0d1a, #1a1832)" : "linear-gradient(90deg, #fdf6e8, #f5e8c4 30%, #ede0b8 50%, #f5e8c4 70%, #fdf6e8)" }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 statsShimmer" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}10, transparent)` }} />
          </div>
          <div ref={statsReveal.ref} className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { num: 500, label: "Community Members" },
              { num: 50, label: "Events Per Year" },
              { num: 15, label: "Years of Heritage" },
              { num: 10, label: "Cities Across KSA" },
            ].map((stat, i) => (
              <div key={i} className={`text-center transition-all duration-700 ${statsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: t.accent, fontFamily: "'Cinzel', serif" }}>
                  <AnimCounter target={stat.num} />
                </p>
                <p className="text-xs tracking-widest uppercase opacity-60">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════ About Section ════ */}
        <section id="about" className="relative py-24 px-6 overflow-hidden">
          <ChettinadBg color={t.accent} opacity={darkMode ? 0.02 : 0.03} />
          <div ref={aboutReveal.ref} className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className={`text-xs tracking-[0.4em] uppercase mb-3 transition-all duration-700 ${aboutReveal.visible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: t.accent }}>OUR STORY</p>
              <h2 className={`text-3xl md:text-5xl font-bold mb-4 transition-all duration-700 delay-100 ${aboutReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ fontFamily: "'Cinzel', serif", color: t.heading }}>About Us</h2>
              <div className={`w-20 h-0.5 mx-auto transition-all duration-700 delay-200 ${aboutReveal.visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} style={{ background: t.accent }} />
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-1000 delay-300 ${aboutReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
                <p className="text-lg leading-relaxed mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 2 }}>
                  {settings.about_text || "We are a vibrant community of Nagarathars (Chettiars) residing in the Kingdom of Saudi Arabia, united by our rich cultural heritage, traditions, and values passed down through generations."}
                </p>
                <p className="text-lg leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 2, opacity: 0.8 }}>
                  Our Sangam serves as a bridge connecting families, preserving our ancient temple traditions, and creating opportunities for the community to thrive together in the Kingdom.
                </p>
              </div>
              <div className={`relative transition-all duration-1000 delay-500 ${aboutReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
                <div className="relative rounded-2xl overflow-hidden p-8 aboutCardFloat" style={{ background: `linear-gradient(135deg, ${t.shimmer}, ${t.card})`, border: `1px solid ${t.border}`, boxShadow: `0 20px 60px ${darkMode ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)"}` }}>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: "🛕", label: "Temples" },
                      { icon: "🎪", label: "Events" },
                      { icon: "🤝", label: "Community" },
                      { icon: "📿", label: "Traditions" },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-4 rounded-xl transition-all duration-300 hover:scale-105" style={{ background: t.shimmer }}>
                        <span className="text-3xl mb-2 block">{item.icon}</span>
                        <p className="text-sm font-medium" style={{ fontFamily: "'Cinzel', serif" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-4 -right-4 w-20 h-20 opacity-20" style={{ backgroundImage: `radial-gradient(${t.accent} 1.5px, transparent 1.5px)`, backgroundSize: "10px 10px" }} />
              </div>
            </div>
          </div>
        </section>

        {/* ════ Services Section ════ */}
        <section id="services" className="relative py-24 px-6 overflow-hidden" style={{ backgroundColor: t.sectionAlt }}>
          <FloatingParticles color={t.accent} count={12} />
          <div ref={servicesReveal.ref} className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className={`text-xs tracking-[0.4em] uppercase mb-3 transition-all duration-700 ${servicesReveal.visible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: t.accent }}>WHAT WE DO</p>
              <h2 className={`text-3xl md:text-5xl font-bold mb-4 transition-all duration-700 delay-100 ${servicesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ fontFamily: "'Cinzel', serif", color: t.heading }}>Our Services</h2>
              <div className={`w-20 h-0.5 mx-auto transition-all duration-700 delay-200 ${servicesReveal.visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} style={{ background: t.accent }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, i) => (
                <div key={i} className={`group relative rounded-2xl p-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 cursor-default ${servicesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: `${i * 100 + 300}ms`, backgroundColor: t.card, border: `1px solid ${t.border}`, boxShadow: `0 4px 20px ${darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}` }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${t.accent}08, transparent)` }} />
                  <div className="relative z-10">
                    <span className="text-4xl mb-4 block transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">{svc.icon}</span>
                    <h3 className="text-lg font-bold mb-2 transition-colors duration-300 group-hover:text-amber-500" style={{ fontFamily: "'Cinzel', serif", color: t.heading }}>{svc.title}</h3>
                    <p className="text-sm leading-relaxed opacity-70">{svc.desc}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accentHover})` }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ Gallery Section ════ */}
        {galleryImages.length > 0 && (
          <section id="gallery" className="relative py-24 px-6 overflow-hidden">
            <ChettinadBg color={t.accent} opacity={darkMode ? 0.02 : 0.03} />
            <div ref={galleryReveal.ref} className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <p className={`text-xs tracking-[0.4em] uppercase mb-3 transition-all duration-700 ${galleryReveal.visible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: t.accent }}>OUR MEMORIES</p>
                <h2 className={`text-3xl md:text-5xl font-bold mb-4 transition-all duration-700 delay-100 ${galleryReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ fontFamily: "'Cinzel', serif", color: t.heading }}>Gallery</h2>
                <div className={`w-20 h-0.5 mx-auto transition-all duration-700 delay-200 ${galleryReveal.visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} style={{ background: t.accent }} />
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {[{ id: "all", name: "All" }, ...galleryCategories].map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="px-6 py-2.5 rounded-full text-sm tracking-wide transition-all duration-500 hover:scale-105" style={{
                    backgroundColor: activeCategory === cat.id ? t.accent : "transparent",
                    color: activeCategory === cat.id ? "#fff" : t.text,
                    border: `1.5px solid ${activeCategory === cat.id ? t.accent : t.border}`,
                    fontFamily: "'Cinzel', serif",
                    boxShadow: activeCategory === cat.id ? `0 4px 20px ${t.accent}44` : "none",
                  }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Image grid with staggered reveal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredImages.map((img, i) => (
                  <div key={img.id} onClick={() => setLightboxImg(img)} className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 ${galleryReveal.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`} style={{ transitionDelay: `${i * 80 + 300}ms`, backgroundColor: t.card, boxShadow: `0 4px 20px ${darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)"}` }}>
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl border border-white/30 scale-50 group-hover:scale-100 transition-transform duration-500">🔍</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-sm" style={{ fontFamily: "'Cinzel', serif" }}>{img.title}</p>
                      {img.caption && <p className="text-xs opacity-50 mt-1">{img.caption}</p>}
                      <p className="text-xs mt-1" style={{ color: t.accent }}>{img.category?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════ CTA / Join Banner ════ */}
        <section className="relative py-24 px-6 overflow-hidden" style={{ background: darkMode ? "linear-gradient(135deg, #1a1832, #0f0d1a)" : "linear-gradient(135deg, #fdf6e8, #f0ddb0 40%, #e8d098 60%, #fdf6e8)" }}>
          <FloatingParticles color={t.accent} count={15} />
          <ChettinadBg color={t.accent} opacity={0.03} />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Cinzel Decorative', cursive", color: t.accent }}>
              Join Our Community
            </h2>
            <p className="text-lg mb-10 opacity-80" style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.8 }}>
              Be part of our growing family. Connect with fellow Nagarathars, celebrate our traditions, and build a stronger community together.
            </p>
            <a href="#contact" className="group relative inline-block px-12 py-4 rounded-full text-white font-medium overflow-hidden transition-all duration-500 hover:scale-105" style={{ backgroundColor: t.accent, fontFamily: "'Cinzel', serif", boxShadow: `0 8px 32px ${t.accent}44` }}>
              <span className="relative z-10">Register Now</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </a>
          </div>
        </section>

        {/* ════ Forms / Contact Section ════ */}
        {forms.length > 0 && (
          <section id="contact" className="relative py-24 px-6 overflow-hidden" style={{ backgroundColor: t.sectionAlt }}>
            <div ref={contactReveal.ref} className="max-w-5xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <p className={`text-xs tracking-[0.4em] uppercase mb-3 transition-all duration-700 ${contactReveal.visible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: t.accent }}>REACH OUT</p>
                <h2 className={`text-3xl md:text-5xl font-bold mb-4 transition-all duration-700 delay-100 ${contactReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ fontFamily: "'Cinzel', serif", color: t.heading }}>Get In Touch</h2>
                <div className={`w-20 h-0.5 mx-auto transition-all duration-700 delay-200 ${contactReveal.visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} style={{ background: t.accent }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {forms.map((f, i) => (
                  <button key={f.id} onClick={() => { setActiveForm(f); setFormData({}); setFormSuccess(false); setFormError(""); }}
                    className={`group relative p-8 rounded-2xl text-left transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 ${contactReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                    style={{ transitionDelay: `${i * 150 + 300}ms`, backgroundColor: t.card, border: `1px solid ${t.border}` }}>
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accentHover})` }} />
                    <h3 className="text-lg font-bold mb-3 transition-colors duration-300 group-hover:text-amber-500" style={{ color: t.heading, fontFamily: "'Cinzel', serif" }}>{f.name}</h3>
                    {f.description && <p className="text-sm opacity-60 leading-relaxed">{f.description}</p>}
                    <div className="mt-4 flex items-center gap-2 text-xs tracking-wide transition-all duration-300 group-hover:translate-x-2" style={{ color: t.accent }}>
                      <span>Open Form</span><span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════ Footer ════ */}
        <footer className="relative py-16 px-6 overflow-hidden" style={{ backgroundColor: t.footerBg }}>
          <ChettinadBg color="#D4A853" opacity={0.03} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="Nagarathar Sangam KSA" style={{ width: 100, height: "auto", filter: "invert(1) brightness(1)" }} />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{settings.site_description || "Chettinad Community in Saudi Arabia"}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-4 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Quick Links</p>
                <div className="space-y-2">
                  {navigation.map((nav) => (
                    <a key={nav.id} href={nav.url} className="block text-sm text-gray-400 hover:text-amber-400 transition-colors duration-300">{nav.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-4 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Contact</p>
                {settings.contact_email && <p className="text-sm text-gray-400 mb-2">📧 {settings.contact_email}</p>}
                {settings.contact_phone && <p className="text-sm text-gray-400">📞 {settings.contact_phone}</p>}
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500">© {new Date().getFullYear()} {settings.site_name || "Nagarathar Sangam KSA"}. All rights reserved.</p>
              <p className="text-xs text-gray-600">Preserving Heritage | Building Community | KSA</p>
            </div>
          </div>
        </footer>

        {/* ════ Scroll-to-top Button ════ */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 shadow-lg"
          style={{
            backgroundColor: t.accent,
            color: "#fff",
            opacity: scrollY > 300 ? 1 : 0,
            pointerEvents: scrollY > 300 ? "all" : "none",
            transform: scrollY > 300 ? "translateY(0)" : "translateY(20px)",
          }}
        >
          ↑
        </button>
      </div>

      {/* ════ Form Modal (outside main div to avoid stacking context issues) ════ */}
      {activeForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} className="formModalOverlay">
          {/* Backdrop — click to close */}
          <div style={{ position: "absolute", inset: 0, cursor: "pointer", backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)" }} onClick={() => setActiveForm(null)} />

          {/* Modal content — solid background */}
          <div className="formModalIn" style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 20,
            padding: 32,
            backgroundColor: darkMode ? "#1a1832" : "#ffffff",
            border: `1px solid ${darkMode ? "#2a2745" : "#e8dcc0"}`,
            boxShadow: darkMode
              ? "0 32px 80px rgba(0,0,0,0.6)"
              : "0 32px 80px rgba(0,0,0,0.18)",
          }}>
            {/* Top decorative line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />

            {/* Close button */}
            <button onClick={() => setActiveForm(null)} style={{
              position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              backgroundColor: darkMode ? "#2a2745" : "#f0ece0",
              border: "none",
              color: t.text, fontSize: 18, zIndex: 10, transition: "all 0.3s",
            }}>✕</button>

            {/* Header */}
            <div className="mb-8 pr-10">
              <h3 className="text-2xl font-bold" style={{ color: t.heading, fontFamily: "'Cinzel Decorative', cursive" }}>{activeForm.name}</h3>
              {activeForm.description && <p className="text-sm opacity-60 mt-2 leading-relaxed">{activeForm.description}</p>}
              <div className="w-16 h-0.5 mt-4" style={{ background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />
            </div>

            {formSuccess ? (
              <div className="text-center py-12 formSuccessReveal">
                <div className="text-6xl mb-6">✅</div>
                <p className="text-xl font-medium" style={{ fontFamily: "'Cinzel', serif", color: t.heading }}>Thank You!</p>
                <p className="text-sm opacity-60 mt-3">Your submission has been received successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {formError && <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: darkMode ? "rgba(220,38,38,0.15)" : "#fef2f2", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>{formError}</div>}
                {(() => {
                  try {
                    const fields = JSON.parse(activeForm.fields) as { name: string; label: string; type: string; required: boolean; options?: string[]; showWhen?: Record<string, string[]> }[];
                    const selectedCategory = formData["fundCategory"] || "";
                    const visibleFields = fields.filter((field) => {
                      if (!field.showWhen) return true;
                      return Object.entries(field.showWhen).every(([depField, allowedValues]) => allowedValues.includes(formData[depField] || ""));
                    });
                    return visibleFields.map((field, fi: number) => (
                      <div key={field.name} className="formFieldReveal" style={{ animationDelay: `${fi * 60}ms` }}>
                        <label className="block text-sm font-medium mb-2 tracking-wide" style={{ color: t.text }}>{field.label} {field.required && <span style={{ color: t.accent }}>*</span>}</label>
                        {renderField(field)}
                      </div>
                    ));
                  } catch { return null; }
                })()}
                <button type="submit" className="group relative w-full py-4 rounded-xl text-white font-medium overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-[1.02]" style={{ backgroundColor: t.accent, fontFamily: "'Cinzel', serif", boxShadow: `0 8px 24px ${t.accent}44` }}>
                  <span className="relative z-10">Submit</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════ Lightbox (outside main div to avoid stacking context issues) ════ */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          padding: 20,
        }}>
          {/* Close button */}
          <button onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }} style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
            cursor: "pointer",
          }}>✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg.url}
            alt={lightboxImg.title}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "75vh", objectFit: "contain", borderRadius: 8 }}
          />
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", marginTop: 16 }}>
            <p style={{ color: "#fff", fontFamily: "'Cinzel', serif", fontWeight: 500 }}>{lightboxImg.title}</p>
            {lightboxImg.caption && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4 }}>{lightboxImg.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
