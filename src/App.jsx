import { useState, useEffect } from 'react';
import { MouseProvider } from './context/MouseContext'
import ScrollContext from './context/ScrollContext'
import Hero from './sections/Hero'
import Products from './sections/Products'
import Studio from './sections/Studio'
import Showcase from './sections/Showcase'
import About from './sections/About'
import Contact from './sections/Contact'
import CustomCursor from './components/cursor/CustomCursor'
import useLenis from './hooks/useLenis'
import useMagnet from './hooks/useMagnet'
import Loader from './components/loader/Loader'
import Intro from './sections/Intro'

import MeshGradient from './components/background/MeshGradient'
import GrainOverlay from './components/background/GrainOverlay'
import MouseBloom from './components/background/MouseBloom'

function AppLogic({ isLoaded, onCardClick }) {
  useLenis();
  useMagnet();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#08080f', overflow: 'hidden' }}>
      <div className="fixed inset-0 z-[-2]" style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a0a3a 0%, #080812 50%, #00040f 100%)' }} />
      <MeshGradient />

      <CustomCursor />
      <Hero isLoaded={isLoaded} onCardClick={onCardClick} />
      <Products />
      <Studio />
      <Showcase />
      <About />
      <Contact />

      <MouseBloom />
      <GrainOverlay />
    </div>
  );
}

function App() {
  console.log('[BOOT] App component mounted');
  const [isLoaded, setIsLoaded] = useState(false);
  const [entered, setEntered] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const [activePage, setActivePage] = useState(null);

  const handleEnter = () => {
    setFade(true);
    setTimeout(() => setEntered(true), 400);
  };

  return (
    <MouseProvider>
      <ScrollContext />
      {!entered && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          opacity: fade ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: fade ? 'none' : 'all'
        }}>
          <Intro onEnter={handleEnter} />
        </div>
      )}
      {entered && (
        <>
          {!isLoaded && <Loader onLoaded={() => setIsLoaded(true)} />}
          <AppLogic isLoaded={isLoaded} onCardClick={(id) => setActivePage(id)} />
        </>
      )}

      {activePage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#05060a',
          color: 'white',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{ marginBottom: '20px', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600 }}>
            {activePage}
          </h1>
          <p style={{ opacity: 0.6, fontSize: '14px' }}>
            Dummy content for {activePage}
          </p>
          <button
            onClick={() => setActivePage(null)}
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            Go Back
          </button>
        </div>
      )}
    </MouseProvider>
  )
}

export default App
