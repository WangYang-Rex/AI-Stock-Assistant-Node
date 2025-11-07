### ai-stock-assistant nginx配置

#### host
```
127.0.0.1 stock.wy
```

#### nginx
```
server {
  listen       80;
  server_name stock.wy;
  charset utf-8;
  index /index.html;

  proxy_connect_timeout  5s;      # 和后端建立连接的超时
  proxy_send_timeout     300s;    # 向后端发送请求的超时
  proxy_read_timeout     300s;    # 等待后端响应的超时

  location ~* ^/api/ {
    proxy_pass http://localhost:3000; 
    # proxy_pass http://dingcrmapp.superboss.cc; 
  }

  location / {
    proxy_pass http://localhost:5173;
  }
}
``` 