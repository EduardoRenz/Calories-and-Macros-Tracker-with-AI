const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const allFiles = execSync('git ls-files').toString().trim().split('\n');

for (const file of allFiles) {
  if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.json')) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    // Replace neutrals
    newContent = newContent.replace(/healthpal-dark/g, 'neutral-dark');
    newContent = newContent.replace(/healthpal-panel/g, 'neutral-panel');
    newContent = newContent.replace(/healthpal-card/g, 'neutral-card');
    newContent = newContent.replace(/healthpal-border/g, 'neutral-border');
    newContent = newContent.replace(/healthpal-text-primary/g, 'neutral-text-primary');
    newContent = newContent.replace(/healthpal-text-secondary/g, 'neutral-text-secondary');
    
    // Replace remaining with brand
    newContent = newContent.replace(/healthpal-/g, 'brand-');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${file}`);
    }
  }
}
