import archiver from "archiver";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";

export async function zipFiles(files, zipPath) {
  await fs.mkdir(path.dirname(zipPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const output = fsSync.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);

    files.forEach(file => {
      archive.file(file, { name: path.basename(file) });
    });

    archive.finalize();
  });
}
