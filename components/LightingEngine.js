import React, { useRef, useEffect } from 'react';

const LightingEngine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const drawLighting = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        200
      );

      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    drawLighting();
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default LightingEngine;
