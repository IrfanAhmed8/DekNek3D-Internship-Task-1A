import { exec } from "child_process";
import path from "path";

const pythonCmd = "venv\\Scripts\\python.exe";
const scriptPath = "python_scripts/glb_converter.py";

export function glb_convert(inputFilePath, outputFormat) {
  return new Promise((resolve, reject) => {
    exec(
      `"${pythonCmd}" "${scriptPath}" "${inputFilePath}" "${outputFormat}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          console.warn(`stderr: ${stderr}`);
        }
        resolve(stdout.trim()); // output file path
      }
    );
  });
}
