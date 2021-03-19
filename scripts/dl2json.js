#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const excelToJson = require('convert-excel-to-json');

const dowloadsDir = 'downloads';
const xlsxFiles = fs.readdirSync(dowloadsDir)
  .filter(f => f.endsWith('.xlsx'))
  .sort()
  .reverse();
const latestDownloadedFileName = xlsxFiles[0];
const latestXlsxPath = path.join(dowloadsDir, latestDownloadedFileName);

console.log(`Converting ${latestXlsxPath} to json`);
const jsonObj = excelToJson({
  sourceFile: latestXlsxPath,
  header: {
    rows: 1
  },
  columnToKey: {
    '*': '{{columnHeader}}'
  }
});

const data = JSON.stringify(jsonObj);

const outputFileName = latestDownloadedFileName.replace(/\.[^.]+$/, '.json');
const outputPath = path.join(dowloadsDir, outputFileName);
console.log(`Writing ${outputPath}`)
fs.writeFileSync(outputPath, data);

const latestPath = path.join('docs', 'data', 'latest.json');
console.log(`Copying ${outputPath} to ${latestPath}`)
fs.copyFileSync(outputPath, latestPath);
