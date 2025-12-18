import { NodeIO } from "@gltf-transform/core";
import {
  dedup,
  prune,
  weld,
  resample,
  draco
} from "@gltf-transform/functions";

export async function optimizeGLB(inputPath, outputPath) {
  const io = new NodeIO();
  const document = await io.read(inputPath);

  await document.transform(
    dedup(),
    prune(),
    weld(),
    resample(),
    draco()
  );

  await io.write(outputPath, document);
}
