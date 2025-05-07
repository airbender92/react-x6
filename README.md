# 项目开发与投产流程说明

## 一、项目概述
本项目采用多分支开发模式，以确保开发过程的高效性和代码的稳定性。不同的分支承担不同的职责，通过合理的分支管理和版本控制，实现新特性的开发、Bug 修复以及代码的投产。

## 二、分支说明

### 1. `feature/xxx` 分支
- **用途**：用于开发新特性。`xxx` 为具体特性的名称，例如 `feature/user-login` 表示用户登录功能的开发分支。
- **操作流程**：当需要开发新特性时，从 `develop` 分支创建新的 `feature/xxx` 分支进行开发。开发完成后，将该分支合并到 `develop` 分支。

### 2. `develop` 分支
- **用途**：作为每次构建的主要分支，集成了所有已完成的新特性和 Bug 修复。所有其他分支（如 `feature/xxx` 分支、`bugfix/xxx` 分支）的代码最终都要合并到该分支。
- **操作流程**：每次投产完成后，需要给 `develop` 分支打一个 `tag`，用于标记该版本的投产。在投产完成之前，不允许将新的代码合并到 `develop` 分支，也不允许将本地新的代码提交到 `develop` 分支。

### 3. `bugfix/xxx` 分支（可选）
- **用途**：用于修复紧急 Bug。`xxx` 为具体 Bug 的编号或名称，例如 `bugfix/123` 表示修复编号为 123 的 Bug。
- **操作流程**：当发现紧急 Bug 时，从 `develop` 分支创建新的 `bugfix/xxx` 分支进行修复。修复完成后，将该分支合并到 `develop` 分支。

## 三、开发流程

### 1. 新特性开发
1. 从 `develop` 分支创建新的 `feature/xxx` 分支：
```bash
git checkout -b feature/xxx develop
```
2. 在 `feature/xxx` 分支上进行新特性的开发和测试。
3. 开发完成后，将 `feature/xxx` 分支合并到 `develop` 分支：
```bash
git checkout develop
git merge feature/xxx
```
4. 删除 `feature/xxx` 分支：
```bash
git branch -d feature/xxx
```

### 2. Bug 修复
1. 从 `develop` 分支创建新的 `bugfix/xxx` 分支：
```bash
git checkout -b bugfix/xxx develop
```
2. 在 `bugfix/xxx` 分支上进行 Bug 修复和测试。
3. 修复完成后，将 `bugfix/xxx` 分支合并到 `develop` 分支：
```bash
git checkout develop
git merge bugfix/xxx
```
4. 删除 `bugfix/xxx` 分支：
```bash
git branch -d bugfix/xxx
```

## 四、投产流程

### 1. 投产前准备
- 确保 `develop` 分支上的代码经过充分的测试，所有新特性和 Bug 修复都已合并到该分支。
- 禁止在投产期间将新的代码合并到 `develop` 分支，也禁止将本地新的代码提交到 `develop` 分支。

### 2. 投产
- 使用 `develop` 分支的代码进行投产。

### 3. 投产后操作
- 给 `develop` 分支打一个 `tag`，用于标记该版本的投产。`tag` 的命名建议采用语义化版本号，例如 `v1.0.0`：
```bash
git tag v1.0.0 develop
git push origin v1.0.0
```
- 允许将新的代码合并到 `develop` 分支，也允许将本地新的代码提交到 `develop` 分支。

## 五、注意事项
- 在进行分支合并时，要确保代码的兼容性和稳定性，避免引入新的 Bug。
- 每次打 `tag` 时，要确保 `tag` 的命名规范和清晰，方便后续的版本管理和追溯。
- 在投产期间，要严格遵守代码提交和合并的规则，避免影响投产进度和稳定性。