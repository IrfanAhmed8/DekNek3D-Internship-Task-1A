"use client";

import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export const loadGLBFile = async (
  file: File,
  onLoaded: (scene: THREE.Group) => void,
  onError?: (error: unknown) => void
) => {
  try {
    // Validate file type
    if (!file.name.toLowerCase().endsWith(".glb")) {
      throw new Error("Only GLB files are supported");
    }

    // Convert GLB file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Initialize GLTF loader
    const loader = new GLTFLoader();

    // Parse GLB data
    loader.parse(
      buffer,
      "",
      (gltf) => {
        if (!gltf.scene) {
          throw new Error("Invalid GLB file");
        }
        onLoaded(gltf.scene);
      },
      (error) => {
        console.error("GLTF parse error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("GLB loading failed:", err);
    if (onError) onError(err);
  }
};

/**
 * Placeholder component
 */
export default function Page() {
  return (
    <div style={{ padding: "20px" }}>
      <h3>GLB Loading Logic Module</h3>
    </div>
  );
}
