import Scene from '../components/Scene';
import Overlay from '../components/Overlay';
import SceneErrorBoundary from '../components/SceneErrorBoundary';

export default function Home() {
  return (
    <main className="w-full bg-black min-h-screen text-white font-mono selection:bg-primary selection:text-white">
      <div className="fixed inset-0 z-0">
        <SceneErrorBoundary>
          <Scene />
        </SceneErrorBoundary>
      </div>
      <Overlay />
      <div className="scanlines"></div>
      <div className="noise-bg"></div>
    </main>
  );
}
