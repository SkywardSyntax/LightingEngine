import React, { useRef, useEffect } from 'react';
import { vec3, mat4, vec4 } from 'gl-matrix';

const LightingEngine = ({ currentLightingEnvironment }) => {
  const canvasRef = useRef(null);

  const lightSources = [
    { position: vec3.fromValues(400, 300, 100), intensity: 1.0 },
    { position: vec3.fromValues(200, 150, 50), intensity: 0.5 },
    { position: vec3.fromValues(600, 450, 150), intensity: 0.8 },
    { position: vec3.fromValues(100, 75, 25), intensity: 0.3 }
  ];

  const calculatePhongShading = (normal, lightDir, viewDir, lightIntensity) => {
    const ambient = 0.1;
    const diffuse = Math.max(vec3.dot(normal, lightDir), 0.0);
    const reflectDir = vec3.create();
    const dotProduct = 2 * vec3.dot(normal, lightDir);
    vec3.scale(reflectDir, normal, dotProduct);
    vec3.subtract(reflectDir, reflectDir, lightDir);
    const specular = Math.pow(Math.max(vec3.dot(viewDir, reflectDir), 0.0), 64);
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

  const traceRay = (origin, direction, heightMap) => {
    const stepSize = 0.5 / Math.max(Math.abs(direction[0]), Math.abs(direction[1]));
    let currentPos = vec3.clone(origin);
    for (let t = 0; t < 1.0; t += stepSize) {
      vec3.add(currentPos, currentPos, vec3.scale(vec3.create(), direction, stepSize));
      const currentHeight = heightMap[Math.floor(currentPos[1])] ? heightMap[Math.floor(currentPos[1])][Math.floor(currentPos[0])] : 0;
      if (currentPos[2] < currentHeight) {
        return true;
      }
    }
    return false;
  };

  const generateShadowMap = (lightSource, heightMap) => {
    const shadowMap = new Float32Array(heightMap.length * heightMap[0].length);
    for (let y = 0; y < heightMap.length; y++) {
      for (let x = 0; x < heightMap[0].length; x++) {
        const lightPos = lightSource.position;
        const lightDir = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lightPos, vec3.fromValues(x, y, heightMap[y][x])));
        shadowMap[y * heightMap[0].length + x] = traceRay(vec3.fromValues(x, y, heightMap[y][x]), lightDir, heightMap) ? 1.0 : 0.0;
      }
    }
    return shadowMap;
  };

  const calculateShadow = (x, y, shadowMap, heightMap) => {
    const sampleRadius = 1;
    let shadow = 0.0;
    for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
      for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
        const sampleX = x + dx;
        const sampleY = y + dy;
        if (heightMap[sampleY] && heightMap[sampleY][sampleX] !== undefined) {
          shadow += shadowMap[sampleY * heightMap[0].length + sampleX];
        }
      }
    }
    return shadow / ((2 * sampleRadius + 1) ** 2);
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

  const createCubeGeometry = () => {
    const vertices = new Float32Array([
      -1, -1, -1,
      1, -1, -1,
      1, 1, -1,
      -1, 1, -1,
      -1, -1, 1,
      1, -1, 1,
      1, 1, 1,
      -1, 1, 1,
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 2, 3, 0,
      4, 5, 6, 6, 7, 4,
      0, 1, 5, 5, 4, 0,
      2, 3, 7, 7, 6, 2,
      0, 3, 7, 7, 4, 0,
      1, 2, 6, 6, 5, 1,
    ]);

    return { vertices, indices };
  };

  const renderCube = (gl, program, cube) => {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const modelViewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);

    const uModelViewMatrix = gl.getUniformLocation(program, 'u_modelViewMatrix');
    const uProjectionMatrix = gl.getUniformLocation(program, 'u_projectionMatrix');
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
  };

  const drawCube = (gl, program, cube) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    renderCube(gl, program, cube);
  };

  const animateCube = (cube, angle) => {
    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, angle);
    for (let i = 0; i < cube.vertices.length; i += 3) {
      const vertex = vec3.fromValues(cube.vertices[i], cube.vertices[i + 1], cube.vertices[i + 2]);
      vec3.transformMat4(vertex, vertex, rotationMatrix);
      cube.vertices[i] = vertex[0];
      cube.vertices[i + 1] = vertex[1];
      cube.vertices[i + 2] = vertex[2];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const vertexShaderSource = `
      attribute vec4 a_position;
      uniform mat4 u_modelViewMatrix;
      uniform mat4 u_projectionMatrix;
      void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      void main() {
        vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0);
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        float fluffiness = smoothstep(0.4, 0.6, noise);
        gl_FragColor = vec4(0.75, 0.75, 0.75, 1.0) * fluffiness;
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program failed to link:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const cube = createCubeGeometry();
    let angle = 0;

    const render = () => {
      animateCube(cube, angle);
      drawCube(gl, program, cube);
      angle += 0.01;
      requestAnimationFrame(render);
    };

    render();
  }, [currentLightingEnvironment]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default LightingEngine;
