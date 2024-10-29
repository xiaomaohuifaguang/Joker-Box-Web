FROM nginx:1.24.0

# 将dist目录复制到Nginx的静态资源目录
COPY ./dist /usr/share/nginx/html

# 复制自定义的nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露容器内的端口给外部访问
EXPOSE 80

# 启动nginx服务
CMD ["nginx", "-g", "daemon off;"]

# docker build -t 192.168.1.4:7002/joker-box/web:1.0.0-beta .
# docker push 192.168.1.4:7002/joker-box/web:1.0.0-beta