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

const jsonObj = excelToJson({
  sourceFile: path.join(dowloadsDir, latestDownloadedFileName),
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
fs.writeFileSync(outputPath, data);

const latestPath = path.join('html', 'data', 'latest.json');
fs.copyFileSync(outputPath, latestPath);
