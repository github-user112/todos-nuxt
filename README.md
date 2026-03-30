# 智能日历管家 - Nuxt 3 版本

基于 Nuxt 3 全栈架构的日历应用，部署在 Cloudflare Pages 上。

## 技术栈

- **前端**: Vue 3 + Nuxt 3 + Naive UI
- **后端**: Nuxt Server Routes（替代原来的 Cloudflare Worker）
- **数据库**: Cloudflare D1（SQLite）
- **部署**: Cloudflare Pages

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前端）
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 部署到 Cloudflare Pages

### 1. 创建 D1 数据库

在 Cloudflare 控制台：
1. 进入 **Workers & Pages** → **D1**
2. 点击 **Create database**，名称填 `todos_calendar_db`
3. 进入数据库，点击 **Console**，执行 `schema.sql` 中的 SQL 语句
4. 记下 **Database ID**（在数据库详情页的右侧）

### 2. 修改 wrangler.toml

将 `YOUR_D1_DATABASE_ID_HERE` 替换为上一步获取的 Database ID。

### 3. 部署

**方式一：Git 自动部署（推荐）**

1. 将项目推送到 GitHub/GitLab
2. 在 Cloudflare 控制台：
   - **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
   - 选择你的仓库
   - Build settings:
     - Build command: `npm run build`
     - Build output directory: `dist`
3. 在 **Settings** → **Bindings** 中添加 D1 绑定：
   - Variable name: `DB`
   - D1 database: 选择你创建的 `todos_calendar_db`

**方式二：命令行部署**

```bash
# 首次部署
npx wrangler pages deploy dist --project-name=todos-nuxt

# 绑定 D1（在 CF 控制台 Pages 项目的 Settings > Functions > D1 database bindings 中添加）
```

### 4. 环境变量/绑定

在 Cloudflare Pages 项目的 **Settings** → **Bindings** 中：
- D1 database binding: Variable name = `DB`, Database = `todos_calendar_db`

## 项目结构

```
├── app.vue                 # 根组件
├── pages/
│   └── index.vue           # 主页面（原 App.vue 逻辑）
├── components/             # Vue 组件（自动注册）
├── composables/            # 工具函数（自动导入）
├── server/
│   └── api/                # API 路由（替代 Worker）
├── assets/css/             # 样式文件
├── utils/db.ts             # D1 数据库工具
├── schema.sql              # 数据库表结构
├── nuxt.config.ts          # Nuxt 配置
└── wrangler.toml           # Cloudflare 配置
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/todos` | 获取待办列表 |
| POST | `/api/todos` | 创建待办 |
| PUT | `/api/todos` | 更新待办 |
| DELETE | `/api/todos` | 删除待办 |
| POST | `/api/completed-instances` | 切换完成状态 |
| POST | `/api/deleted-instances` | 删除重复实例 |

所有接口都需要 `uid` query 参数作为用户标识。
