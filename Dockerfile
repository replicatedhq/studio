FROM node:8

RUN npm i -g yarn

WORKDIR /home/app

ADD yarn.lock .
RUN yarn install

ADD . .
RUN yarn install

ENV PATH=/home/app/bin:$PATH

RUN mkdir -p /home/app/replicated

EXPOSE 8006

CMD [ "replicated-studio" ]
