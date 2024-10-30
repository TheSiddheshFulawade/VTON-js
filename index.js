import { Client, handle_file } from "@gradio/client";
import { readFile } from 'fs/promises';
import { Buffer } from 'buffer';

export class VirtualTryOn {
  constructor(hfToken = null) {
    this.options = hfToken ? { hf_token: hfToken } : {};
  }

  async initialize() {
    try {
      this.client = await Client.connect("yisol/IDM-VTON", this.options);
      console.log("Successfully connected to IDM-VTON API");
    } catch (error) {
      console.error("Failed to connect to IDM-VTON API:", error);
      throw error;
    }
  }

  async fileToBlob(filePath) {
    try {
      const buffer = await readFile(filePath);
      return new Blob([buffer]);
    } catch (error) {
      console.error(`Error reading file at ${filePath}:`, error);
      throw error;
    }
  }

  validateParameters(denoisingSteps, seed) {
    if (denoisingSteps < 20) {
      throw new Error("denoisingSteps must be at least 20");
    }
    if (seed < 0) {
      throw new Error("seed must be a non-negative number");
    }
  }

  async generateTryOn({
    humanImage,
    garmentImage,
    message = "Processing try-on",
    useAutoMask = true,
    enhanceResult = true,
    denoisingSteps = 20,  
    seed = 42             
  }) {
    if (!this.client) {
      throw new Error("Client not initialized. Please call initialize() first.");
    }

    // Validate parameters
    this.validateParameters(denoisingSteps, seed);

    try {
      // Convert local files to blobs
      const humanBlob = humanImage.startsWith('http') ? 
                       await fetch(humanImage).then(r => r.blob()) : 
                       await this.fileToBlob(humanImage);
      
      const garmentBlob = garmentImage.startsWith('http') ? 
                         await fetch(garmentImage).then(r => r.blob()) : 
                         await this.fileToBlob(garmentImage);

      console.log("Processing images with parameters:", {
        denoisingSteps,
        seed,
        useAutoMask,
        enhanceResult
      });

      // Prepare the image editor input
      const imageEditorInput = {
        background: humanBlob,
        layers: [],
        composite: null
      };

      // Make prediction using the API
      const result = await this.client.predict(
        "/tryon",
        [
          imageEditorInput,          
          handle_file(garmentBlob),  
          message,                   
          useAutoMask,              
          enhanceResult,            
          denoisingSteps,           
          seed                      
        ]
      );

      return {
        generatedImage: result.data[0],  // virtual try-on result
        maskedImage: result.data[1]      // masked human image
      };

    } catch (error) {
      console.error("Error generating virtual try-on:", error);
      throw error;
    }
  }
}