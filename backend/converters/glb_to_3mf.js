import fs from "fs/promises";
import path from "path";
import { convertGLBtoSTL } from "./glb_to_stl.js";
import { convertSTLto3MF } from "./stl_to_3mf.js";

export async function convertGLBto3MF(inputPath, outputPath) {
  const tempDir = path.join("outputs", "temp");
  await fs.mkdir(tempDir, { recursive: true });

  const tempSTL = path.join(
    tempDir,
    `${path.basename(inputPath, path.extname(inputPath))}.stl`
  );

  // Step 1: GLB → STL
  await convertGLBtoSTL(inputPath, tempSTL);

  // Step 2: STL → 3MF
  await convertSTLto3MF(tempSTL, outputPath);

  // Cleanup
  await fs.unlink(tempSTL);
}
