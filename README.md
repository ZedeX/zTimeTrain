# zTimeTrain - 时间小火车

给小学生的时间管理小火车 🚂

一个趣味化的时间管理工具，通过"火车车厢"的隐喻帮助孩子规划每日任务，培养时间观念。

## ✨ 特性

- 🚂 **火车车厢隐喻** - 每节车厢代表30分钟，任务像乘客一样"乘坐"车厢
- 🎨 **趣味化界面** - 多彩的任务卡片、庆祝动画，让时间管理不再枯燥
- 📅 **日期管理** - 支持任意日期切换，查看历史计划
- 📊 **月历统计** - 月度完成率概览，一目了然
- ↩️ **撤销功能** - 支持最多回溯10步操作
- 💾 **本地优先** - 实时写入 localStorage，30秒自动同步到云端
- 📤 **数据导入导出** - 支持 JSON 格式备份和恢复
- 📱 **全设备适配** - 手机、平板、PC 完美适配

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ZedeX/zTimeTrain.git
cd zTimeTrain

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可开始使用！

### 部署到 Cloudflare Pages

1. 在 Cloudflare 创建 D1 数据库：
   ```bash
   npx wrangler d1 create timetrain-db
   ```

2. 运行数据库迁移：
   ```bash
   npx wrangler d1 migrations apply timetrain-db --remote
   ```

3. 在 Cloudflare Dashboard 创建 Pages 项目，连接 GitHub 仓库

4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`

5. 在项目设置中绑定 D1 数据库，绑定名称为 `DB`

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **拖拽**: @dnd-kit
- **动画**: Framer Motion
- **日期**: day.js
- **数据库**: Cloudflare D1
- **部署**: Cloudflare Pages

## 📖 使用说明

### 核心概念

| 概念 | 说明 |
|------|------|
| 🚂 火车 | 单日完整时间计划 |
| 🚃 车厢 | 30分钟的时间容器，不可拖拽，仅可增删 |
| 👤 乘客 | 独立的待办任务，可拖拽分配 |
| ⏰ 时间线 | 当前系统时间标识，随时间自动行驶 |

### 基本操作

1. **添加任务** - 在任务库点击"+新增任务"
2. **分配任务** - 拖拽任务卡片到车厢或车厢间隙
3. **标记状态** - 点击车厢底部"✔完成"或"✖未完成"
4. **切换日期** - 使用顶部日期选择器
5. **查看统计** - 点击"月历统计"查看月度完成率

### 数据导入导出

- **导出**: 点击顶部"数据"按钮 → "导出数据"
- **导入**: 点击顶部"数据"按钮 → "导入数据"，选择 JSON 文件

## 🏗️ 项目结构

```
zTimeTrain/
├── app/
│   ├── page.tsx              # 首页（火车主页面）
│   ├── calendar/page.tsx      # 月历视图
│   ├── layout.tsx             # 全局布局
│   └── api/                   # API 路由
│       ├── tasks/route.ts
│       ├── plan/route.ts
│       ├── sync/route.ts
│       ├── export/route.ts
│       └── import/route.ts
├── components/
│   ├── Train/                 # 火车相关组件
│   ├── Task/                  # 任务相关组件
│   ├── Calendar/              # 月历组件
│   └── Common/                # 通用组件
├── lib/
│   ├── types.ts               # TypeScript 类型
│   ├── context.tsx            # React Context
│   ├── d1.ts                  # D1 数据库操作
│   └── kv.ts                  # KV 存储（备用）
├── migrations/                # D1 数据库迁移
└── wrangler.toml             # Cloudflare 配置
```

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ for kids learning time management
