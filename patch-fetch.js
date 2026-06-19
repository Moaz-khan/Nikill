const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // If it contains fetch( and doesn't contain fetchJson
            if (content.includes('await fetch(')) {
                
                // Add import at top if needed
                if (!content.includes('fetchJson')) {
                    const depth = fullPath.replace(__dirname + '/app', '').split('/').length - 2;
                    const importPath = depth === 0 ? './utils/fetchApi' : '../'.repeat(depth) + 'utils/fetchApi';
                    content = `import { fetchJson } from '${importPath}';\n` + content;
                }

                // regex to replace generic fetch and .json()
                content = content.replace(/const (\w+) = await fetch\((.*?)\);\n\s*const (\w+) = await \1\.json\(\);/g, 'const $3 = await fetchJson($2);');
                
                // For direct returns
                content = content.replace(/await \(await fetch\((.*?)\)\)\.json\(\)/g, 'await fetchJson($1)');

                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Patched ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'app'));
