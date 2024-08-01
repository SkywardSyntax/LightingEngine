import React, { useRef, useEffect } from 'react';
import { vec3 } from 'gl-matrix';

const LightingEngine = () => {
  const canvasRef = useRef(null);

  const lightSources = [
    { position: vec3.fromValues(400, 300, 100), intensity: 1.0 },
    { position: vec3.fromValues(200, 150, 50), intensity: 0.5 }
  ];

  const calculatePhongShading = (normal, lightDir, viewDir, lightIntensity) => {
    const ambient = 0.1;
    const diffuse = Math.max(vec3.dot(normal, lightDir), 0.0);
    const reflectDir = vec3.create();
    vec3.reflect(reflectDir, lightDir, normal);
    const specular = Math.pow(Math.max(vec3.dot(viewDir, reflectDir), 0.0), 32);
    return ambient + lightIntensity * (diffuse + specular);
  };

  const calculateNormal = (x, y, heightMap) => {
    const normal = vec3.create();
    const heightL = heightMap[y][x - 1] || heightMap[y][x];
    const heightR = heightMap[y][x + 1] || heightMap[y][x];
    const heightD = heightMap[y + 1] ? heightMap[y + 1][x] : heightMap[y][x];
    const heightU = heightMap[y - 1] ? heightMap[y - 1][x] : heightMap[y][x];
    normal[0] = heightL - heightR;
    normal[1] = heightD - heightU;
    normal[2] = 2.0;
    return vec3.normalize(normal, normal);
  };

  const calculateShadow = (x, y, lightSource, heightMap) => {
    const lightPos = lightSource.position;
    const lightDir = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lightPos, vec3.fromValues(x, y, heightMap[y][x])));
    const stepSize = 1.0 / Math.max(Math.abs(lightDir[0]), Math.abs(lightDir[1]));
    let currentPos = vec3.fromValues(x, y, heightMap[y][x]);
    for (let t = 0; t < 1.0; t += stepSize) {
      vec3.add(currentPos, currentPos, vec3.scale(vec3.create(), lightDir, stepSize));
      const currentHeight = heightMap[Math.floor(currentPos[1])] ? heightMap[Math.floor(currentPos[1])][Math.floor(currentPos[0])] : 0;
      if (currentPos[2] < currentHeight) {
        return true;
      }
    }
    return false;
  };

  const calculateGlobalIllumination = (x, y, heightMap) => {
    let totalLight = 0;
    const sampleRadius = 5;
    for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
      for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
        const sampleX = x + dx;
        const sampleY = y + dy;
        if (heightMap[sampleY] && heightMap[sampleY][sampleX] !== undefined) {
          totalLight += heightMap[sampleY][sampleX];
        }
      }
    }
    return totalLight / ((2 * sampleRadius + 1) ** 2);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const heightMap = Array.from({ length: canvas.height }, () => Array(canvas.width).fill(0));

    const drawLighting = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const viewDir = vec3.fromValues(0, 0, 1);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          let color = 0;

          const normal = calculateNormal(x, y, heightMap);
          const globalIllumination = calculateGlobalIllumination(x, y, heightMap);

          lightSources.forEach(lightSource => {
            const lightDir = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lightSource.position, vec3.fromValues(x, y, heightMap[y][x])));
            const inShadow = calculateShadow(x, y, lightSource, heightMap);

            if (!inShadow) {
              color += calculatePhongShading(normal, lightDir, viewDir, lightSource.intensity);
            }
          });

          color += globalIllumination;

          const clampedColor = Math.min(255, Math.max(0, Math.floor(color * 255)));
          context.fillStyle = `rgb(${clampedColor}, ${clampedColor}, ${clampedColor})`;
          context.fillRect(x, y, 1, 1);
        }
      }
    };

    drawLighting();
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default LightingEngine;
