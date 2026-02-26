import { HackathonApp } from './components/hackathon/HackathonApp';
import { Toaster } from './components/ui/sonner';
import { SmoothScroll } from './components/ui/SmoothScroll';
import './styles/3d-effects.css';

function App() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
        <Toaster position="top-right" richColors />
        <HackathonApp />
      </div>
    </SmoothScroll>
  );
}

export default App;