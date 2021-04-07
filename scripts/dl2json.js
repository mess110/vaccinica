#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const excelToJson = require('convert-excel-to-json')

// gets the number of months since march (including march)
const monthsSinceStart = () => {
  const march = new Date('2021-3-1 UTC')
  const today = new Date()

  return (today.getFullYear() - march.getFullYear()) * 12
    - march.getMonth()
    + today.getMonth()
    + 1
}

const dowloadsDir = 'downloads'
const xlsxFiles = fs.readdirSync(dowloadsDir)
  .filter(f => f.endsWith('.xlsx'))
  .sort()
  .reverse()

const processFile = (fileName) => {
  const latestDownloadedFileName = fileName
  const latestXlsxPath = path.join(dowloadsDir, latestDownloadedFileName)

  console.log(`Converting ${latestXlsxPath} to json`)
  const jsonObj = excelToJson({
    sourceFile: latestXlsxPath,
    header: {
      rows: 1
    },
    columnToKey: {
      '*': '{{columnHeader}}'
    }
  })

  const data = JSON.stringify(jsonObj)

  const outputFileName = latestDownloadedFileName.replace(/\.[^.]+$/, '.json')
  const outputPath = path.join(dowloadsDir, outputFileName)
  console.log(`Writing ${outputPath}`)
  fs.writeFileSync(outputPath, data)

  return outputPath
}

const MAX_MONTHS = 2

let processedFiles = []
for (let i = 0, len = monthsSinceStart() + 5; i < len; i++) {
  if (i > MAX_MONTHS - 1) {
    // stop after 2 months because we can't auto download the "next" month
    // because we don't know the key. after editing download.sh, increment
    // the max amount of months to process
    break
  }
  processedFiles.push(processFile(xlsxFiles[i]))
}

console.log("Merging files:")
console.log(processedFiles)

const latestPath = path.join('docs', 'data', 'latest.json')
let output = undefined
for (let fileName of processedFiles) {
  let temp = JSON.parse(fs.readFileSync(fileName))
  if (output === undefined) {
    output = temp;
  } else {
    for (let item of temp['ag-grid']) {
      output['ag-grid'].push(item)
    }
  }
}
console.log(`Saving merged files to ${latestPath}`)
const data = JSON.stringify(output)
fs.writeFileSync(latestPath, data)
