const fs = require('fs');
const readline = require('readline');

function fixUrls(urls) {
  const patterns = ['WID_', 'PID_', 'PPID_', 'AGID_', "Consumable_", "CreativePlot_", "PW_", "PPID", "AGID", "Ammo"];
  return urls.map(url => {
    // Check for specific patterns first
    for (const pattern of patterns) {
      if (url.includes(pattern)) {
        const matches = url.match(new RegExp(`${pattern}([^/.']+)`));
        return matches ? `${pattern}${matches[1]}` : null;
      }
    }
    return null;
  }).filter(Boolean);
}

function generateJson(fixedUrls) {
  return fixedUrls.map(url => {
    const id = url.split('.').pop().replace(/\r/g, '').replace("'", "");

    const categories = {
      'WID_': 'Weapon',
      'PID_': 'Device',
      'PPID_': 'Gallery',
      'AGID_': 'Consumable',
      "AGID": "Consumable",
      "PPID": "Gallery",
      "Ammo": "Ammo",
      "Consumable_": "Consumable",
      "CreativePlot_": "Prefab",
      "PW_": "Prefab",
      "Ammo_": "Consumable",
    };

    const assetTypes = {
      'WID_': 'Weapon',
      'PID_': 'Playset',
      'PPID_': 'PlaysetProp',
      'AGID_': 'AthenaGadget',
      'PPID': 'PlaysetProp',
      'AGID': 'AthenaGadget',
      "Ammo": "Ammo",
      "Consumable_": "Consumable",
      "CreativePlot_": "CreativePlot",
      "PW_": "PlaysetWorld",
      "Ammo_": "Ammo"
    };

    // Check for specific patterns first
    for (const pattern of Object.keys(categories)) {
      if (id.endsWith(pattern)) {
        return {
          Category: categories[pattern],
          PrimaryAsset: {
            Name: assetTypes[pattern],
            Id: id
          }
        };
      }
    }

    // Proceed with the general patterns
    let prefix = id.substring(0, 15);
    let amt = 0;
    if (prefix.includes("PID_") || prefix.includes("WID_")) {
      amt = 4
    } else if (prefix.includes("PW_")) {
      amt = 3
    } else if (prefix.includes("Consumable_")) {
      amt = 11
    } else if (prefix.includes("CreativePlot_")) {
      amt = 14
    } else if (prefix.includes("PPID_") || prefix.includes("AGID_" || prefix.includes("Ammo_"))) {
      amt = 5
      if (amt == 4) {
        amt = 5
      }
    }
    prefix = id.substring(0, amt)
    console.log("JSON output file created.")
    return {
      Category: categories[prefix],
      PrimaryAsset: {
        Name: assetTypes[prefix],
        Id: id
      }
    };
  });
}

function readFile(file) {
  return fs.readFileSync(file, 'utf8').trim().split('\n');
}

function writeOutput(output, fileName) {
  fs.writeFile(fileName, output, 'utf8', err => {
    if (err) {
      console.error(`Error writing to ${fileName}:`, err);
    } else {

    }
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Created By AjaxFNC\n-------------------------------------------------")
rl.question('What would you like to log to?\n1. JSON\n2. TXT\n', answer => {
  if (answer === '1') {
    processFile('input.txt', '.json', generateJson);
  } else if (answer === '2') {
    processFile('input.txt', '.txt', fixUrls);
  } else {
    console.error('Invalid choice. Please choose 1 for JSON or 2 for TXT.');
    process.exit(1);
  }

  rl.close();
});

function processFile(inputFile, extension, processFunction) {
  const outputFileName = 'output' + extension;

  // Check if the output file already exists
  if (fs.existsSync(outputFileName)) {
    // If it exists, read its content
    const existingContent = fs.readFileSync(outputFileName, 'utf8');
    let existingData;

    try {
      // Try to parse the existing content as JSON
      existingData = JSON.parse(existingContent);
    } catch (error) {
      // If parsing fails, assume it's a plain text file and split by newline
      existingData = existingContent.trim().split('\n');
    }

    // Process the existing data
    const processedData = processFunction(existingData);

    // Write the updated content back to the file
    const updatedContent =
      extension === '.json' ? JSON.stringify(processedData, null, 2) : processedData.join('\n');

    fs.writeFileSync(outputFileName, updatedContent, 'utf8');
  } else {
    // If the output file doesn't exist, proceed as usual
    const urls = readFile(inputFile);
    const processedData = processFunction(urls);

    const outputContent =
      extension === '.json' ? JSON.stringify(processedData, null, 2) : processedData.join('\n');

    writeOutput(outputContent, outputFileName);
  }
}
