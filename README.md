<div align="center">

# 📚 延世韩语学习 (Yonsei Korean Learning)

**基于延世大学韩国语教材的智能韩语学习应用**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 🌟 项目概述

**延世韩语学习** 是一款面向中国韩语学习者的全栈 Web 应用，围绕延世大学韩国语教材体系构建。应用集成了词典查阅、单词背诵、闪卡复习、语法学习、课文阅读、课程音频等核心学习模块，并引入了 **SRS（间隔重复系统）** 算法，帮助用户科学高效地记忆韩语词汇。

应用支持 **PWA（渐进式 Web 应用）** 模式，用户可将其添加至手机主屏幕，获得类似原生 App 的体验。同时针对 **微信内置浏览器** 和 **Android WebView** 做了专项兼容优化，确保在国内主流移动环境下的稳定运行。

---

## ✨ 核心功能

### 📖 课程体系
- 基于延世大学韩国语教材的完整课程结构
- 课程分级管理（初级 / 中级 / 高级）
- 章节化学习路径，支持进度跟踪

### 📝 词典系统
- 韩中双语词典，支持关键词搜索
- 词条包含：韩语、罗马音、词性、释义、例句及例句翻译
- 支持收藏 / 取消收藏词条（星标功能）
- 支持用户自定义添加、编辑、删除词条

### 🃏 闪卡复习 (Flashcard)
- 正面韩语 + 背面释义的经典闪卡模式
- 支持语法卡片和词汇卡片
- 翻转动画交互，逐张练习

### 🧠 SRS 间隔重复系统
- 基于 **SM-2 算法** 的智能复习调度
- 根据用户评分（0-3 级）动态调整复习间隔与难度因子
- 每日学习集（Daily Study Set）自动推送待复习词汇
- 逻辑日期以凌晨 4 点为分界，符合实际学习习惯

### ✍️ 单词背诵 (Recite)
- 列表化单词背诵视图
- 支持遮挡模式：隐藏韩语或中文释义，点击揭示
- 分页加载，支持海量词汇浏览
- 每个单词可记录复习次数

### 📗 语法学习
- 覆盖初级到高级的 50+ 韩语语法点
- 每条语法包含：语法标题、中文说明、韩语例句、中文翻译
- 首页每日随机推荐语法点

### 🎧 课程音频
- 课文配套音频播放器
- 支持音频进度条拖拽、播放 / 暂停控制

### 📄 课文阅读
- 韩语课文阅读视图
- 支持文本展示和学习辅助

### 🔊 韩语语音 (TTS)
- 双重 TTS 策略：优先使用浏览器本地语音合成，自动降级为有道在线 TTS
- 针对 iOS / Android / 微信环境精细适配
- 中国大陆网络环境友好（使用有道词典 API 作为在线回退）

### 📤 资源上传
- 支持音频 / 文本文件上传至 Supabase Storage
- 文件列表管理，支持在线预览和播放
- 音频播放器含进度条、时间显示等完整控制
- 文件名采用 Base64 编码处理中文兼容性

### 👤 用户系统
- Supabase Auth 用户认证
- 个人资料页面（等级、连续打卡天数、学习时长、金币等）
- 15 天未活跃自动登出机制

---

## 🏗️ 技术架构

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19 | UI 框架 |
| **TypeScript** | 5.8 | 类型安全 |
| **Vite** | 6 | 构建工具 & 开发服务器 |
| **TailwindCSS** | 4 | 原子化 CSS 样式 |
| **React Router** | 7 | 客户端路由（Hash 模式）|
| **Recharts** | 3 | 数据可视化（学习统计图表）|
| **Lucide React** | 0.562 | 图标库 |
| **vite-plugin-pwa** | 1.2 | PWA 支持 |
| **vconsole** | 3.15 | 移动端调试工具 |

### 后端
| 技术 | 用途 |
|------|------|
| **Supabase** | BaaS 后端服务（数据库 + 认证 + 存储）|
| **PostgreSQL** | 关系型数据库（由 Supabase 托管）|
| **Row Level Security** | 行级安全策略，数据权限控制 |
| **Gemini API** | AI 能力集成（可选）|

---

## 📁 项目结构

```
korean-learning/
├── App.tsx                     # 应用入口 & 路由配置
├── index.tsx                   # React 渲染入口
├── index.html                  # HTML 模板（含 PWA meta 标签）
├── index.css                   # 全局样式
├── vite.config.ts              # Vite 构建配置 & PWA 配置
├── tailwind.config.js          # TailwindCSS 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 依赖管理
├── metadata.json               # 应用元信息
│
├── components/                 # 页面组件
│   ├── HomeView.tsx            # 首页仪表盘（课程概览 / 统计 / 每日语法）
│   ├── AuthView.tsx            # 用户登录 / 注册
│   ├── DictionaryView.tsx      # 词典查阅 & 词条管理
│   ├── FlashcardView.tsx       # 闪卡复习
│   ├── ReciteView.tsx          # 单词背诵（遮挡模式）
│   ├── DailyStudyView.tsx      # 每日学习（SRS 复习）
│   ├── GrammarView.tsx         # 语法学习
│   ├── LessonAudioView.tsx     # 课程音频播放
│   ├── TextReadingView.tsx     # 课文阅读
│   ├── FavoritesView.tsx       # 收藏词汇列表
│   ├── ResourceUploadView.tsx  # 资源文件上传 & 管理
│   ├── ProfileView.tsx         # 个人资料页
│   └── BottomNav.tsx           # 底部导航栏
│
├── services/
│   └── api.ts                  # API 服务层（Supabase CRUD 操作 & SRS 算法）
│
├── lib/
│   ├── supabaseClient.ts       # Supabase 客户端初始化
│   └── tts.ts                  # 韩语 TTS 语音工具（双策略适配）
│
├── backend/                    # 数据库脚本
│   ├── schema.sql              # 核心表结构（用户 / 课程 / 词典 / 闪卡等）
│   ├── grammar_schema.sql      # 语法点表 & 50 条语法数据
│   ├── srs_schema.sql          # SRS 间隔重复进度表
│   ├── daily_tasks_schema.sql  # 每日任务表
│   ├── seed_data.sql           # 初始种子数据
│   └── yonsei_vocab_seed.sql   # 延世教材第三册词汇数据
│
├── public/                     # 静态资源
│   ├── favicon.png             # 网站图标
│   ├── apple-touch-icon.png    # iOS 主屏幕图标
│   ├── pwa-192x192.png         # PWA 图标 (192x192)
│   ├── pwa-512x512.png         # PWA 图标 (512x512)
│   └── vocab-audio/            # 词汇音频文件
│
└── dist/                       # 构建产物
```

---

## 🗄️ 数据库设计

应用使用 Supabase（PostgreSQL）作为后端数据库，主要数据表包括：

| 表名 | 说明 |
|------|------|
| `profiles` | 用户资料（等级、打卡、学习时长、金币等）|
| `courses` | 课程信息（标题、级别、封面、章节数）|
| `chapters` | 章节信息（隶属课程、序号、标题）|
| `user_courses` | 用户课程进度（进度百分比、状态）|
| `dictionary_entries` | 词典词条（韩语、释义、罗马音、词性、例句）|
| `user_favorites` | 用户收藏的词条 |
| `flashcards` | 闪卡数据（正面韩语、背面释义、语法标记）|
| `grammar_points` | 语法知识点（标题、说明、例句、级别）|
| `user_word_progress` | SRS 学习进度（SM-2 参数、复习计划）|

所有用户相关表均启用了 **行级安全策略 (RLS)**，确保用户仅能访问自己的私有数据；课程、词典、语法等公共内容允许匿名读取。

---

## 🚀 快速开始

### 环境要求
- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
在项目根目录创建 `.env.local` 文件：
```env
VITE_SUPABASE_URL=你的_Supabase_项目_URL
VITE_SUPABASE_ANON_KEY=你的_Supabase_匿名Key
GEMINI_API_KEY=你的_Gemini_API_Key（可选）
```

### 3. 数据库初始化
1. 前往 [Supabase](https://supabase.com) 创建项目
2. 在 **SQL Editor** 中依次执行以下脚本：
   - `backend/schema.sql` — 创建核心表和安全策略
   - `backend/grammar_schema.sql` — 创建语法点表及种子数据
   - `backend/srs_schema.sql` — 创建 SRS 进度表
   - `backend/seed_data.sql` — 导入课程和基础词汇数据
   - `backend/yonsei_vocab_seed.sql` — 导入延世教材第三册词汇

### 4. 启动开发服务器
```bash
npm run dev
```
应用默认运行在 `http://localhost:3000`

### 5. 构建生产版本
```bash
npm run build
```

---

## 📱 PWA 支持

应用已完整配置 PWA 功能：
- ✅ Service Worker 自动注册与更新
- ✅ 离线资源缓存（JS / CSS / HTML / 图片 / 音频）
- ✅ iOS 添加到主屏幕支持
- ✅ Android 安装提示
- ✅ 独立窗口模式（`standalone`）
- ✅ 竖屏锁定（`portrait`）

---

## 🎯 特色亮点

| 亮点 | 说明 |
|------|------|
| 🧪 **SM-2 科学记忆** | 业界成熟的间隔重复算法，自适应调整复习节奏 |
| 🇨🇳 **中国网络友好** | TTS 降级到有道 API，无需翻墙即可使用语音功能 |
| 📲 **微信适配** | 针对微信内置浏览器做了 TTS 和音频播放的专项优化 |
| 🎨 **移动优先设计** | 以手机端为主的 UI 设计，最大宽度 `max-w-md` 居中布局 |
| 🔒 **数据安全** | Supabase RLS 行级安全策略，保障用户数据隔离 |
| ⚡ **极速构建** | Vite 6 驱动，毫秒级 HMR 热更新 |

---

## 📄 开源协议

本项目为私有项目，仅供个人学习使用。

---

<div align="center">
<sub>🇰🇷 한국어를 배워봅시다! 让我们一起学韩语！</sub>
</div>
