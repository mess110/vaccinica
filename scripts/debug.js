#!/usr/bin/env node

const fs = require('fs');

const output = fs.readFileSync('docs/data/latest.json');
const sheet = JSON.parse(output)['ag-grid'];
console.log(sheet[0]);
