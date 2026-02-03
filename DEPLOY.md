# 部署指南 (Deployment Guide)

本文档介绍如何在 Linux 服务器上部署后台服务。

## 1. 环境准备

在服务器上安装 Node.js (推荐 v18 或更高版本) 和 Git。

```bash
# 安装 Node.js (以 Ubuntu 为例)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

## 2. 安装 PM2

PM2 是一个 Node.js 进程管理工具，用于保持服务在后台运行。

```bash
sudo npm install -g pm2
```

## 3. 获取代码

将代码上传到服务器（例如使用 Git）。

```bash
git clone <your-repo-url> guandan-server
cd guandan-server
```

## 4. 安装依赖

```bash
npm install
```

## 5. 启动服务

我们使用 `tsx` 直接运行 TypeScript 代码，或者你可以先编译。为了简单起见，这里介绍使用 `pm2` 配合 `tsx` 启动。

### 方式一：直接运行 TypeScript (推荐)

```bash
# 启动服务
pm2 start "npx tsx api/server.ts" --name guandan-api

# 查看状态
pm2 status

# 查看日志
pm2 logs guandan-api
```

### 方式二：编译后运行 (传统方式)

如果你希望先编译成 JS 再运行：

1. 修改 `package.json` 添加构建脚本 (如果还没有):
   ```json
   "scripts": {
     "build:server": "tsc -p tsconfig.json"
   }
   ```
2. 执行构建:
   ```bash
   npm run build:server
   ```
3. 启动 JS 文件:
   ```bash
   pm2 start dist/api/server.js --name guandan-api
   ```

## 6. 配置开机自启

```bash
pm2 startup
pm2 save
```

## 7. 注意事项

*   **端口**: 默认端口为 `3001`。请确保服务器防火墙（如 Security Group 或 ufw）允许访问该端口。
*   **数据持久化**: 数据库文件位于 `data/db.json`。请定期备份该文件。
*   **环境变量**: 如果需要修改端口，可以在启动前设置环境变量：
    ```bash
    PORT=8080 pm2 start "npx tsx api/server.ts" --name guandan-api --update-env
    ```

## 8. 常用命令

*   重启服务: `pm2 restart guandan-api`
*   停止服务: `pm2 stop guandan-api`
*   删除服务: `pm2 delete guandan-api`
