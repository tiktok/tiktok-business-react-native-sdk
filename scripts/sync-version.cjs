const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const versionFilePath = path.join(rootDir, 'src', 'version.ts');

const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const nextContent = `export const REACT_NATIVE_VERSION = '${version}';\n`;

if (fs.existsSync(versionFilePath)) {
  const currentContent = fs.readFileSync(versionFilePath, 'utf8');
  if (currentContent === nextContent) {
    process.exit(0);
  }
}

fs.writeFileSync(versionFilePath, nextContent);
