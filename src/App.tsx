import { useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { GoalsSection } from './components/GoalsSection';
import { HeroSection } from './components/HeroSection';
import { InterestsSection } from './components/InterestsSection';
import { MediaLightbox, type LightboxItem } from './components/MediaLightbox';
import { Navbar } from './components/Navbar';
import { NetlifyConfigModal } from './components/NetlifyConfigModal';
import { OrderSection } from './components/OrderSection';
import { ProjectsSection } from './components/ProjectsSection';
import { NetlifyProvider } from './context/NetlifyContext';

export default function App() {
  const [lightboxItem, setLightboxItem] = useState<LightboxItem | null>(null);

  return (
    <NetlifyProvider>
      <div className="min-h-screen bg-[#050505] text-[#f4f4f5] flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
        <Navbar />

        <main className="flex-1">
          <HeroSection />
          <ProjectsSection onOpenLightbox={setLightboxItem} />
          <AboutSection onOpenLightbox={setLightboxItem} />
          <InterestsSection onOpenLightbox={setLightboxItem} />
          <GoalsSection />
          <OrderSection />
        </main>

        <Footer />
        <NetlifyConfigModal />
        <MediaLightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
        />
      </div>
    </NetlifyProvider>
  );
}
