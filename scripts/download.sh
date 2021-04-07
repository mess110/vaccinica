#!/usr/bin/env sh

OUTPUT_DIR=downloads

# do not change the method name and first param, it is used
# in scripts/dl2json.js to figure out how many months should be downloaded
download()
{
  URL=$1
  MONTH="$2"

  DOWNLOAD_DATE=`date +"%Y.%m.%d"`
  NAME=$DOWNLOAD_DATE.$MONTH
  echo "Downloading $URL to $OUTPUT_DIR/$NAME.xlsx"
  curl $URL --output $OUTPUT_DIR/$NAME.xlsx
}

# urls to files on data.gov.ro works in strange ways. The key is actually what
# counts, the actual filename like "dimineata" is made up. and somehow it works
# don't scratch your head too much with this..
download "https://data.gov.ro/dataset/b86a78a3-7f88-4b53-a94f-015082592466/resource/bc19c354-644d-4a24-a26f-512129dbc70d/download/dimineata" "martie"
download "https://data.gov.ro/dataset/b86a78a3-7f88-4b53-a94f-015082592466/resource/a0eb9ff2-9b97-430c-b285-360cadb55307/download/pe" "aprilie"

# TODO: automatically download may. is that even possible since I don't know
# the key it will have. Might be possible by looking for the files available
# under the dataset
