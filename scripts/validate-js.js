const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let failures = 0;
let scriptIndex = 0;

const countLines = (text) => (text.match(/\n/g) || []).length + 1;

while((match = scriptRegex.exec(html)) !== null){
  const attrs = match[1] || '';
  const code = match[2] || '';
  const hasSrc = /\ssrc\s*=/.test(attrs);
  if(hasSrc) continue;
  scriptIndex += 1;

  const lineOffset = countLines(html.slice(0, match.index));
  try{
    new Function(code);
  }catch(err){
    failures += 1;
    const msg = err && err.message ? err.message : String(err);
    console.error(`Script block #${scriptIndex} failed to parse at line ${lineOffset}: ${msg}`);
  }
}

if(scriptIndex === 0){
  console.warn('No inline <script> blocks found to validate.');
}

if(failures > 0){
  process.exit(1);
}

console.log(`Validated ${scriptIndex} inline script block(s).`);
