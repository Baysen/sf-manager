// Script to download all resource icons from satisfactory-calculator repository
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GITHUB_API_URL = 'https://api.github.com/repos/KirkMcDonald/satisfactory-calculator/contents/images';
const ICONS_DIR = join(__dirname, '../public/icons');

async function downloadFile(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  await writeFile(filepath, Buffer.from(buffer));
}

async function downloadIcons() {
  console.log('Fetching icon list from GitHub...');

  const response = await fetch(GITHUB_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch icon list: ${response.statusText}`);
  }

  const files = await response.json();
  const pngFiles = files.filter(file => file.name.endsWith('.png'));

  console.log(`Found ${pngFiles.length} icon files`);

  // Create icons directory if it doesn't exist
  if (!existsSync(ICONS_DIR)) {
    await mkdir(ICONS_DIR, { recursive: true });
    console.log('Created icons directory');
  }

  // Download icons in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < pngFiles.length; i += batchSize) {
    const batch = pngFiles.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (file) => {
        const filepath = join(ICONS_DIR, file.name);
        if (existsSync(filepath)) {
          console.log(`Skipping ${file.name} (already exists)`);
          return;
        }

        try {
          await downloadFile(file.download_url, filepath);
          console.log(`Downloaded ${file.name}`);
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error.message);
        }
      })
    );

    // Add a small delay between batches
    if (i + batchSize < pngFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\nIcon download complete!');
  console.log(`Total icons downloaded: ${pngFiles.length}`);
}

downloadIcons().catch(console.error);
