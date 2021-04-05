#!/usr/bin/env sh

OUTPUT_DIR=downloads
YESTERDAY=`node scripts/yesterday.js`
URL="https://data.gov.ro/dataset/b86a78a3-7f88-4b53-a94f-015082592466/resource/bc19c354-644d-4a24-a26f-512129dbc70d/download/vaccinare-covid19-grupe-risc-01-$YESTERDAY.xlsx"
echo "Downloading $URL to $OUTPUT_DIR/$YESTERDAY.xlsx"
curl $URL --output $OUTPUT_DIR/$YESTERDAY.xlsx
