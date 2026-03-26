# TimeTrain 项目分析报告

## 一、项目概览

**项目名称**: TimeTrain (时间小火车)  
**版本**: 1.0.0  
**类型**: Next.js 全栈应用

---

## 二、技术栈分析

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.5.2 | 全栈框架 (App Router) |
| React | ^18 | UI 库 |
| TypeScript | ^5 | 类型安全 |
| Tailwind CSS | 3.4.1 | 样式方案 |
| @dnd-kit/core | ^6.1.0 | 拖拽交互 |
| @dnd-kit/sortable | ^8.0.0 | 可排序拖拽 |
| Framer Motion | ^11.3.8 | 动画效果 |
| day.js | ^1.11.12 | 日期处理 |
| uuid | ^10.0.0 | UUID 生成 |
| canvas-confetti | ^1.9.3 | 庆祝动效 |

### 后端/云服务技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Cloudflare D1 | - | 主数据库 (SQLite) |
| Vercel KV | ^2.0.0 | 备用存储 (Redis) |
| @cloudflare/next-on-pages | ^1.13.5 | Cloudflare Pages 适配器 |
| wrangler | ^3.99.0 | Cloudflare 命令行工具 |

---

## 三、数据库架构

### 双重存储策略
项目实现了**双存储后端自动切换**：

```
优先使用 Cloudflare D1 (process.env.DB 存在时)
    ↓
降级使用 Vercel KV (备用方案)
```

### D1 数据库表结构
| 表名 | 用途 |
|------|------|
| `users` | 用户元数据 |
| `tasks` | 任务库 |
| `daily_plans` | 每日计划 |
| `carriages` | 车厢数据 |

---

## 四、项目结构问题

### ⚠️ 发现的问题
根目录下存在**重复的 `time-train/` 子目录**，这很可能是误操作导致的：

```
e:\git\timetrain/
├── app/                    ← 正确的源代码
├── components/
├── lib/
├── migrations/
├── package.json
├── wrangler.toml
└── time-train/             ← 重复目录 (需要删除!)
    ├── app/
    ├── components/
    ├── lib/
    ├── migrations/
    └── package.json
```

---

## 五、部署配置分析

### 当前配置状态
| 文件 | 配置内容 | 问题 |
|------|----------|------|
| `wrangler.toml` | 配置了 D1 数据库绑定 | 正确 |
| `vercel.json` | Next.js 标准配置 | 与 Cloudflare 部署不匹配 |
| `package.json` | 有 `@cloudflare/next-on-pages` 依赖 | 需要正确使用 |
| `README.md` | 描述使用 `npm run build` + `.next` 输出 | 过时，与实际代码不符 |

### 真实部署需求
根据代码分析，项目**必须使用 `@cloudflare/next-on-pages`**，因为：
1. API 路由使用了 Cloudflare D1 binding
2. 有 `wrangler.toml` 配置
3. 依赖了 `@cloudflare/next-on-pages`

---

## 六、API 路由分析

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/tasks` | GET/POST | 任务库 CRUD |
| `/api/plan` | GET/POST | 每日计划 CRUD |
| `/api/sync` | GET/POST | 全量数据同步 |
| `/api/export` | GET | 导出数据 |
| `/api/import` | POST | 导入数据 |

---

## 七、修复建议

1. **删除重复的 `time-train/` 子目录**
2. **更新 README.md** 为正确的 Cloudflare Pages 部署步骤
3. **确保使用 `@cloudflare/next-on-pages` 进行构建**
4. **配置正确的 Cloudflare Pages 构建设置**

