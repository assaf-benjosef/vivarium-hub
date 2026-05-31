import { useEffect } from "react";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { TelegramDemo } from "./components/TelegramDemo";
import { Features } from "./components/Features";
import { ConsoleTieIn } from "./components/ConsoleTieIn";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";

export function App() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      style={{
        fontFamily: "var(--font-ui)",
        color: "var(--hi)",
        background: "var(--bg)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Hero />
      <HowItWorks />
      <TelegramDemo />
      <Features />
      <ConsoleTieIn />
      <FinalCta />
      <Footer />
    </div>
  );
}
