const fs = require('fs');
const https = require('https');
const path = require('path');

const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
const outputPath = path.join(__dirname, '../frontend/src/services/fonts.ts');

console.log(`Downloading font from ${fontUrl}...`);

https.get(fontUrl, (res) => {
    if (res.statusCode !== 200 && res.statusCode !== 302) {
        console.error(`Failed to download font: Status Code ${res.statusCode}`);
        return;
    }

    // Handle redirects if necessary (GitHub raw often redirects)
    if (res.statusCode === 302) {
        https.get(res.headers.location, (redirectRes) => {
            processResponse(redirectRes);
        });
    } else {
        processResponse(res);
    }
}).on('error', (e) => {
    console.error(`Error downloading font: ${e.message}`);
});

function processResponse(res) {
    const data = [];

    res.on('data', (chunk) => {
        data.push(chunk);
    });

    res.on('end', () => {
        const buffer = Buffer.concat(data);
        const base64 = buffer.toString('base64');
        const content = `// Auto-generated font file\nexport const robotoBase64 = "${base64}";\n`;

        fs.writeFile(outputPath, content, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log(`Successfully wrote font data to ${outputPath}`);
                console.log(`Base64 length: ${base64.length}`);
            }
        });
    });
}
