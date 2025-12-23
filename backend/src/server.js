import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { glb_convert } from "../converters/glb_converter.js";


const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

//upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =Date.now() + "-" +file.originalname;
    cb(null, uniqueName);
  } 
});

// flow 
//user hit url from frontend
//file is uploaded to backend using multer
//file is saved in uploads folder
//glb_converter function is called with input file path and output format
//it convert it in the desired format and saves it in output folder
//i have exposed another endpoint to download the file from output folder
// finally a download url is sent to frontend

const upload = multer({ storage });

app.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputFilePath = req.file.path;
    const outputFormat = req.body.format || "stl"; 

    const outputFilePath = await glb_convert(inputFilePath, outputFormat);
    const fileName = path.basename(outputFilePath);
    res.json({
  message: "File processed successfully",
  downloadUrl: `http://localhost:${PORT}/download/${fileName}`
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/download/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(process.cwd(), "output", fileName);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error(err);
      res.status(404).json({ error: "File not found" });
    }
  });
});



app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
