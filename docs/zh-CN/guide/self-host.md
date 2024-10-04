# 自托管

由于 NovaChat 不依赖于后端，所以可以方便的自行托管。

## 本地运行

> 本地需要 Node.js 20 + pnpm 9

```sh
git clone https://github.com/rxliuli/novachat.git
pnpm i
pnpm dev
```

打开 [http://localhost:5173](http://localhost:5173) 即可访问。

## 部署到远端

### 使用 Cloudflare Pages

1. 在本地构建静态资源 `pnpm build`
2. [注册 Cloudflare 账号](https://dash.cloudflare.com/sign-up)
3. 导航到 **Workers & Pages > Overview > Create an application > Pages**，选择 **Upload assets**
   ![self-host-1](/images/self-host-1.png)
4. 输入一个项目名并创建
   ![self-host-2](/images/self-host-2.png)
5. 将 `dist` 目录拖拽上传
   ![self-host-3](/images/self-host-3.png)
6. 现在，你已经成功部署到 Cloudflare Pages 了
   ![self-host-4](/images/self-host-4.png)
