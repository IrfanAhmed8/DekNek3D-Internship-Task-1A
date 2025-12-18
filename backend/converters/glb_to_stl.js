import { NodeIO } from "@gltf-transform/core";
import { EXTMeshGPUInstancing } from "@gltf-transform/extensions";

export async function convertGLBtoSTL(inputPath, outputPath) {
  const io = new NodeIO().registerExtensions([EXTMeshGPUInstancing]);
  const document = await io.read(inputPath);

  await io.write(outputPath, document, { format: "stl" });
}
