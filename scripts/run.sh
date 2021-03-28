sudo docker rm -f vaccinica || true
sudo docker build -t vaccinica-im .
sudo docker run -d -it \
    -p 8000:8000 \
    --name vaccinica \
    vaccinica-im 
