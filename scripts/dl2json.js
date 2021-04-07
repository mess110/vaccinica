#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const excelToJson = require('convert-excel-to-json')

// get number of files downloaded today from scripts/download.sh
// by identifying how many times the download command was called
const filesDownloadedToday = async () => {
  cmd = 'cat scripts/download.sh | grep "download \\"https://data.gov.ro" | wc -l'
  try {
    const { stdout, stderr } = await exec(cmd)
    const stripped = stdout.replace(/\r?\n|\r/g, " ")
    return parseInt(stripped)
  } catch (e) {
    throw e
  }
}

const processFile = (fileName) => {
  const latestDownloadedFileName = fileName
  const latestXlsxPath = path.join(downloadsDir, latestDownloadedFileName)

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
  const outputPath = path.join(downloadsDir, outputFileName)
  console.log(`Writing ${outputPath}`)
  fs.writeFileSync(outputPath, data)

  return outputPath
}

const init = async () => {
  let downloadedMonths = await filesDownloadedToday()
  console.log(`Found ${downloadedMonths} downloaded files`)

  const xlsxFiles = fs.readdirSync(downloadsDir)
    .filter(f => f.endsWith('.xlsx'))
    .sort()
    .reverse()

  let processedFiles = []
  for (let i = 0, len = downloadedMonths; i < len; i++) {
    let processedFilePath = processFile(xlsxFiles[i])
    processedFiles.push(processedFilePath)
  }

  console.log("Merging files:")
  console.log(processedFiles)

  const latestPath = path.join('docs', 'data', 'latest.json')
  let output = undefined
  for (let fileName of processedFiles) {
    let temp = JSON.parse(fs.readFileSync(fileName))
    if (output === undefined) {
      output = temp
    } else {
      for (let item of temp['ag-grid']) {
        output['ag-grid'].push(item)
      }
    }
  }
  console.log(`Saving merged files to ${latestPath}`)
  const data = JSON.stringify(output)
  fs.writeFileSync(latestPath, data)
}

const downloadsDir = 'downloads'
init()
