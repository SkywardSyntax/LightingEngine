import React, { useRef, useEffect } from 'react';
import { vec3, mat4, vec4 } from 'gl-matrix';

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
    // Manually implement the reflection calculation
    const dotProduct = 2 * vec3.dot(normal, lightDir);
    vec3.scale(reflectDir, normal, dotProduct);
    vec3.subtract(reflectDir, reflectDir, lightDir);
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
    const sampleRadius = 3;
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

  const calculateFrustumPlanes = (viewMatrix, projectionMatrix) => {
    const vpMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);
    const planes = [];

    for (let i = 0; i < 6; i++) {
      planes.push(vec4.create());
    }

    // Left plane
    planes[0][0] = vpMatrix[3] + vpMatrix[0];
    planes[0][1] = vpMatrix[7] + vpMatrix[4];
    planes[0][2] = vpMatrix[11] + vpMatrix[8];
    planes[0][3] = vpMatrix[15] + vpMatrix[12];

    // Right plane
    planes[1][0] = vpMatrix[3] - vpMatrix[0];
    planes[1][1] = vpMatrix[7] - vpMatrix[4];
    planes[1][2] = vpMatrix[11] - vpMatrix[8];
    planes[1][3] = vpMatrix[15] - vpMatrix[12];

    // Bottom plane
    planes[2][0] = vpMatrix[3] + vpMatrix[1];
    planes[2][1] = vpMatrix[7] + vpMatrix[5];
    planes[2][2] = vpMatrix[11] + vpMatrix[9];
    planes[2][3] = vpMatrix[15] + vpMatrix[13];

    // Top plane
    planes[3][0] = vpMatrix[3] - vpMatrix[1];
    planes[3][1] = vpMatrix[7] - vpMatrix[5];
    planes[3][2] = vpMatrix[11] - vpMatrix[9];
    planes[3][3] = vpMatrix[15] - vpMatrix[13];

    // Near plane
    planes[4][0] = vpMatrix[3] + vpMatrix[2];
    planes[4][1] = vpMatrix[7] + vpMatrix[6];
    planes[4][2] = vpMatrix[11] + vpMatrix[10];
    planes[4][3] = vpMatrix[15] + vpMatrix[14];

    // Far plane
    planes[5][0] = vpMatrix[3] - vpMatrix[2];
    planes[5][1] = vpMatrix[7] - vpMatrix[6];
    planes[5][2] = vpMatrix[11] - vpMatrix[10];
    planes[5][3] = vpMatrix[15] - vpMatrix[14];

    for (let i = 0; i < 6; i++) {
      const length = Math.sqrt(planes[i][0] * planes[i][0] + planes[i][1] * planes[i][1] + planes[i][2] * planes[i][2]);
      planes[i][0] /= length;
      planes[i][1] /= length;
      planes[i][2] /= length;
      planes[i][3] /= length;
    }

    return planes;
  };

  const isPointInFrustum = (point, planes) => {
    for (let i = 0; i < 6; i++) {
      if (vec4.dot(planes[i], vec4.fromValues(point[0], point[1], point[2], 1.0)) < 0) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const heightMap = new Float32Array(canvas.width * canvas.height);

    const drawLighting = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const viewDir = vec3.fromValues(0, 0, 1);

      const viewMatrix = mat4.lookAt(mat4.create(), vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
      const projectionMatrix = mat4.perspective(mat4.create(), Math.PI / 4, canvas.width / canvas.height, 0.1, 1000);
      const frustumPlanes = calculateFrustumPlanes(viewMatrix, projectionMatrix);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const point = vec3.fromValues(x, y, heightMap[y][x]);
          if (!isPointInFrustum(point, frustumPlanes)) {
            continue;
          }

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
