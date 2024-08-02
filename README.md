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

## License

This project is licensed under the MIT License.
