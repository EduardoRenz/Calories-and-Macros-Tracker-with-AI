const fs = require('fs');
const path = require('path');

const files = [
  'locales/en.ts',
  'locales/es.ts',
  'locales/pt.ts',
  'data/services/MockChatAssistantService.ts',
  'data/services/BaseChatAssistantService.ts',
  'cypress/e2e/first-time-setup.cy.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace HealthPal with LeveMente
    content = content.replace(/HealthPal/g, 'LeveMente');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
