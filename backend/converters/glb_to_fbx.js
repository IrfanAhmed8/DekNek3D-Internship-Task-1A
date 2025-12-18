import { exec } from "child_process";

export function convertGLBtoFBX(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    exec(
      `blender --background --python scripts/glb_to_fbx.py -- "${inputPath}" "${outputPath}"`,
      (err, stdout, stderr) => {
        if (err) reject(stderr || err.message);
        else resolve();
      }
    );
  });
}
