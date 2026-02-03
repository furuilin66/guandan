# 掼蛋大赛计分

本项目包含掼蛋大赛的微信小程序前端代码和Node.js后端服务。

## 项目结构

- `api/`: Node.js 后端代码 (Express)
- `miniprogram/`: 微信小程序源代码
- `data/`: 存放数据库文件 (db.json)
- `src/`: Web前端代码 (React, 可选作为管理后台)

## 快速开始

### 1. 启动后端服务

后端服务负责处理登录、计分和排行榜数据。

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run server:dev
```

服务将运行在 `http://localhost:3001`。

### 2. 运行微信小程序

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 打开微信开发者工具，点击"导入项目"。
3. 选择本项目下的 `miniprogram` 文件夹。
4. AppID 可以使用测试号 (或者您自己的 AppID)。
5. 在开发者工具中，如果需要连接本地后端，请勾选 "详情" -> "本地设置" -> "不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书"。

## 功能说明

1. **登录**: 输入队伍名称登录，或扫码登录（模拟）。
2. **记分**: 选择轮次(1-3)，输入对手名称，选择打到的级数(2-A)。
3. **排行榜**: 查看所有队伍的总分排名和每一轮的得分详情。

## 注意事项

- 数据库使用 `data/db.json` 文件模拟，方便部署和演示，无需安装额外数据库软件。
- 小程序中的 API 地址默认为 `http://localhost:3002/api`，如在真机调试，请将 `miniprogram/app.js` 中的 IP 地址修改为电脑的局域网 IP。
