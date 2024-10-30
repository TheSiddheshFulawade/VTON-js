import { VirtualTryOn } from './index.js';
import path from 'path';
import { fileURLToPath } from 'url';

// current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // client
    const tryOn = new VirtualTryOn();
    await tryOn.initialize();

    const humanImagePath = path.join(__dirname, 'images', 'Altman.png');
    const garmentImagePath = path.join(__dirname, 'images', 'Cloth2.jpg');

    // ITDM-VTON parameters
    const result = await tryOn.generateTryOn({
      humanImage: humanImagePath,
      garmentImage: garmentImagePath,
      message: "Processing try-on",
      useAutoMask: true,
      enhanceResult: true,
      denoisingSteps: 20,  
      seed: 42            
    });

    // console the results
    console.log("Try-on image:", result.generatedImage);
    console.log("Masked image:", result.maskedImage);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main().catch(console.error);