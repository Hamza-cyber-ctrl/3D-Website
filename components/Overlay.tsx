import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation } from 'wouter';
import { scrollState } from '../store';

gsap.registerPlugin(ScrollTrigger);

export default function Overlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      }
    });

    const sections = gsap.utils.toArray('.anim-section');
    sections.forEach((sec: any) => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 100 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 75%",
            end: "bottom 25%",
            toggleActions: "play reverse play reverse"
          }
        }
      );
    });

    const glitches = gsap.utils.toArray('.glitch-on-scroll');
    glitches.forEach((glitch: any) => {
      gsap.to(glitch, {
        scrollTrigger: {
          trigger: glitch,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 0.1,
        },
        x: 10,
        skewX: 10,
        opacity: 0.8,
        yoyo: true,
        repeat: 5,
        ease: "power1.inOut"
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 w-full overflow-hidden text-foreground pb-[10vh]">
      {/* Nav brand */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 pointer-events-none mix-blend-difference">
        <span className="text-white font-bold text-2xl tracking-[0.3em] uppercase">CANON</span>
        <span className="text-xs font-mono text-primary tracking-widest uppercase opacity-80">EOS R8 &#x2F;&#x2F; RF 24-50mm</span>
      </nav>

      <section className="h-[120vh] w-full flex flex-col items-center justify-center pointer-events-none">
         <p className="text-sm font-mono tracking-[0.5em] uppercase text-primary mb-4 crt-flicker">CANON</p>
         <h1 className="text-[15vw] font-bold leading-none tracking-tighter uppercase glitch-text mix-blend-difference" data-text="EOS R8">EOS R8</h1>
         <p className="text-xl md:text-3xl mt-4 font-bold text-primary tracking-widest uppercase crt-flicker">No Limits.</p>
      </section>

      <section className="min-h-screen w-full flex items-center p-8 md:p-24 anim-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl mx-auto">
          <div>
             <h2 className="text-[8vw] md:text-[6vw] font-bold leading-none uppercase text-stroke-primary glitch-on-scroll">BRUTAL</h2>
             <h2 className="text-[8vw] md:text-[6vw] font-bold leading-none uppercase text-accent glitch-on-scroll">PRECISION</h2>
          </div>
          <div className="flex flex-col justify-center space-y-12 font-mono">
            <div className="border-l-4 border-primary pl-6 hover:border-accent transition-colors duration-500 hover:ml-4 group">
              <p className="text-3xl font-bold group-hover:text-accent transition-colors">24.2 MP SENSOR</p>
              <p className="text-lg text-muted-foreground mt-2 uppercase tracking-wide">Maximum signal extraction. Pure data.</p>
            </div>
            <div className="border-l-4 border-accent pl-6 hover:border-primary transition-colors duration-500 hover:ml-4 group">
              <p className="text-3xl font-bold group-hover:text-primary transition-colors">40 FPS SHUTTER</p>
              <p className="text-lg text-muted-foreground mt-2 uppercase tracking-wide">Blink and you miss it. We don't.</p>
            </div>
            <div className="border-l-4 border-white pl-6 hover:border-primary transition-colors duration-500 hover:ml-4 group">
              <p className="text-3xl font-bold">DUAL PIXEL AF II</p>
              <p className="text-lg text-muted-foreground mt-2 uppercase tracking-wide">Subject detection locked.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen w-full flex flex-col items-center justify-center p-8 anim-section pointer-events-none">
         <div className="border-4 border-primary p-12 md:p-32 relative backdrop-blur-md bg-black/40 overflow-visible shadow-[0_0_50px_rgba(255,7,58,0.2)]">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-accent -translate-x-4 -translate-y-4"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-accent translate-x-4 -translate-y-4"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-accent -translate-x-4 translate-y-4"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-accent translate-x-4 translate-y-4"></div>
            
            <h3 className="text-[8vw] md:text-[6vw] font-bold leading-none uppercase mb-8 text-stroke glitch-on-scroll">RF 24-50mm</h3>
            <p className="text-2xl md:text-4xl max-w-3xl font-bold text-primary uppercase">Compact. Versatile. Lethal.</p>
            <p className="text-xl md:text-2xl max-w-2xl mt-6 text-muted-foreground font-mono">f/4.5-6.3 IS STM. A lens designed for total control of the visual plane.</p>
         </div>
      </section>

      <section className="min-h-screen w-full flex items-center justify-center relative anim-section pointer-events-none">
         <div className="absolute inset-0 border-[2px] border-white/20 m-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-full flex items-center justify-center">
               <div className="w-3 h-3 bg-accent rounded-full animate-ping"></div>
            </div>
            <div className="absolute top-4 left-4 text-sm font-mono text-accent">REC • 00:00:00:00</div>
            <div className="absolute top-4 right-4 text-sm font-mono text-accent animate-pulse">EYE AF DETECTED</div>
            <div className="absolute bottom-4 right-4 text-sm font-mono text-primary">ISO 102400 | F/4.5 | 1/8000</div>
            <div className="absolute bottom-4 left-4 text-sm font-mono text-primary">AWB | ONE SHOT | CRAW</div>
            <div className="absolute top-1/2 left-8 w-6 h-48 border-l-2 border-t-2 border-b-2 border-white/30 -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-8 w-6 h-48 border-r-2 border-t-2 border-b-2 border-white/30 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-primary/20 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[1px] h-full bg-primary/20 -translate-x-1/2"></div>
         </div>
         <h2 className="text-[12vw] font-bold uppercase mix-blend-difference text-white glitch-text z-10" data-text="FOCUS FATAL">FOCUS FATAL</h2>
      </section>
      
      <section className="min-h-screen w-full flex flex-col items-center justify-center p-8 anim-section text-center relative pointer-events-auto">
         <h2 className="text-[6vw] font-bold uppercase mb-12 crt-flicker">CAPTURE REALITY.<br/><span className="text-primary text-stroke-primary">OR DESTROY IT.</span></h2>
         <button className="bg-primary text-black font-bold text-2xl px-12 py-6 uppercase hover:bg-white hover:text-primary transition-all duration-300 border-4 border-transparent hover:border-primary skew-x-[-10deg] shadow-[0_0_30px_rgba(255,7,58,0.5)] hover:shadow-[0_0_60px_rgba(255,255,255,0.8)] cursor-pointer mb-8">
           <span className="skew-x-[10deg] block">Acquire Now</span>
         </button>

         {/* Silver Gallery button */}
         <button
           onClick={() => navigate('/rose')}
           className="group relative flex items-center gap-4 border border-white/20 px-10 py-5 uppercase tracking-widest text-sm font-bold text-white/70 hover:text-white hover:border-white/60 transition-all duration-500 cursor-pointer overflow-hidden"
         >
           <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <span className="text-2xl relative z-10" style={{ filter: 'grayscale(1) brightness(1.8)' }}>🥀</span>
           <span className="relative z-10 font-mono">Silver Gallery</span>
           <span className="relative z-10 text-white/30 group-hover:text-white/70 transition-colors">→</span>
         </button>
      </section>
    </div>
  );
}
