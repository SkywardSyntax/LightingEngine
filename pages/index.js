import { useState } from 'react';
import LightingEngine from '../components/LightingEngine';

function Home() {
  const [currentLightingEnvironment, setCurrentLightingEnvironment] = useState('default');

  const handleLightingChange = (environment) => {
    setCurrentLightingEnvironment(environment);
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
      <LightingEngine currentLightingEnvironment={currentLightingEnvironment} />
    </main>
  );
}

export default Home;
