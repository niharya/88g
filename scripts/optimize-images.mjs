import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';

const imagesDir = path.join(process.cwd(), 'public/images');
const MIN_SIZE = 400 * 1024; // 400 KB

function findFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, exts));
    } else {
      if (exts.includes(path.extname(fullPath).toLowerCase())) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function run() {
  const images = findFiles(imagesDir, ['.png', '.jpg', '.jpeg']);
  
  for (const img of images) {
    const stat = fs.statSync(img);
    if (stat.size > MIN_SIZE) {
      console.log(`Optimizing ${img} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
      const ext = path.extname(img);
      const webpPath = img.replace(new RegExp(`${ext}$`, 'i'), '.webp');
      
      // Convert to webp
      await sharp(img).webp({ quality: 80 }).toFile(webpPath);
      
      // Delete original
      fs.unlinkSync(img);
      
      // Find and replace in codebase
      const oldRef = img.split('public')[1].replace(/\\/g, '/');
      const newRef = webpPath.split('public')[1].replace(/\\/g, '/');
      
      console.log(`Replacing ${oldRef} -> ${newRef}`);
      
      // Use sed or grep/perl to replace in app/ directory
      try {
        execSync(`find app -type f -exec sed -i '' "s|${oldRef}|${newRef}|g" {} +`);
      } catch (e) {
        console.error(`Failed to replace references for ${oldRef}`, e.message);
      }
    }
  }
  console.log('Finished optimizing images.');
}

run().catch(console.error);
