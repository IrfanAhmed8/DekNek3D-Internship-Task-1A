import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
// Import converter functions
import { convertGLBtoSTL } from "../converters/glb_to_stl.js";
import { convertGLBtoPLY } from "../converters/glb_to_ply.js";
import { convertGLBtoOBJ } from "../converters/glb_to_obj.js";
import { optimizeGLB } from "../converters/glb_to_optimisedGLB.js";
import { zipFiles } from "../converters/zipFiles.js";
import { convertGLBtoFBX } from "../converters/glb_to_fbx.js";
import { convertGLBto3MF } from "../converters/glb_to_3mf.js";

// Initialize Express app
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//upload configuration works from here

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.originalname.endsWith(".glb")
      ? cb(null, true)
      : cb(new Error("Only GLB files allowed"));
  },
});
//only a single route is being defined here
//condition are managed through if-else statements
//i have used zip for downloading multiple files as a single file(ply and obj formats)
//issue while econverting glb to stl,some unnecessary images get populated in the output folder
//used outputs folder to store all converted files temporarily,once user dowload it it get deleted from the server
/* ---------- Routes ---------- */

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const format = req.body.format;
    const inputPath = req.file.path;

    let outputFileName;
    let outputPath;

    if (format === "glb" || format === "gltf") {
      outputFileName = `${req.file.filename}-optimized.${format}`;
      outputPath = path.join("outputs", outputFileName);

      await optimizeGLB(inputPath, outputPath);
    } else if (format === "stl") {
      outputFileName = `${req.file.filename}.stl`;
      outputPath = path.join("outputs", outputFileName);

      await convertGLBtoSTL(inputPath, outputPath);
    } else if (format === "ply") {
      const baseName = req.file.filename;
      const plyDir = path.join("outputs", baseName);

      await fs.mkdir(plyDir, { recursive: true });

      const plyPath = path.join(plyDir, `${baseName}.ply`);
      await convertGLBtoPLY(inputPath, plyPath, true);

      const files = await fs.readdir(plyDir);
      const fullPaths = files.map((f) => path.join(plyDir, f));

      outputFileName = `${baseName}.zip`;
      outputPath = path.join("outputs", outputFileName);

      await zipFiles(fullPaths, outputPath);

      await Promise.all(fullPaths.map((f) => fs.unlink(f)));
      await fs.rmdir(plyDir);
    } else if (format === "obj") {
      const baseName = req.file.filename;
      const objDir = path.join("outputs", baseName);

      await convertGLBtoOBJ(inputPath, objDir, baseName);

      const files = await fs.readdir(objDir);
      const fullPaths = files.map((f) => path.join(objDir, f));

      outputFileName = `${baseName}.zip`;
      outputPath = path.join("outputs", outputFileName);

      await zipFiles(fullPaths, outputPath);

      await Promise.all(fullPaths.map((f) => fs.unlink(f)));
      await fs.rmdir(objDir);
    } else if (format === "fbx") {
      outputFileName = `${req.file.filename}.fbx`;
      outputPath = path.join("outputs", outputFileName);

      await convertGLBtoFBX(inputPath, outputPath);
    } else if (format === "3mf") {
      outputFileName = `${req.file.filename}.3mf`;
      outputPath = path.join("outputs", outputFileName);

      await convertGLBto3MF(inputPath, outputPath);
    } else {
      await fs.unlink(inputPath);
      return res.status(400).json({ error: "Unsupported format" });
    }

    await fs.unlink(inputPath);

    res.json({
      success: true,
      fileId: outputFileName,
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Conversion failed" });
  }
});

/* ---------- Download ---------- */

app.get("/download/:fileId", async (req, res) => {
  const filePath = path.join("outputs", req.params.fileId);

  try {
    await fs.access(filePath);
    res.download(filePath, async () => {
      await fs.unlink(filePath);
    });
  } catch {
    res.status(404).json({ error: "File not found or expired" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
