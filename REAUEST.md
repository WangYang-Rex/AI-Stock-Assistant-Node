### 封装返回数据格式

请求正常返回数据，返回格式
```ts
type Response = 
{
  data: any, // 返回的数据
  message: string, // 操作成功/报错信息
  result: 100 | number, // 100表示接口正常
  success: boolean, // true表示请求成功 false表示接口报错
}
```