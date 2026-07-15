import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { gsap } from 'gsap';
import RoseScene from '../components/RoseScene';

export default function Rose() {
  const [, navigate] = useLocation();
  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleRef.current || !overlayRef.current) return;
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 40, skewX: -8 },
      { opacity: 1, y: 0, skewX: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 },
    );
    gsap.fromTo(
      overlayRef.current.querySelectorAll('.fade-in'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.8 },
    );
    // hide hint after 5s
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // lightbox open animation
  useEffect(() => {
    if (lightboxRef.current && lightboxUrl) {
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
      );
    }
  }, [lightboxUrl]);

  // close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handlePhotoSelect = (url: string) => setLightboxUrl(url);

  const closeLightbox = () => {
    if (!lightboxRef.current) { setLightboxUrl(null); return; }
    gsap.to(lightboxRef.current, {
      opacity: 0,
      scale: 0.94,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => setLightboxUrl(null),
    });
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-mono select-none">
      {/* 3D canvas */}
      <div className="absolute inset-0 z-0">
        <RoseScene onPhotoSelect={handlePhotoSelect} />
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-8 z-30 text-white/60 hover:text-white text-sm uppercase tracking-widest transition-colors duration-200 flex items-center gap-3 pointer-events-auto cursor-pointer"
      >
        <span className="text-red-500">◀</span> BACK
      </button>

      {/* Control hints — fade out after 5s */}
      <div
        className="absolute top-6 right-8 z-30 flex flex-col items-end gap-1.5 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: showHint ? 1 : 0 }}
      >
        {[
          ['DRAG', 'rotate scene'],
          ['SCROLL', 'zoom in / out'],
          ['CLICK ROSE', 'silver burst'],
          ['CLICK PHOTO', 'open fullscreen'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-[10px] tracking-widest uppercase">
            <span className="text-white/60">{label}</span>
            <span
              className="border border-white/20 px-1.5 py-0.5 text-white/40"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {key}
            </span>
          </div>
        ))}
      </div>

      {/* Title / HUD overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 pointer-events-none"
      >
        <div ref={titleRef} className="text-center">
          <p className="fade-in text-xs tracking-[0.5em] uppercase text-red-500 mb-3">
            CANON · GALLERY
          </p>
          <h1
            className="fade-in text-[8vw] font-bold leading-none"
            style={{ textShadow: '0 0 40px rgba(200,200,255,0.4), 0 0 80px rgba(180,180,255,0.2)' }}
          >
            🥀
          </h1>
          <p className="fade-in mt-3 text-sm tracking-[0.4em] uppercase" style={{ color: '#c8c8c8' }}>
            SILVER EDITION
          </p>
        </div>

        <div className="fade-in mt-8 flex items-center gap-8 text-[10px] tracking-widest uppercase text-white/30">
          <span>EOS R8</span>
          <span className="text-red-500">●</span>
          <span>RF 24–50mm f/4.5–6.3</span>
          <span className="text-red-500">●</span>
          <span>SILVER SERIES</span>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.88)' }}
          onClick={closeLightbox}
        >
          <div
            ref={lightboxRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* silver frame */}
            <div
              className="p-[3px]"
              style={{
                background: 'linear-gradient(135deg, #d0d0d0 0%, #707070 50%, #d0d0d0 100%)',
                boxShadow: '0 0 60px rgba(180,180,255,0.3), 0 0 120px rgba(180,180,255,0.12)',
              }}
            >
              <img
                src={lightboxUrl}
                alt="Gallery photo"
                className="block"
                style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
              />
            </div>

            {/* close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-lg transition-colors cursor-pointer"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              ✕
            </button>

            {/* ESC hint */}
            <p className="text-center mt-4 text-[10px] tracking-widest uppercase text-white/30">
              Press ESC or click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
