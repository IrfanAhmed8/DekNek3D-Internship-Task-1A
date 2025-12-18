import { exec } from "child_process";

export function convertSTLto3MF(stlPath, outputPath) {
  return new Promise((resolve, reject) => {
    exec(
      `blender --background --python scripts/stl_to_3mf.py -- "${stlPath}" "${outputPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve();
        }
      }
    );
  });
}
