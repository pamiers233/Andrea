const fs = require('fs');

const part1 = require('./rants_part1.js');
const part2 = require('./rants_part2.js');

const allRants = { ...part1, ...part2 };

const filePath = 'd:/Amdrea/js/devlog.js';
let content = fs.readFileSync(filePath, 'utf-8');

for (let i = 1; i <= 8; i++) {
    const newRant = allRants[i];
    // We want to match: id: 1, ... rant: `...`, tech:
    // Because backticks in template literals are annoying, we use string concat.
    const searchRegex = new RegExp("(id:\\\\s*" + i + ",[\\\\s\\\\S]*?rant:\\\\s*\\`)([\\\\s\\\\S]*?)(?=\\`,\\\\s*tech:)", 'g');

    content = content.replace(searchRegex, (match, prefix, oldRant) => {
        return prefix + newRant;
    });
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Replaced 8 rants successfully.");
