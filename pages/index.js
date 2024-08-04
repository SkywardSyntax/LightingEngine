import { useState } from 'react';
import LightingEngine from '../components/LightingEngine';

function Home() {
  const [currentLightingEnvironment, setCurrentLightingEnvironment] = useState('default');
  const [stlGeometry, setStlGeometry] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0);

  const handleLightingChange = (environment) => {
    setCurrentLightingEnvironment(environment);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const geometry = parseStlFile(arrayBuffer, gl);
        setStlGeometry(geometry);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const parseStlFile = (arrayBuffer, gl) => {
    const dataView = new DataView(arrayBuffer);
    const isBinary = dataView.getUint32(80, true) !== 0;
    if (isBinary) {
      return parseBinaryStl(dataView, gl);
    } else {
      return parseAsciiStl(new TextDecoder().decode(arrayBuffer), gl);
    }
  };

  const parseBinaryStl = (dataView, gl) => {
    const triangles = dataView.getUint32(80, true);
    const vertices = new Float32Array(triangles * 9);
    const normals = new Float32Array(triangles * 9);
    const indices = new Uint16Array(triangles * 3);
    let offset = 84;
    for (let i = 0; i < triangles; i++) {
      const normalX = dataView.getFloat32(offset, true);
      const normalY = dataView.getFloat32(offset + 4, true);
      const normalZ = dataView.getFloat32(offset + 8, true);
      offset += 12;
      for (let j = 0; j < 3; j++) {
        vertices[i * 9 + j * 3] = dataView.getFloat32(offset, true);
        vertices[i * 9 + j * 3 + 1] = dataView.getFloat32(offset + 4, true);
        vertices[i * 9 + j * 3 + 2] = dataView.getFloat32(offset + 8, true);
        normals[i * 9 + j * 3] = normalX;
        normals[i * 9 + j * 3 + 1] = normalY;
        normals[i * 9 + j * 3 + 2] = normalZ;
        indices[i * 3 + j] = i * 3 + j;
        offset += 12;
      }
      offset += 2;
    }
    return { vertices, normals, indices };
  };

  const parseAsciiStl = (text, gl) => {
    const vertices = [];
    const normals = [];
    const indices = [];
    const lines = text.split('\n');
    let index = 0;
    let normal = [0, 0, 0];
    for (const line of lines) {
      if (line.startsWith('facet normal')) {
        const parts = line.trim().split(/\s+/);
        normal = [parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4])];
      } else if (line.startsWith('vertex')) {
        const parts = line.trim().split(/\s+/);
        vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        normals.push(normal[0], normal[1], normal[2]);
        indices.push(index++);
      }
    }
    return { vertices: new Float32Array(vertices), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
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
      <input type="file" accept=".stl" onChange={handleFileUpload} />
      <input type="range" min="-10" max="10" value={zoomLevel} onChange={handleZoomChange} />
      <LightingEngine key={currentLightingEnvironment} currentLightingEnvironment={currentLightingEnvironment} stlGeometry={stlGeometry} zoomLevel={zoomLevel} />
    </main>
  );
}

export default Home;
