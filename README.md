# 用Node.js爬虫下载花瓣网画板的图片

```
npm install
```

```
node app.js
```

画板的url的获取方法：Chrome F12打开Network面板，点击任意一个画板进去，点击任意图片或上拉加载更多，复制最后一个XHR请求地址，把max的值删除，就ok了。
