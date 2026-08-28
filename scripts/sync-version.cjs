const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const versionFilePath = path.join(rootDir, 'src', 'version.ts');

const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!fs.existsSync(versionFilePath)) {
  throw new Error(`Version file does not exist: ${versionFilePath}`);
}

const currentContent = fs.readFileSync(versionFilePath, 'utf8');
const versionPattern = /export const REACT_NATIVE_VERSION = '[^']+';/;

if (!versionPattern.test(currentContent)) {
  throw new Error(
    `REACT_NATIVE_VERSION declaration was not found in: ${versionFilePath}`
  );
}

const nextContent = currentContent.replace(
  versionPattern,
  `export const REACT_NATIVE_VERSION = '${version}';`
);

if (currentContent !== nextContent) {
  fs.writeFileSync(versionFilePath, nextContent, 'utf8');
}
