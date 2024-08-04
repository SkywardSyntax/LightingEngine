# Basic Lighting Engine

This project demonstrates a basic lighting engine using HTML5 canvas and JavaScript.

## Getting Started

To run this application:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to see the lighting engine in action.

## Project Structure

- `components/LightingEngine.js`: Contains the lighting engine logic, including the `calculateAmbientOcclusion` function.
- `pages/index.js`: The main page that renders the lighting engine.
- `global.css`: Global styles for the application.

## Advanced Shadow Calculations

The lighting engine now includes advanced shadow calculations using ray tracing for more realistic lighting. Shadow maps are generated for each light source and used to determine shadowed areas in the scene. Additionally, ambient occlusion is calculated to enhance the depth and realism of the shadows.

## Ambient Occlusion

The lighting engine now includes ambient occlusion calculations. Ambient occlusion is a shading method used to calculate how exposed each point in a scene is to ambient lighting. This technique helps to add depth and realism to the scene by simulating the soft shadows that occur in crevices and corners.

## Lighting Environment Buttons

The application now includes buttons to switch between different lighting environments. You can choose from the following environments:
- Default
- Sunset
- Night
- Studio

To switch between lighting environments, simply click the corresponding button on the main page.

## Cube Texture and Rotation

The cube now has a fluffy texture like a carpet and spins at a constant speed. The texture is achieved by modifying the fragment shader, and the constant rotation speed is achieved by modifying the `animateCube` function in `components/LightingEngine.js`.

## Constant Cube Rotation

The cube now rotates at a constant speed. The `animateCube` function in `components/LightingEngine.js` is responsible for rotating the cube. The `angle` variable is incremented by a constant value (0.01) in the `render` function in `components/LightingEngine.js`. The `requestAnimationFrame` function is used to continuously call the `render` function, ensuring smooth and constant rotation.

## Using the Zoom Slider

The application now includes a zoom slider to control the zoom level of the model. To use the zoom slider:

1. Locate the zoom slider on the main page.
2. Drag the slider to adjust the zoom level of the model.
3. The model will zoom in or out based on the slider's position.

## Reflective Surfaces and Black Edges

The cube now has black edges to make it easier to see the edges, and its surface is more reflective. The fragment shader in `components/LightingEngine.js` has been updated to include code for reflective surfaces, and the cube's appearance is controlled by the updated fragment shader. The cube's edges are now specifically highlighted in the updated implementation.

## Complex Matrix Operations in Lighting Calculations

The `components/LightingEngine.js` now includes more complex functions with matrices for lighting calculations. Functions like `calculateFrustumPlanes` and `isPointInFrustum` utilize matrix operations for frustum culling. The `renderScene` function applies lighting calculations using matrices for transformations and lighting. The `calculatePhongShading` function uses vector and matrix operations for Phong shading. The `generateShadowMap` function involves matrix operations for shadow calculations.

## Optimizations

The lighting engine has been optimized for efficiency while maintaining rendering quality. The following optimizations have been made:

- The `traceRay` function now uses an adaptive step size algorithm to improve performance. The algorithm adjusts the step size based on the distance to the nearest object, allowing for faster traversal in empty spaces and finer steps near objects.
- The `generateShadowMap` function now uses a more efficient algorithm to reduce computational complexity. The algorithm leverages hierarchical shadow maps to quickly determine shadowed areas, reducing the number of ray tracing operations required.
- The `calculateGlobalIllumination` function now uses a more efficient approach to reduce nested loops. The approach involves precomputing indirect lighting contributions and storing them in a lookup table, which can be quickly accessed during rendering.
- The `renderScene` function has been optimized by reducing the number of draw calls and minimizing state changes. Techniques such as batching and instancing are used to group similar objects and render them in a single draw call, reducing the overhead associated with multiple draw calls.

## License

This project is licensed under the MIT License.
