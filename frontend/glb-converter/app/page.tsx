// "use client";

// import * as THREE from "three";
// import { GLTFLoader } from "three-stdlib";

// export const loadGLBFile = async (
//   file: File,
//   onLoaded: (scene: THREE.Group) => void,
//   onError?: (error: unknown) => void
// ) => {
//   try {
//     // Validate file type
//     if (!file.name.toLowerCase().endsWith(".glb")) {
//       throw new Error("Only GLB files are supported");
//     }

//     // Convert GLB file to ArrayBuffer
//     const buffer = await file.arrayBuffer();

//     // Initialize GLTF loader
//     const loader = new GLTFLoader();

//     // Parse GLB data
//     loader.parse(
//       buffer,
//       "",
//       (gltf) => {
//         if (!gltf.scene) {
//           throw new Error("Invalid GLB file");
//         }
//         onLoaded(gltf.scene);
//       },
//       (error) => {
//         console.error("GLTF parse error:", error);
//         if (onError) onError(error);
//       }
//     );
//   } catch (err) {
//     console.error("GLB loading failed:", err);
//     if (onError) onError(err);
//   }
// };

// /**
//  * Placeholder component
//  */
// export default function Page() {
//   return (
//     <div style={{ padding: "20px" }}>
//       <h3>GLB Loading Logic Module</h3>
//     </div>
//   );
// }

"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import {
  UploadCloud,
  File as FileIcon,
  Loader2,
  Download,
  XCircle,
} from "lucide-react";

/* =======================
   GLB LOADING LOGIC
======================= */
async function loadGLBFile(
  file: File,
  onLoaded: (scene: THREE.Group) => void,
  onError?: (error: unknown) => void
) {
  try {
    if (!file.name.toLowerCase().endsWith(".glb")) {
      throw new Error("Only GLB files are supported");
    }

    const buffer = await file.arrayBuffer();
    const loader = new GLTFLoader();

    loader.parse(
      buffer,
      "",
      (gltf) => {
        if (!gltf.scene) {
          throw new Error("Invalid GLB file");
        }
        console.log("GLB Scene loaded:", gltf.scene);
        onLoaded(gltf.scene);
      },
      (error) => {
        console.error("GLTF parse error:", error);
        onError?.(error);
      }
    );
  } catch (err) {
    console.error("GLB loading failed:", err);
    onError?.(err);
  }
}

/* =======================
   MAIN PAGE COMPONENT
======================= */
export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState("STL (Stereolithography)");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formats = [
    "STL (Stereolithography)",
    "OBJ (Wavefront)",
    "FBX (FilmBox)",
    "PLY (Polygon File Format)",
    "3MF (3D Manufacturing Format)",
    "ZIP (Archive)",
    "USDZ (Universal Scene Description)",
  ];

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    setError(null);
    setDone(false);

    const f = e.dataTransfer.files[0];
    if (f && f.name.toLowerCase().endsWith(".glb")) {
      setFile(f);
    } else {
      setError("Only GLB files are accepted.");
    }
  };

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setDone(false);
    const f = e.target.files?.[0];
    if (f && f.name.toLowerCase().endsWith(".glb")) {
      setFile(f);
    } else if (f) {
      setError("Only GLB files are accepted.");
    }
  };

  const clearFile = () => {
    setFile(null);
    setDone(false);
    setLoading(false);
    setError(null);
  };

  const handleConvert = async () => {
  if (!file) return;

  setLoading(true);
  setError(null);
  setDone(false);

  try {
    const formData = new FormData();
    formData.append("file", file);     // MUST be "file"
    formData.append("format", "stl");  // backend expects this

    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
      // ❌ DO NOT set headers
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    console.log("Backend response:", data);

    if (!data.downloadUrl) {
      throw new Error("No download URL returned");
    }

    // Trigger real download from backend
    window.location.href = `http://localhost:8000${data.downloadUrl}`;

    setDone(true);
  } catch (err) {
    console.error(err);
    setError("Conversion failed");
  } finally {
    setLoading(false);
  }
};


  const handleDownload = () => {
    if (!file) return;
    // Mock download: same file
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(".glb", `.${format.split(" ")[0].toLowerCase()}`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatShort = format.split(" ")[0];

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-3xl p-12">

        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
            Universal 3D Model Converter
          </h1>
          <p className="text-white/70 mt-3 text-xl">
            Upload GLB files and convert them to other 3D formats.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Upload Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white/90">
              1. Upload GLB File
            </h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative rounded-xl border-4 p-10 text-center transition
                ${dragging ? "border-lime-400 bg-lime-500/10" : "border-white/10"}
              `}
            >
              <UploadCloud className="h-12 w-12 text-lime-400 mx-auto" />

              {!file ? (
                <>
                  <p className="text-white mt-4">
                    Drag & drop your <b>GLB</b> file or click to upload
                  </p>
                  <input
                    type="file"
                    accept=".glb"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleSelect}
                  />
                </>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2 text-white">
                  <FileIcon className="text-lime-400" />
                  <span>{file.name}</span>
                  <button onClick={clearFile}>
                    <XCircle className="text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-400">{error}</p>
            )}
          </div>

          {/* Convert Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white/90">
              2. Convert
            </h2>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white"
            >
              {formats.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>

            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-lime-600 to-emerald-600 text-black font-bold"
            >
              {loading ? (
                <span className="flex justify-center gap-2">
                  <Loader2 className="animate-spin" />
                  Converting...
                </span>
              ) : done ? (
                "Conversion Complete"
              ) : (
                `Convert to ${formatShort}`
              )}
            </button>

            {done && (
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-xl bg-lime-500 text-black flex justify-center gap-2"
              >
                <Download />
                Download File
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
