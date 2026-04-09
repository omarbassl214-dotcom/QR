import fs from 'fs';
import path from 'path';

const dirs = ['d:/qr code/src/data/weddings', 'd:/qr code/src/data/events'];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(data)) {
          console.log(`Resetting check-ins in ${filePath}...`);
          const resetData = data.map(guest => ({ ...guest, attended: false }));
          fs.writeFileSync(filePath, JSON.stringify(resetData, null, 2));
        }
      } catch (e) {
        console.error(`Failed to reset ${filePath}:`, e);
      }
    });
  }
});

// Remove usher logs
const ushersDir = 'd:/qr code/src/data/ushers';
if (fs.existsSync(ushersDir)) {
  const files = fs.readdirSync(ushersDir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    fs.unlinkSync(path.join(ushersDir, file));
    console.log(`Deleted usher log ${file}`);
  });
}

// Also clear registry_index.json to trigger a clean re-sync
const indexPath = 'd:/qr code/src/data/registry_index.json';
if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath);
    console.log('Removed registry_index.json for fresh sync');
}
