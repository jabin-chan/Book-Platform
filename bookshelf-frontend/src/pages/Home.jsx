import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Leaf, Sprout } from "lucide-react";

// Pure landing page for guests. Logged-in users are redirected to
// /my-bookshelf elsewhere (e.g. in App.js routing / after login), so this
// component never needs to branch on `user`.
//
// Golden-hour Ghibli-library palette, cel-shaded pass: flat fills + hard
// offset "sticker" shadows + hand-drawn asymmetric corners, no gradients,
// no blurred elevation shadows. Zero image assets — plants are Lucide
// icons, dust motes are tiny divs, the book/mug are inline SVG.
export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-[Poppins]"
      style={{
        background: "#FBEDD1", // flat golden-hour cream, no radial gradient
        animation: "bpFadeIn 1s ease-out both",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        @keyframes bpFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bp-page {
          transform-origin: left center;
          animation: bpTurn 5s ease-in-out infinite;
        }
        @keyframes bpTurn {
          0%, 15%  { transform: rotateY(0deg); }
          45%, 60% { transform: rotateY(-155deg); }
          90%,100% { transform: rotateY(0deg); }
        }

        .bp-steam {
          animation: bpRise 2.6s ease-in-out infinite;
        }
        @keyframes bpRise {
          0%   { opacity: 0; transform: translateY(0) scaleY(0.6) translateX(0); }
          25%  { opacity: 0.4; }
          60%  { opacity: 0.22; transform: translateY(-17px) scaleY(1) translateX(2px); }
          100% { opacity: 0; transform: translateY(-30px) scaleY(1.1) translateX(-2px); }
        }

        /* floating dust motes drifting through the light */
        .bp-mote {
          position: absolute;
          border-radius: 9999px;
          background: #F1D98C;
          pointer-events: none;
          animation: bpMote 6s ease-in-out infinite;
        }
        @keyframes bpMote {
          0%   { opacity: 0; transform: translateY(0) translateX(0); }
          20%  { opacity: 0.55; }
          50%  { opacity: 0.35; transform: translateY(-26px) translateX(6px); }
          80%  { opacity: 0.15; }
          100% { opacity: 0; transform: translateY(-52px) translateX(-4px); }
        }

        /* --- cel-shaded cushion card: hard offset shadow, no blur --- */
        .bp-card {
          border-radius: 30px 22px 34px 20px; /* hand-drawn, no two corners match */
          border: 3.5px solid #4A3423;
          box-shadow: 8px 8px 0 rgba(74,52,35,0.9);
        }

        /* --- cushion buttons: flat fill, hard sticker shadow, press interaction --- */
        .bp-btn {
          border: 2.5px solid #4A3423;
          box-shadow: 5px 5px 0 #4A3423;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .bp-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 7px 7px 0 #4A3423;
        }
        .bp-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #4A3423;
        }

        /* primary button gets a pulsing tea-green glow layered on TOP of
           the hard sticker shadow, so it stays cel-shaded but still glows */
        .bp-btn-glow {
          animation: bpGlow 3s ease-in-out infinite;
        }
        .bp-btn-glow:hover { animation-play-state: paused; }
        @keyframes bpGlow {
          0%, 100% { box-shadow: 5px 5px 0 #4A3423, 0 0 14px 2px rgba(139,166,124,0.45); }
          50%      { box-shadow: 5px 5px 0 #4A3423, 0 0 28px 8px rgba(139,166,124,0.65); }
        }
      `}</style>

      {/* drifting sunlight dust motes */}
      <div className="bp-mote w-[5px] h-[5px]" style={{ top: "22%", left: "30%", animationDelay: "0s" }} aria-hidden="true" />
      <div className="bp-mote w-[3px] h-[3px]" style={{ top: "38%", left: "62%", animationDelay: "1.4s" }} aria-hidden="true" />
      <div className="bp-mote w-[4px] h-[4px]" style={{ top: "60%", left: "22%", animationDelay: "2.8s" }} aria-hidden="true" />
      <div className="bp-mote w-[3px] h-[3px]" style={{ top: "70%", left: "72%", animationDelay: "4.1s" }} aria-hidden="true" />

      {/* leafy vine accents, tea-green to match the magical books in the window */}
      <Leaf aria-hidden="true" className="absolute -top-6 -left-6 text-[#A3B899] opacity-30 rotate-[-25deg]" size={140} strokeWidth={1.6} />
      <Sprout aria-hidden="true" className="absolute top-10 left-16 text-[#A3B899] opacity-25 rotate-[10deg] hidden sm:block" size={56} strokeWidth={1.6} />
      <Leaf aria-hidden="true" className="absolute -bottom-8 -right-8 text-[#A3B899] opacity-30 rotate-[150deg]" size={170} strokeWidth={1.6} />
      <Sprout aria-hidden="true" className="absolute bottom-14 right-20 text-[#A3B899] opacity-25 rotate-[-15deg] hidden sm:block" size={60} strokeWidth={1.6} />

      {/* chunky cushion card — flat ivory, thick hand-drawn outline, hard sticker shadow */}
      <div
        className="bp-card relative z-10 flex flex-col items-center text-center px-10 py-12 sm:px-14 sm:py-14 max-w-lg w-[calc(100%-2rem)] bg-[#FFFDF6] -rotate-[0.6deg]"
      >
        {/* hero: open book with a turning page + small mug w/ steam beside it */}
        <div className="relative w-[200px] h-[108px] mb-6" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(163,184,153,0.18) 0%, rgba(163,184,153,0) 70%)",
            }}
          />

          <div className="absolute left-1 bottom-0" style={{ perspective: "400px" }}>
            <svg width="140" height="94" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* cel-shaded: flat cream page + a hard-edged darker cream "shadow side" strip, no gradient */}
              <path d="M75 14 C 55 6, 30 6, 12 14 V 88 C 30 80, 55 80, 75 88 Z" fill="#FFFDF6" stroke="#4A3423" strokeWidth="3" />
              <path d="M75 14 C 60 8, 42 7, 30 10 V 82 C 42 79, 60 79, 75 84 Z" fill="#F5E5C9" stroke="none" />
              <path d="M75 14 C 95 6, 120 6, 138 14 V 88 C 120 80, 95 80, 75 88 Z" fill="#FFFDF6" stroke="#4A3423" strokeWidth="3" />
              <path d="M22 26 H62 M22 34 H58 M22 42 H62 M22 50 H54" stroke="#D8C69B" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M75 14 C 73 40, 73 62, 75 88" stroke="#4A3423" strokeWidth="2.5" opacity="0.6" />
            </svg>
            <svg className="bp-page absolute top-0 left-0" width="140" height="94" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M75 14 C 95 6, 120 6, 138 14 V 88 C 120 80, 95 80, 75 88 Z" fill="#FFFDF6" stroke="#4A3423" strokeWidth="3" />
              <path d="M86 26 H126 M86 34 H122 M86 42 H126 M86 50 H118" stroke="#D8C69B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="absolute right-0 bottom-0">
            <div className="bp-steam absolute bottom-[38px] left-[6px] w-[3px] h-[15px] rounded-sm bg-[#A3B899] opacity-0" style={{ animationDelay: "0s", transformOrigin: "bottom center" }} />
            <div className="bp-steam absolute bottom-[38px] left-[16px] w-[3px] h-[19px] rounded-sm bg-[#A3B899] opacity-0" style={{ animationDelay: "0.6s", transformOrigin: "bottom center" }} />
            <div className="bp-steam absolute bottom-[38px] left-[26px] w-[3px] h-[15px] rounded-sm bg-[#A3B899] opacity-0" style={{ animationDelay: "1.2s", transformOrigin: "bottom center" }} />
            <svg width="38" height="32" viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* flat mug + hard-edged shadow strip on one side instead of gradient */}
              <path d="M6 8 H28 V20 C28 26 23 30 18 30 H16 C11 30 6 26 6 20 V8 Z" fill="#FFFDF6" stroke="#4A3423" strokeWidth="2.5" />
              <path d="M20 9 H28 V20 C28 26 23 30 18 30 H16 C17.5 27 20 23.5 20 19 Z" fill="#F5E5C9" stroke="none" />
              <path d="M28 11 H33 C35.8 11 38 13.2 38 16 C38 18.8 35.8 21 33 21 H28" stroke="#4A3423" strokeWidth="2.5" fill="none" />
            </svg>
          </div>
        </div>

        <h1 className="font-[Georgia] text-[2.7rem] font-normal text-[#4A3423] tracking-wide mb-3">
          Brewed Pages
        </h1>
        <p className="text-base font-light text-[#4A3423]/70 leading-relaxed mb-9 max-w-[340px]">
          A quiet corner to discover books, write reviews, and build your personal library.
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="bp-btn bp-btn-glow inline-flex items-center gap-2 bg-[#A3B899] text-[#33422F] text-sm font-semibold px-8 py-3.5 rounded-full group"
        >
          Join the Community
          <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        <p className="mt-4 text-sm text-[#4A3423]/70">
          Already part of the community?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-[#4A3423] border-b-2 border-[#A3B899] hover:border-[#4A3423] transition-colors duration-200"
          >
            Log in
          </button>
        </p>

        <div className="w-24 h-[3px] bg-[#D8C69B] rounded-full my-8 mx-auto" />

        <button
          onClick={() => navigate("/explore")}
          className="bp-btn inline-flex items-center gap-2 bg-[#FFFDF6] text-[#4A3423] text-sm font-semibold px-7 py-3 rounded-full"
        >
          <BookOpen size={16} />
          Browse Our Bookshelf
        </button>
      </div>
    </div>
  );
}