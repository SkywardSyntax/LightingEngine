import { useState } from 'react';
import LightingEngine from '../components/LightingEngine';

function Home() {
  const [currentLightingEnvironment, setCurrentLightingEnvironment] = useState('default');
  const [zoomLevel, setZoomLevel] = useState(0);

  const handleLightingChange = (environment) => {
    setCurrentLightingEnvironment(environment);
  };

  const handleZoomChange = (event) => {
    setZoomLevel(Number(event.target.value));
  };

  return (
    <main>
      <h1>Basic Lighting Engine</h1>
      <div>
        <button onClick={() => handleLightingChange('default')}>Default</button>
        <button onClick={() => handleLightingChange('sunset')}>Sunset</button>
        <button onClick={() => handleLightingChange('night')}>Night</button>
        <button onClick={() => handleLightingChange('studio')}>Studio</button>
      </div>
      <input type="range" min="-10" max="10" value={zoomLevel} onChange={handleZoomChange} />
      <LightingEngine key={currentLightingEnvironment} currentLightingEnvironment={currentLightingEnvironment} zoomLevel={zoomLevel} />
    </main>
  );
}

export default Home;
