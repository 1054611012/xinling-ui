# 项目长期记忆（XinLing / xinling-ui）

## 仓库结构
- 后端多模块 Maven 工程：`/Volumes/Suxia/IdeaProjects/XinLing`（parent pom + xinling-admin/framework/ai/app/common/system/quartz/psyc*）。
- 前端：`/Volumes/Suxia/IdeaProjects/xinling-ui`（Vue3 + Element Plus，Ruoyi 风格）。
- 心晴（XinLing）App 为心理类应用，文档/代码里 "psyc" 常作为 "psychology/心理" 子串出现，grep 时需用精确模式（xinling-psyc / com.xinling.psyc / src/api/psyc / perms 'psyc:'）区分模块引用与领域词。

## 已知坑：XinLing 仓库 git 锁死
- 现象：`.git` 下 index.lock / HEAD.lock / ORIG_HEAD.lock / packed-refs.lock / refs/heads/*.lock / AUTO_MERGE.lock 反复出现，commit/reset 报 File exists / Operation not permitted。
- 根因：疑似 IDE/后台 git 监控周期性建锁；叠加仓库内本就存在未提交 WIP，首次提交易误把无关改动一并提交。
- 稳健做法（已验证可用）：
  1) 清锁必须用**显式 `rm -f`**：`rm -f .git/index.lock .git/HEAD.lock .git/ORIG_HEAD.lock .git/AUTO_MERGE.lock .git/packed-refs.lock .git/refs/heads/main.lock`。注意：`find .git -name '*.lock' -delete` 在本机沙箱下**不生效**（不报错也不删），会导致重试循环全失败。
  2) 提交前先确认 `git diff --cached` 为空（避免把预暂存的无关 WIP 顺带提交，此坑已踩过一次）。
  3) 只 `git add -u -- <明确路径>`，绝不 `git add -A` / `git add .`。
  4) 提交后用 `git grep -E "..." HEAD --` 精确校验零真实残留。
- 提交原则：仅本地提交，不推送（用户未要求 push）。

## 模块移除标准流程（psyc / education 已验证）
1. 先摸清集成点：根 pom `<module>`、各模块 pom 依赖、admin 控制器、SQL（CREATE TABLE / sys_menu / sys_dict / gen_table）、前端（api/views/components/图标）。
2. 删除模块目录 + 集成点文件 + 前端对应目录；`rm -rf` 仅用于明确的项目路径。
3. 有 SQL 表则产出 `drop_*_tables.sql`（SET FOREIGN_KEY_CHECKS=0 包裹）与 `clean_*_sysdata.sql`（清理 sys_menu/sys_dict）。
4. 保留通用资源（如图标库里同名图标、IconSelect 图标名）。
5. 分仓库提交，仅 stage 该模块路径，绝不带上无关 WIP。

## 偏好（来自 USER.md）
- 沟通：中文、指令式、先对齐方向再动手。
- 反馈期望：结构化（问题位置拆解 + 修改前后对比）。
