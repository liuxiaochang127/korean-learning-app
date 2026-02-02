# React 学习与项目指南 (基于当前项目)

这是一个基于 AI 生成的韩语学习 Web 应用。虽然它是由代码生成的，但其结构遵循了现代 React 开发的最佳实践。本文档将帮助你理解这个项目是如何运作的，即使你对 React 还不太熟悉。

## 1. 技术栈概览

这个项目使用了当前最流行的前端技术栈：

*   **React (v19)**: 用于构建用户界面的核心库。
*   **TypeScript**: JavaScript 的超集，增加了类型检查（如 `string`, `number`），让代码更健壮。
*   **Vite**: 一个极速的构建工具和开发服务器（相比传统的 Webpack 更快）。
*   **Tailwind CSS (v4)**: 一个实用优先的 CSS 框架，通过类名（如 `flex`, `p-4`, `text-red-500`）直接写样式。
*   **React Router (v7)**: 处理页面跳转和路由。
*   **Supabase**: 一个开源的后端服务（类似 Firebase），提供数据库和身份验证。

---

## 2. 项目目录结构

```
e:/svnProject/korean-learning/
├── App.tsx             # [核心] 应用的主入口，定义了路由和全局布局
├── components/         # [核心] 存放所有的页面组件（如 HomeView, AuthView）
├── lib/                # 工具库（如 supabaseClient.ts 连接数据库，tts.ts 语音合成）
├── services/           # API 服务层（处理与后端的具体数据交互）
├── index.css           # 全局样式文件（包含 Tailwind 引入）
├── index.html          # 网页的 HTML 入口
├── package.json        # 项目配置，列出了所有的依赖包
├── tsconfig.json       # TypeScript 配置文件
└── vite.config.ts      # Vite 构建工具配置
```

---

## 3. 核心概念讲解 (结合代码)

React 的核心思想是**组件化**，即把界面拆分成一块块独立的小积木。

### 3.1 组件 (Component)

**定义**：一个组件就是一个返回 JSX（类似 HTML）的函数。

**示例** (`components/HomeView.tsx`):
```tsx
const HomeView: React.FC = () => {
  // ... 逻辑代码 ...
  return (
    <div>
      <h1>欢迎回来</h1>
    </div>
  );
};
export default HomeView;
```

### 3.2 状态 (State / useState)

**概念**：组件内部的“记忆”。当状态改变时，React 会自动重新渲染页面。

**代码解读**:
```tsx
// 语法: const [变量名, 修改变量的方法] = useState(初始值);
const [loadingProfile, setLoadingProfile] = React.useState(true);

// 使用:
if (loadingProfile) {
  return <Skeleton />; // 如果正在加载，显示骨架屏
}
```

### 3.3 副作用 (Effect / useEffect)

**概念**：用于处理组件**渲染之后**要做的事情，比如发网络请求、订阅事件、修改 DOM。

**代码解读** (`HomeView.tsx`):
```tsx
React.useEffect(() => {
  // 这里的代码会在组件第一次加载时执行（因为依赖数组 [] 是空的）
  const initData = async () => {
    // 1. 获取用户信息
    const { data: { user } } = await supabase.auth.getUser();
    // ... 加载更多数据
  };
  
  initData();
}, []); // <--- [] 表示只运行一次
```

### 3.4 属性 (Props)

**概念**：父组件向子组件传递数据的方式。虽然 `HomeView` 主要是页面组件，但你可以看到它调用其他组件时传递了 Props。

**示例**:
```tsx
// Route 组件接收 path 和 element 两个属性
<Route path="/" element={<HomeView />} />
```

---

## 4. 关键代码解析：路由与布局 (`App.tsx`)

`App.tsx` 是整个应用的骨架。

```tsx
const Layout = () => {
  const location = useLocation(); // 获取当前 URL
  
  // 逻辑：只有在特定的页面才显示底部导航栏
  const showBottomNav = ['/', '/dictionary', ...].includes(location.pathname);

  // 逻辑：自动检查用户是否长时间未操作（15天），如果是则自动登出
  React.useEffect(() => { ... }, [location]); 

  return (
    // 这里的 div 设置了类似于手机 App 的最大宽度 (max-w-md) 和阴影
    <div className="relative min-h-screen w-full max-w-md mx-auto ...">
      <main className="...">
        {/* Routes 决定了当前 URL 显示哪个组件 */}
        <Routes>
            <Route path="/" element={<HomeView />} />
            {/* ... 其他路由 ... */}
        </Routes>
      </main>
      
      {/* 条件渲染：只有 showBottomNav 为 true 时才显示底部导航 */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};
```

---

## 5. 如何修改项目 (动手练习)

### 练习 1：修改首页标题
**目标**：把 `HomeView.tsx` 中的 "今日语法" 改成 "每日一句"。

1.  打开 `components/HomeView.tsx`。
2.  搜索文本 "今日语法" (约 185 行)。
3.  将其修改为 "每日一句"。
4.  保存文件，浏览器会自动刷新显示更改。

### 练习 2：修改样式
**目标**：把底部的导航栏隐藏逻辑去掉（让它一直显示，或者只在特定页面不显示）。

1.  打开 `App.tsx`。
2.  找到 `const showBottomNav = ...` (约 22 行)。
3.  如果你想让它在详情页也显示，可以将数组扩大，或者直接改为：
    ```tsx
    // 比如：除了登录页，其他都显示
    const showBottomNav = location.pathname !== '/auth';
    ```

### 练习 3：添加一个新页面
1.  在 `components` 目录下创建一个新文件 `MyPage.tsx`。
    ```tsx
    import React from 'react';
    const MyPage = () => <div className="p-4">这是我的新页面</div>;
    export default MyPage;
    ```
2.  在 `App.tsx` 中引入它：
    ```tsx
    import MyPage from './components/MyPage';
    ```
3.  在 `<Routes>` 里面添加一行：
    ```tsx
    <Route path="/my-page" element={<MyPage />} />
    ```
4.  在浏览器访问 `http://localhost:5173/#/my-page` 查看效果。

---

## 6. 常见问题排查

*   **页面白屏？**
    *   检查控制台 (F12 -> Console) 有无红色报错。
    *   检查 `npm run dev` 的终端窗口是否有报错。
*   **样式乱了？**
    *   检查 Tailwind 类名是否写错。
    *   确保 HTML 结构（如 `flex`, `div` 嵌套）正确。
*   **修改代码没反应？**
    *   确认文件是否保存 (Ctrl+S)。
    *   确认终端里的 `npm run dev` 还在运行。

## 7. 进阶学习资源

*   **React 官方文档 (中文)**: [react.dev](https://zh-hans.react.dev/) (强烈推荐，非常通俗易懂)
*   **Tailwind CSS**: 查阅样式类名非常好用 [tailwindcss.com](https://tailwindcss.com/)
*   **TypeScript**: [TypeScript 入门教程](https://ts.xcatliu.com/)

祝你学习愉快！这个项目结构清晰，非常适合用来练手 React。
