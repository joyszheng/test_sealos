# test-sealos

一个面向 [Sealos DevBox](https://gzg.sealos.run/) 的 Node.js 示例应用：带静态首页、健康检查与简单 API，可一键发布并部署到 Sealos Cloud。

## 功能

| 路径 | 说明 |
|------|------|
| `/` | 示例首页 |
| `/api/hello?name=xxx` | 问候接口 |
| `/api/info` | 运行环境信息 |
| `/api/health` 或 `/healthz` | 健康检查 |

默认监听 `0.0.0.0:8080`，可通过环境变量 `PORT` / `HOST` 覆盖。

## 本地 / DevBox 开发

```bash
# 安装依赖（本项目仅使用 Node 内置模块，可跳过）
npm install

# 方式一：直接启动
npm start

# 方式二：按 Sealos 约定启动（推荐在 DevBox 中使用）
bash entrypoint.sh
```

浏览器访问：

- 开发环境公网预览地址（DevBox 网络面板里提供）
- 或 `http://127.0.0.1:8080`

生产模式验证：

```bash
bash entrypoint.sh production
```

## 项目结构

```text
.
├── entrypoint.sh      # Sealos 启动脚本（Release 后容器入口）
├── package.json
├── server.js          # HTTP 服务主程序
├── public/            # 静态页面与前端资源
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## 部署到 https://gzg.sealos.run/

> `gzg.sealos.run` 是 Sealos 国内可用区控制台。整体流程：**开发 → Release（打 OCI 镜像）→ Deploy（上线）**。

### 1. 打开控制台并进入项目

1. 浏览器打开 [https://gzg.sealos.run/](https://gzg.sealos.run/)
2. 登录后进入 **项目 / Projects**
3. 打开你的 DevBox 项目（本仓库对应的 DevBox）

### 2. 在 DevBox 中确认应用可运行

在 Cursor / VS Code / 浏览器终端中进入项目目录：

```bash
bash entrypoint.sh
```

确认日志类似：

```text
Development environment detected
Running development environment commands...
[development] Server running at http://0.0.0.0:8080/
```

在 DevBox 的 **网络 / Network** 面板中确认：

- 容器端口为 **8080**（或你设置的 `PORT`）
- 已开启公网访问（用于开发预览）

打开预览地址，能看到首页且健康检查返回 `status: ok` 即可。

### 3. 检查 `entrypoint.sh`

Sealos 发布镜像后会用 `entrypoint.sh production` 启动应用。

当前脚本只负责启动，**不要把构建步骤写进 entrypoint**（本示例无构建步骤）：

```bash
NODE_ENV=production node server.js
```

如有编译型项目（TypeScript / Next.js 等），应在 DevBox 里先 `npm run build`，再让 entrypoint 只启动产物。

### 4. 创建 Release（发布镜像）

1. 在 Sealos 控制台进入该 **DevBox**
2. 打开 **Releases** 标签
3. 点击 **+ Add new release / 新建版本**
4. 填写：
   - **Tag**：如 `v1.0.0`
   - **Description**：如 `完善示例首页与 API`
5. 确认后等待构建完成（状态成功即可）

系统会把当前 DevBox 环境打包成 **OCI 镜像**，并记录版本号。

### 5. 一键 Deploy（部署上线）

1. 在对应 Release 右侧点击 **Deploy**
2. 选择 **+ Add new deployment**（或更新已有部署）
3. 按需调整：
   - **CPU / 内存**
   - **副本数**
   - **端口映射**：容器端口 `8080`，对外协议 HTTP
   - **环境变量**（可选）：`PORT=8080`、`NODE_ENV=production`
4. 确认部署，等待状态变为 **Running**

### 6. 访问线上应用

部署成功后，在应用卡片 / 详情里可以看到 **公网域名**。打开即可访问：

- 首页：`https://你的域名/`
- 健康检查：`https://你的域名/api/health`
- 运行信息：`https://你的域名/api/info`

### 7. 后续更新流程

每次改代码后：

1. DevBox 中验证 `bash entrypoint.sh`
2. 新建 Release（如 `v1.0.1`）
3. 对该版本再次 Deploy（覆盖或新建部署）

## 常见问题

### 页面打不开 / 502

- 确认应用监听 `0.0.0.0`，不要只绑 `127.0.0.1`
- 确认容器端口与控制台「网络」配置一致（默认 `8080`）
- 查看应用日志是否有启动报错

### Release 后启动失败

- 在 DevBox 中先执行：`bash entrypoint.sh production`
- 确认 `entrypoint.sh` 可执行：`chmod +x entrypoint.sh`
- 确认入口文件名与脚本一致（当前为 `server.js`）

### 如何改端口

1. 修改启动环境变量 `PORT`
2. 同步修改 Sealos 网络面板中的容器端口映射

## 参考文档

- Sealos 控制台（本区域）：https://gzg.sealos.run/
- Sealos 文档：https://sealos.run/docs/overview/intro/
- DevBox 指南：https://sealos.run/docs/guides/devbox/
- entrypoint.sh 说明：https://sealos.run/docs/guides/fundamentals/entrypoint-sh
- 发布 Release：https://sealos.io/docs/guides/fundamentals/release
- 部署 Deploy：https://sealos.io/docs/guides/fundamentals/deploy

---

DevBox: Code. Build. Deploy. We've Got the Rest.
