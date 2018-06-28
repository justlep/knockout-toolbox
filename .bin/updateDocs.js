const fs = require('fs'),
    path = require('path'),
    pug = require('pug'),
    README_PATH = path.resolve(__dirname, '../README.md'),
    START_COMMENT = '<!-- autoggenerated file list *** DO NOT EDIT *** -->',
    END_COMMENT = '<!-- /autoggenerated file list *** DO NOT EDIT *** -->',
    README_CONTENT = fs.readFileSync(README_PATH).toString();

if (!README_CONTENT.includes(START_COMMENT)) {
    throw 'Missing start marker comment!';
}

if (!README_CONTENT.includes(END_COMMENT)) {
    throw 'Missing end marker comment!';
}

// generate .html files from .pug files...


fs.readdirSync(path.resolve(__dirname, '../demo')).filter(f => f.endsWith('.pug') && !f.startsWith('.')).forEach(f => {
    let pugPath = path.join(__dirname, '../demo', f),
        htmlPath = pugPath.replace(/\.pug$/, '.html'),
        html = pug.renderFile(pugPath, {pretty: true}); // synchronous according to https://pugjs.org/api/reference.html

    fs.writeFileSync(htmlPath, html);
    console.log('Written ' + htmlPath);
});

// update README.md with html file links..

let mdLinks = fs.readdirSync(path.resolve(__dirname, '../demo')).filter(f => f.endsWith('.html')).sort().map(f => {
        let linkText = f.replace(/\.html$/, '').replace(/-/g, ', '),
            linkHref = `./demo/${f}`;

        return `* [${linkText}](${linkHref})`;
    }),
    newReadmeContent =
        README_CONTENT.substr(0, README_CONTENT.indexOf(START_COMMENT) + START_COMMENT.length) + '\n\n' +
        mdLinks.join('\n') + '\n\n' +
        README_CONTENT.substr(README_CONTENT.indexOf(END_COMMENT));


fs.writeFileSync(README_PATH, newReadmeContent);

console.log('\nUpdated ' + README_PATH);