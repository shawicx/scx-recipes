# Smart Diet Assistant 开发者 Wiki

> 语言约定：本文档默认使用中文，并在必要处保留英文专业名称（如 React、Tauri、SQLite、DTO 等）。所有内容均基于当前仓库代码与配置文件编写；无法从代码中推断的信息以【信息不足，无法生成】标注。

## 1. 项目概览

- 项目名称：Smart Diet Assistant（智能饮食助手）
- 用途：提供完全离线（Offline-First）的个性化健康饮食推荐、饮食历史记录与本地数据管理能力。
- 目标用户：注重隐私、希望在本地设备上管理饮食与健康资料的桌面端用户（Windows / macOS / Linux）。
- 运行形态：使用 Tauri（Rust 后端 + React 前端）构建的跨平台桌面应用。

### 1.1 整体架构

```mermaid
flowchart LR
  subgraph UI[React + TypeScript 前端]
    A[组件层 components/*]
    B[状态与上下文 lib/*]
    C[API 封装 lib/api.ts]
  end

  subgraph Tauri[Tauri 应用壳]
    T[Tauri Command Bridge invoke()]
  end

  subgraph Core[Rust 核心模块]
    D[commands.rs<br/>Tauri Commands]
    E[storage/*<br/>SQLite 数据访问]
    F[recommendation/*<br/>推荐引擎与规则]
    G[config/mod.rs<br/>平台路径与配置]
    H[utils/*<br/>工具方法 & 性能计时]
  end

  A --> C --> T --> D
  D <---> E
  D <---> F
  D --> G
  D --> H
  E <--> SQLite[(SQLite 本地数据库)]
  H --> sample_recipes.json
```

说明：
- 前端通过 `@tauri-apps/api` 的 `invoke()` 调用 Rust 侧 `#[tauri::command]` 暴露的指令（API）。
- 推荐逻辑在本地完成（rules + engine），数据持久化到本地 SQLite。
- 完全离线运行，无网络依赖（README 与代码均未出现远程 API 调用）。

## 2. 技术栈

- 前端（Frontend）：
  - 语言：TypeScript
  - 框架：React 18
  - UI：HeroUI（tailwindcss 插件 heroui）+ Tailwind CSS 4
  - 构建工具：Vite 5
- 后端（Backend）：
  - 语言：Rust 2021
  - 运行时/容器：Tauri 2
  - 依赖：rusqlite（bundled SQLite）、serde、chrono、uuid、tokio（特性开启 full）
- 数据库（Database）：SQLite（本地文件，路径由 `config/mod.rs` 计算）
- 测试：
  - Rust：`src-tauri/src/**/_test.rs` 单元测试
  - React：`src/components/common/Alert.test.tsx` 等（目录存在；具体测试覆盖需逐步完善）
- 部署/打包：由 Tauri 进行多平台打包（参见 `src-tauri/tauri.conf.json`）

## 3. 目录结构说明

- `src/`
  - `main.tsx`：React 入口
  - `App.tsx`：应用主壳，包含导航与各页签（Dashboard/Profile/Recommendations/History）
  - `components/`：前端组件
    - `ProfileSetup/`：健康档案设置 UI
    - `Recommendations/`：推荐列表与卡片 UI
    - `History/`：饮食历史列表与表单 UI
    - `common/`：通用组件（导航、主题切换、Alert、Loading 等）
  - `lib/`
    - `api.ts`：封装对 Tauri Commands 的前端调用
    - `types.ts`：与后端 DTO 对齐的 TypeScript 类型
    - `ErrorContext.tsx`、`ThemeContext.tsx`：上下文
  - `styles/`：全局样式（Tailwind）
- `src-tauri/`
  - `src/main.rs`：Tauri 入口（委托到 `lib.rs::run()`）
  - `src/lib.rs`：注册所有 Commands、初始化数据库、装配插件
  - `src/commands.rs`：Tauri Commands（后端 API）实现与 DTO
  - `src/storage/`
    - `models.rs`：领域模型与校验（HealthProfile、DietRecommendation、DietHistory、Recipe 等）
    - `database.rs`：SQLite 表结构初始化与 CRUD 查询
  - `src/recommendation/`
    - `engine.rs`：推荐引擎（载入食谱、过滤、打分、组装推荐项）
    - `rules.rs`：可解释的规则打分逻辑
  - `src/config/mod.rs`：应用配置与平台路径
  - `src/utils/mod.rs`：工具函数（例如 `load_sample_recipes()`）
  - `src/utils/performance.rs`：性能计时工具
  - `sample_recipes.json`：示例食谱数据（本地加载）
  - `tauri.conf.json`：Tauri 打包/运行配置
- `specs/001-offline-health-diet-app/`：功能规约与实施计划（文档）
- `tests/`：E2E/UI/Rust 测试目录（结构存在，部分占位）

模块关系：前端 -> `lib/api.ts` -> Tauri invoke -> `commands.rs` -> `storage`/`recommendation`/`utils`。

## 4. 核心功能与业务流程（3–5 项）

1) 健康档案管理（Health Profile）
- 关键流程：
  - 前端在 Profile 页面收集信息 -> `saveHealthProfile()` -> `commands::save_health_profile` -> `Database::save_health_profile`
  - 读取：`getHealthProfile()` -> `commands::get_health_profile` -> `Database::get_health_profile`
  - 删除：`deleteHealthProfile()` -> `commands::delete_health_profile` -> `Database::delete_health_profile`
- 关键文件：
  - 前端：`src/components/ProfileSetup/*`、`src/lib/api.ts`
  - 后端：`src-tauri/src/commands.rs`、`src-tauri/src/storage/{models.rs,database.rs}`
- 重要校验：`HealthProfile::validate()`（年龄 18–120、身高/体重为正、偏好与限制/过敏不冲突）

2) 个性化饮食推荐（Recommendations）
- 关键流程：
  - 前端：`getRecommendations(userId)` -> `commands::get_recommendations`
  - 后端：读取用户档案 -> `utils::load_sample_recipes()` 加载示例食谱 -> `recommendation::engine` 过滤与打分 -> 返回 `RecommendationItemDto[]`
  - 排序：按 `relevance_score` 倒序
- 关键文件：
  - 前端：`src/components/Recommendations/*`、`src/lib/api.ts`
  - 后端：`src-tauri/src/recommendation/{engine.rs,rules.rs}`、`src-tauri/src/commands.rs`
- 重要逻辑：
  - 过滤：避免包含 `dietary_restrictions` 与 `allergies` 的食材
  - 打分：`RecommendationRules::apply_rules()`（根据目标/偏好/营养数据打分）

3) 饮食历史记录（Diet History）
- 关键流程：
  - 记录：`logDietEntry()` -> `commands::log_diet_entry` -> `DietHistory::validate()` -> `Database::log_diet_entry`
  - 查询：`getDietHistory(params)` -> `commands::get_diet_history` -> `Database::get_diet_history`（支持日期范围、餐别、分页）
  - 计数：`getDietHistoryCount(params)` -> `commands::get_diet_history_count`
  - 更新：`updateDietEntry(params)` -> `commands::update_diet_entry`
- 关键文件：`src/components/History/*`、`src/lib/api.ts`、`src-tauri/src/storage/*`、`src-tauri/src/commands.rs`
- 重要校验：评分范围 1–5；日期不可晚于今天

4) 食谱检索（Recipe Search / Detail）
- 关键流程：
  - 详情：`getRecipeById(id)` -> `commands::get_recipe_by_id` -> `Database::get_recipe_by_id`
  - 检索：`searchRecipes(params)` -> `commands::search_recipes` -> `Database::search_recipes`
- 关键文件：`src/lib/api.ts`、`src-tauri/src/storage/database.rs`、`src-tauri/src/commands.rs`
- 说明：当前检索基于 SQLite 文本字段与 LIKE 匹配，对 `tags`/`ingredients` 使用字符串包含的简化逻辑。

5) 配置与平台路径（Config & Paths）
- 关键流程：
  - `getConfig()` -> `commands::get_config` -> `config::get_app_config()`
  - `setConfig()` -> `commands::set_config`（占位实现，未持久化）
- 关键文件：`src-tauri/src/config/mod.rs`、`src-tauri/src/commands.rs`
- 数据位置：
  - macOS：`~/Library/Application Support/SmartDiet/`
  - Windows：`%APPDATA%/SmartDiet/`
  - Linux：`~/.local/share/SmartDiet/`
  - DB 文件：`<上述目录>/data.db`

## 5. API 接口文档（Tauri Commands）

说明：以下均为前端通过 `invoke("command_name", payload)` 调用的本地指令。

- save_health_profile(profile)
  - 方法：invoke（本地）
  - 入参（HealthProfileDto）：`{ id?, user_id, age, gender, weight, height, activity_level, health_goals[], dietary_preferences[], dietary_restrictions[], allergies[], created_at?, updated_at? }`
  - 返回：`string`（HealthProfile UUID）

- get_health_profile(userId)
  - 入参：`{ userId: string }`
  - 返回：`HealthProfileDto | null`

- delete_health_profile(userId)
  - 入参：`{ userId: string }`
  - 返回：`boolean`

- get_recommendations(userId)
  - 入参：`{ userId: string }`
  - 返回：`RecommendationItemDto[]`
  - 错误：若不存在档案，返回错误消息 "Health profile not found for the user"

- get_recommendation_by_id(id)
  - 入参：`{ id: string }`
  - 返回：`RecommendationItemDto | null`

- log_diet_entry(entry)
  - 入参（DietEntryDto）：`{ id?, user_id, diet_item_id(UUID), date_attempted(YYYY-MM-DD), rating?, notes?, was_prepared, meal_type, created_at?, updated_at? }`
  - 返回：`string`（DietHistory UUID）

- get_diet_history(params)
  - 入参：`{ user_id, start_date?, end_date?, limit?, offset?, meal_type? }`
  - 返回：`DietEntryDto[]`

- get_diet_history_count(params)
  - 入参：`{ user_id, start_date?, end_date?, meal_type? }`
  - 返回：`number`

- update_diet_entry(params)
  - 入参：`{ id, rating?, notes?, was_prepared? }`
  - 返回：`boolean`

- get_recipe_by_id(id)
  - 入参：`{ id: string }`
  - 返回：`RecipeDto | null`

- search_recipes(params)
  - 入参：`{ query?, tags?: string[], exclude_ingredients?: string[], max_preparation_time?, difficulty_level?, meal_type?, limit?, offset? }`
  - 返回：`RecipeDto[]`

- get_config()
  - 入参：无
  - 返回：`{ version, storage_path, privacy_mode, theme }`

- set_config(config)
  - 入参：`{ version, storage_path, privacy_mode, theme }`
  - 返回：`boolean`
  - 说明：当前为占位实现，未进行持久化写入

前端类型与字段映射：见 `src/lib/types.ts` 与 `src/lib/api.ts`（下划线 snake_case 与驼峰 camelCase 之间互转）。

## 6. 工具函数或核心类说明

- RecommendationEngine（`src-tauri/src/recommendation/engine.rs`）
  - `new()`/`add_recipe()`/`get_recommendations(profile)`：加载食谱、按限制过滤、使用规则计算相关性、构建 `DietRecommendation` 列表
  - 相关：`RecommendationRules::apply_rules()`（`rules.rs`）

- Database（`src-tauri/src/storage/database.rs`）
  - 负责 SQLite 表创建与 CRUD：`save_health_profile`、`get_health_profile`、`log_diet_entry`、`get_diet_history`、`get_diet_history_count`、`get_recipe_by_id`、`search_recipes` 等

- 校验模型（`src-tauri/src/storage/models.rs`）
  - `HealthProfile::validate()`、`DietHistory::validate()`、`Recipe::validate()` 保证入库数据基本正确

- 工具方法（`src-tauri/src/utils/mod.rs`）
  - `load_sample_recipes()`：尝试多路径读取 `sample_recipes.json` 并反序列化为配方集合
  - `performance::PerformanceTimer`：用于记录 Command 执行耗时

- 前端 API 封装（`src/lib/api.ts`）
  - 统一进行 DTO 映射与错误处理（如 `get_diet_history_count` 的降级策略）

## 7. 本地开发指南

- 先决条件：Rust（建议 1.75+）、Node.js（建议 18+）
- 安装依赖：
  - 前端：`npm install`
  - Tauri CLI（devDependencies 已包含）：`npm run tauri` 将调用 tauri 开发
- 启动开发：
  - 方式 A：`npm run tauri`（Tauri Dev，vite 开在 2025 端口，参见 `vite.config.ts` 与 `tauri.conf.json`）
  - 方式 B：分别运行前端与后端：
    - 前端：`npm run dev`
    - 后端：`cargo tauri dev`（需要全局 tauri-cli 或通过 `npm run tauri`）
- 构建打包：
  - `npm run build`（构建前端）
  - `cargo tauri build`（Tauri 打包）

## 8. 环境与配置

- 环境变量：【信息不足，无法生成】（仓库中未发现 `.env` 或相关读取逻辑）
- 配置与路径：`src-tauri/src/config/mod.rs` 自动计算平台数据目录，数据库文件位于 `get_db_path()`。
- `.env` 示例：【信息不足，无法生成】
- 构建命令：
  - 前端：`npm run build`
  - Tauri：`cargo tauri build`

## 9. 协作建议

- 代码规范：
  - TypeScript：严格模式（`tsconfig.json` 已启用 `strict`, `noUnusedLocals` 等）
  - Rust：建议使用 `cargo fmt` / `cargo clippy`（仓库未强制，良好实践建议）
- 提交规范：【信息不足，无法生成】（仓库中未发现约定式提交或 lint-staged 配置）
- 分支管理：参考 `specs/001-offline-health-diet-app/` 的特性分支命名示例
- 测试建议：
  - Rust：为关键逻辑（rules/engine/database）补充更多单测
  - 前端：补充组件与集成测试（当前仅少量示例）

## 10. 常见问题（FAQ）

- 启动时 Vite 端口被占用（2025）？
  - 关闭占用该端口的进程，或临时修改 `vite.config.ts` 的 `server.port` 与 `src-tauri/tauri.conf.json` 的 `build.devUrl`。
- 无法生成推荐结果并提示未找到健康档案？
  - 需先在“健康档案”页完成并保存档案，后再进入“饮食推荐”。
- 食谱数据从哪里来？
  - 默认从 `src-tauri/sample_recipes.json` 本地读取；若文件缺失会报错（`utils::load_sample_recipes`）。
- 配置的持久化写入？
  - `set_config` 当前为占位实现，未做真正持久化；如需落盘可扩展 `config/mod.rs` 读写 JSON 文件。

---

最后更新：以 Git 提交为准
