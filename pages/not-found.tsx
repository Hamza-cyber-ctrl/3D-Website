import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white font-mono selection:bg-primary selection:text-white relative overflow-hidden">
      <div className="scanlines"></div>
      <div className="noise-bg"></div>
      <div className="relative z-10 text-center">
        <h1 className="text-[15vw] font-bold leading-none tracking-tighter text-primary glitch-text" data-text="404">404</h1>
        <p className="text-2xl mt-4 font-bold tracking-widest uppercase text-accent mb-8 crt-flicker">Signal Lost.</p>
        <Link href="/" className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-black font-bold text-xl px-8 py-4 uppercase transition-all duration-300 skew-x-[10deg] shadow-[0_0_20px_rgba(255,7,58,0.3)]">
           <span className="skew-x-[-10deg] block">Return to Source</span>
        </Link>
      </div>
    </div>
  );
}
