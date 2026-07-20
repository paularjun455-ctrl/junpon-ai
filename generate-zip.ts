import fs from 'fs';
import path from 'path';
import * as archiverModule from 'archiver';

const archiver = ((archiverModule as any).default || archiverModule) as any;

export function generateProjectZip(outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression level
      });

      output.on('close', () => {
        resolve(outputPath);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Zip warning:', err);
        } else {
          reject(err);
        }
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      const workspaceRoot = process.cwd();

      // Add files and directories individually to exclude node_modules, dist, git, etc.
      const items = fs.readdirSync(workspaceRoot);

      for (const item of items) {
        const fullPath = path.join(workspaceRoot, item);
        const stat = fs.statSync(fullPath);

        // Define exclusions
        if (
          item === 'node_modules' ||
          item === 'dist' ||
          item === '.git' ||
          item === 'build' ||
          item.endsWith('.pdf') ||
          item.endsWith('.zip')
        ) {
          continue;
        }

        if (stat.isDirectory()) {
          // Add directory recursively
          archive.directory(fullPath, item);
        } else {
          // Add individual file
          archive.file(fullPath, { name: item });
        }
      }

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}
