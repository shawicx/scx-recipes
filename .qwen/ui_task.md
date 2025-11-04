# Smart Diet Assistant UI 改造任务清单

> 基于 HeroUI 组件库的现代化界面设计方案，完全重构当前 UI，提供更优雅、直观的用户体验。

## 📋 总体设计原则

- **现代化设计**：采用卡片式布局、微交互、渐变色彩
- **响应式优先**：移动端和桌面端体验一致
- **数据可视化**：使用图表展示健康数据和营养信息
- **操作反馈**：每个操作都有明确的视觉反馈
- **无障碍设计**：支持键盘导航和屏幕阅读器

---

## 🎨 全局布局改造

### [x] 1. 应用主框架 (App.tsx)
- [x] 使用 `NextUIProvider` 包装整个应用
- [x] 实现 `Navbar` 替代当前的 Navigation 组件
  - [x] 左侧：应用 Logo + 标题
  - [x] 中间：搜索栏 (`Input` with search icon)
  - [x] 右侧：用户头像 (`Avatar`) + 通知图标 + 主题切换 (`Switch`)
- [x] 主内容区域使用 `Container` + `Spacer` 进行布局
- [x] 添加 `Breadcrumbs` 面包屑导航
- [ ] 实现页面切换动画效果

### [ ] 2. 侧边栏导航重构 (Navigation.tsx)
- [ ] 桌面端：使用 `Card` + `Listbox` 创建固定侧边栏
  - [ ] 顶部：用户信息卡片 (`Card` + `Avatar` + `Chip` 状态标签)
  - [ ] 中间：导航菜单 (`Listbox` with icons)
  - [ ] 底部：应用版本信息 + 帮助链接
- [ ] 移动端：使用 `Modal` + `ModalContent` 创建全屏导航
- [ ] 每个导航项添加未读数量 `Badge`
- [ ] 导航项支持 hover 效果和选中状态动画

---

## 📊 Dashboard 页面改造

### [ ] 3. 健康概览仪表板 (Dashboard.tsx)
- [ ] **顶部统计卡片区域**
  - [ ] 使用 4 个 `Card` 展示关键指标
    - [ ] 今日卡路里摄入 (`Progress` 环形进度条)
    - [ ] 营养均衡度 (`Progress` 多彩进度条)
    - [ ] 连续打卡天数 (`Chip` + 火焰图标)
    - [ ] 健康评分 (`CircularProgress` + 动态颜色)
  - [ ] 每个卡片添加 `Tooltip` 说明

- [ ] **中间内容网格区域**
  - [ ] 左栏 (2/3 宽度)：
    - [ ] 今日饮食计划 (`Card` + `Timeline` 组件)
    - [ ] 营养摄入图表 (`Card` + 自定义图表或 `Progress` 组合)
  - [ ] 右栏 (1/3 宽度)：
    - [ ] 快速推荐 (`Card` + `Image` + `Button`)
    - [ ] 健康小贴士 (`Card` + `Accordion`)

- [ ] **底部操作区域**
  - [ ] 快速记录按钮 (`ButtonGroup` + 常用餐食)
  - [ ] 扫一扫功能 (`Button` with camera icon)

---

## 👤 健康档案页面改造

### [x] 4. 档案设置表单 (ProfileForm.tsx)
- [x] **分步骤表单设计** (采用卡片式布局替代Tabs，更符合现代设计)
  - [x] 使用 `Card` 将表单分为 3 个区域
    - [x] 档案简介区、基本信息与偏好、操作区
  - [x] 每个区域使用不同的图标和颜色主题

- [x] **表单组件优化**
  - [x] 年龄：`Input` with validation and description
  - [x] 性别选择：`Select` with clean options
  - [x] 身高体重：`Input` with unit suffix and BMI calculation
  - [x] 活动等级：`Select` with descriptive options
  - [x] 健康目标：`Textarea` with guidance
  - [x] 饮食偏好：`Textarea` with examples
  - [x] 过敏源：`Textarea` with detailed descriptions

- [x] **表单验证和反馈**
  - [x] 实时验证使用 `Input` 的 `description` 属性
  - [x] BMI 计算结果用 `Chip` + `Tooltip` 展示
  - [x] 编辑模式切换反馈

- [x] **档案完整度显示**
  - [x] 顶部添加 `Progress` 显示档案完整度
  - [x] BMI状态用 `Chip` 标记
  - [x] 完整度低于50%用 `Alert` 提示

---

## 🍽️ 饮食推荐页面改造

### [ ] 5. 推荐列表重构 (RecommendationList.tsx)
- [ ] **筛选和搜索区域**
  - [ ] 顶部搜索栏：`Input` with search icon
  - [ ] 筛选器：`Select` (餐次) + `Slider` (卡路里范围) + `CheckboxGroup` (标签)
  - [ ] 排序选项：`Select` (相关性、营养价值、制作难度)

- [ ] **推荐卡片网格**
  - [ ] 使用 `Card` + `Image` + `CardBody` + `CardFooter`
  - [ ] 卡片悬停效果：阴影变化 + 轻微缩放
  - [ ] 营养信息：`Progress` 小进度条 (蛋白质、碳水、脂肪)
  - [ ] 标签：`Chip` 多彩标签 (素食、低卡、快手菜等)
  - [ ] 操作按钮：`ButtonGroup` (查看详情、添加到计划、不感兴趣)

### [ ] 6. 推荐详情页面 (RecommendationCard.tsx)
- [ ] **Modal 弹窗设计**
  - [ ] 使用 `Modal` + `ModalContent` + `ModalHeader` + `ModalBody` + `ModalFooter`
  - [ ] 顶部大图：`Image` with loading skeleton
  - [ ] 制作难度：`Chip` with color coding
  - [ ] 制作时间：`Chip` with clock icon

- [ ] **营养信息面板**
  - [ ] 使用 `Accordion` 可折叠设计
  - [ ] 营养成分：`Progress` 横向进度条
  - [ ] 推荐理由：`Card` with explanation text

- [ ] **制作步骤**
  - [ ] 使用 `Accordion` + `Timeline` 组合
  - [ ] 每个步骤可以标记完成 (`Checkbox`)

---

## 📋 饮食记录页面改造

### [ ] 7. 历史记录列表 (HistoryList.tsx)
- [ ] **日期导航区域**
  - [ ] 使用 `DatePicker` 选择日期范围
  - [ ] 快速筛选：`ButtonGroup` (今天、本周、本月)
  - [ ] 餐次筛选：`Select` multiple selection

- [ ] **记录卡片设计**
  - [ ] 每日记录用 `Card` 包装
  - [ ] 餐次时间线：`Timeline` vertical layout
  - [ ] 食物项目：`Card` 嵌套 + `Image` + 评分 `Rating`
  - [ ] 营养总结：`Progress` 圆形图表

### [ ] 8. 添加记录表单 (HistoryEntryForm.tsx)
- [ ] **快速记录模式**
  - [ ] 使用 `Modal` 弹窗
  - [ ] 餐次选择：`Tabs` 切换
  - [ ] 食物搜索：`Autocomplete` with recent items
  - [ ] 份量选择：`Slider` + 可视化图标

- [ ] **详细记录模式**
  - [ ] 分步表单：`Tabs` (基本信息、营养详情、个人感受)
  - [ ] 照片上传：`Button` + drag & drop area
  - [ ] 心情评价：`RadioGroup` with emoji
  - [ ] 笔记记录：`Textarea` with character count

---

## 🎛️ 通用组件改造

### [ ] 9. 加载和状态组件
- [ ] **加载状态**
  - [ ] 列表加载：`Skeleton` 组件
  - [ ] 按钮加载：`Button` with `isLoading` prop
  - [ ] 页面加载：`Spinner` with custom animation

- [ ] **空状态设计**
  - [ ] 使用 `Card` + illustration + `Button`
  - [ ] 不同页面的空状态使用不同插图和文案

- [ ] **错误状态**
  - [ ] `Alert` 组件统一错误提示
  - [ ] 网络错误：`Modal` with retry button
  - [ ] 表单验证错误：`Input` errorMessage

### [ ] 10. 主题和样式系统
- [ ] **深色模式支持**
  - [ ] 使用 `NextUIProvider` 的 theme 切换
  - [ ] 主题切换按钮：`Switch` with sun/moon icons
  - [ ] 确保所有组件在深色模式下正常显示

- [ ] **品牌色彩方案**
  - [ ] 主色：绿色系 (健康、自然)
  - [ ] 辅助色：橙色系 (食物、温暖)
  - [ ] 中性色：灰色系 (文本、背景)

---

## 🔧 交互和动画增强

### [ ] 11. 微交互设计
- [ ] **页面转场动画**
  - [ ] 使用 CSS transitions 或 Framer Motion
  - [ ] 页面切换：淡入淡出效果
  - [ ] 卡片悬停：轻微缩放和阴影变化

- [ ] **反馈动画**
  - [ ] 按钮点击：波纹效果
  - [ ] 表单提交成功：checkmark 动画
  - [ ] 数据更新：进度条动画

### [ ] 12. 响应式优化
- [ ] **移动端适配**
  - [ ] 所有组件确保在小屏幕下可用
  - [ ] 触摸友好的按钮大小 (44px+)
  - [ ] 合理的滚动区域设计

- [ ] **平板适配**
  - [ ] 中等屏幕下的布局调整
  - [ ] 侧边栏自动收缩/展开

---

## 📱 移动端专项优化

### [ ] 13. 底部导航 (移动端)
- [ ] 使用 `Tabs` 创建底部固定导航
- [ ] 添加 `Badge` 显示未读数量
- [ ] 图标动画：选中时有弹跳效果

### [ ] 14. 手势支持
- [ ] 卡片滑动删除/标记
- [ ] 下拉刷新列表数据
- [ ] 长按显示快捷菜单

---

## 🧪 测试和验证

### [ ] 15. 组件测试
- [ ] 每个重构的组件添加基础测试
- [ ] 交互测试 (点击、输入、表单提交)
- [ ] 响应式测试 (不同屏幕尺寸)

### [ ] 16. 无障碍测试
- [ ] 键盘导航测试
- [ ] 屏幕阅读器兼容性
- [ ] 颜色对比度检查

---

## 📊 性能优化

### [ ] 17. 组件懒加载
- [ ] 大组件使用 `React.lazy()`
- [ ] 图片懒加载优化
- [ ] 路由级别的代码分割

### [ ] 18. 动画性能
- [ ] 使用 CSS transforms 而非改变布局属性
- [ ] 适当使用 `will-change` 优化
- [ ] 减少不必要的重渲染

---

## 🎯 完成标准

每个任务完成后需要确保：
- ✅ 视觉效果符合设计规范
- ✅ 交互逻辑正确无误
- ✅ 响应式布局正常
- ✅ 性能表现良好
- ✅ 无障碍特性完整
- ✅ 深色模式支持

---

**预估时间：** 2-3 周
**优先级顺序：** 全局布局 → Dashboard → 健康档案 → 推荐页面 → 历史记录 → 通用组件 → 移动端优化
