FROM ubuntu:20.04

RUN apt-get update && apt-get -y install \
    software-properties-common \
    gnupg2 \
    apt-utils \
    curl \
    apt-transport-https \
    ca-certificates && \
    apt-get clean
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get -y install yarn && apt-get clean

COPY . /app

WORKDIR /app

RUN yarn install
RUN yarn download
RUN yarn dl2json

WORKDIR /app/docs

CMD python3 -m http.server 8000
