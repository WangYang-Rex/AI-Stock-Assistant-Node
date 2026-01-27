### CURSOR中当前项目常用语

#### 更新entities实例之后，更新相关controller,module,service,sql
```
@quote.entity.ts 去掉市场、市盈率、涨跌额、最高价、最低价字段，并更新相关的controller、module、service、sql
```

#### 整理Swagger所需的json
```
整理所有的API接口, 并生成Swagger 2.0 数据格式的 JSON文件

整理quotes的API接口, 按照Swagger 2.0 数据格式写入@quotes.swagger.json  注意不要basePath, 接口路径需要完整
整理quotes的实体类 api接口等信息, 写入@quotes.README.md

```

#### quotes相关 
- @588080.json 中的数据整理成 /quotes/batchAdd 接口所需的请求参数，股票为588080