FROM node:20.14.0

# 设置工作目录
WORKDIR /app

COPY ./ .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm","run","dev"]
