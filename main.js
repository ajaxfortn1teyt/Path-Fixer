const fs = require('fs');
const readline = require('readline');

function fixUrls(urls) {
  const patterns = ['WID_', 'PID_', 'PPID_', 'AGID_', "Consumable_", "CreativePlot_", "D_", "PW_", "G_", "PPID", "AGID", "Ammo"];
  return urls.map(url => {
    // Check for specific patterns first
    for (const pattern of patterns) {
      if (url.includes(pattern)) {
        if (url.endsWith('D_') || url.endsWith('G_')) {
          return url;
        }
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
      "D_": "Weapon",
      "PW_": "Prefab",
      "Ammo_": "Consumable",
      "G_": "Weapon"
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
      "D_": "Deco",
      "PW_": "PlaysetWorld",
      "Ammo_": "Ammo",
      "G_": "Gadget"
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
  const urls = readFile(inputFile);
  const processedData = processFunction(urls);

  const outputFileName = 'output' + extension;
  const outputContent = extension === '.json' ? JSON.stringify(processedData, null, 2) : processedData.join('\n');
  writeOutput(outputContent, outputFileName);
}
