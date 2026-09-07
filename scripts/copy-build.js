const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../frontend/dist');
const dest = path.resolve(__dirname, '../backend/dist/public');

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`[LifeOS Build] Successfully copied frontend static assets: ${src} -> ${dest}`);
} else {
  console.warn(`[LifeOS Build Warning] Source frontend dist directory not found: ${src}`);
}
