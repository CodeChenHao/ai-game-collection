# AI Game Collection 🎮

一个精美的网页游戏合集，包含10个经典小游戏和完整的用户认证系统。

## 项目简介

这是一个基于HTML/CSS/JavaScript开发的网页游戏合集，采用现代化的设计风格，提供流畅的用户体验。项目包含完整的登录注册系统和多个经典游戏，适合休闲娱乐和学习参考。

## 功能特性

### 核心功能
- ✅ 完整的用户认证系统（登录、注册、忘记密码）
- ✅ 图形验证码功能
- ✅ 本地存储用户数据和游戏记录
- ✅ 响应式设计，支持移动端
- ✅ 现代化UI设计
- ✅ 游戏排行榜和最高分记录

### 技术特点
- 纯前端实现，无需后端服务器
- 使用localStorage进行数据持久化
- Canvas绘图和DOM操作结合
- 流畅的动画效果
- 优雅的错误处理

## 游戏列表

### 1. 贪吃蛇 🐍
- 经典的贪吃蛇游戏
- 方向键控制移动
- 吃到食物变长得分
- 撞墙或撞到自己游戏结束

### 2. 飞机大战 ✈️
- 刺激的射击游戏
- 发射子弹消灭敌机
- 敌机随机出现
- 得分和生命值系统

### 3. 五子棋 ⚫
- 经典五子棋游戏
- 双人对战模式
- 横竖斜连成五子获胜
- 悔棋功能

### 4. 2048 🎮
- 经典数字合并游戏
- 滑动合并相同数字
- 目标达到2048
- 多种难度选择

### 5. 俄罗斯方块 🧱
- 经典俄罗斯方块
- 消除行得分
- 等级递增
- 下一个方块预览

### 6. 扫雷 💣
- 经典扫雷游戏
- 多种难度选择
- 左键翻开，右键标记
- 计时和雷数显示

### 7. 蜘蛛纸牌 🕷️
- 经典蜘蛛纸牌
- 三种难度（单花色、双花色、四花色）
- 104张牌系统
- 撤销和提示功能

### 8. 羊了个羊 🐑
- 消除类游戏
- 三个相同图案自动消除
- 7个槽位限制
- 水果图案设计

### 9. 跳一跳 🦘
- 蓄力跳跃游戏
- 按住蓄力，松开跳跃
- 落在方块上得分
- 中心落点得2分

### 10. 推箱子 📦
- 经典推箱子
- 5个精心设计的关卡
- 撤销功能
- 最佳步数记录

## 技术栈

- **前端框架**: 纯HTML/CSS/JavaScript
- **样式**: CSS3动画、Flexbox、Grid布局
- **绘图**: HTML5 Canvas
- **存储**: localStorage
- **设计**: 响应式设计、现代化UI

## 项目结构

```
demo01/
├── login/              # 登录系统
│   ├── login.html
│   ├── login.js
│   └── style.css
├── register/           # 注册系统
│   ├── register.html
│   ├── register.js
│   └── style.css
├── forgot-password/    # 忘记密码
│   ├── forgot-password.html
│   ├── forgot-password.js
│   └── style.css
├── home/              # 首页
│   ├── home.html
│   ├── home.js
│   └── style.css
├── game/              # 游戏目录
│   ├── snake/          # 贪吃蛇
│   ├── aircraft/        # 飞机大战
│   ├── gomoku/         # 五子棋
│   ├── 2048/           # 2048
│   ├── tetris/         # 俄罗斯方块
│   ├── minesweeper/    # 扫雷
│   ├── spider/         # 蜘蛛纸牌
│   ├── sheep/          # 羊了个羊
│   ├── jump/           # 跳一跳
│   └── sokoban/        # 推箱子
└── README.md
```

## 快速开始

### 在线预览
1. 克隆项目到本地
```bash
git clone https://github.com/CodeChenHao/ai-game-collection.git
cd ai-game-collection
```

2. 启动本地服务器
```bash
# 使用Python
python -m http.server 8080

# 或使用Node.js
npx http-server -p 8080
```

3. 在浏览器中访问
```
http://localhost:8080/home/home.html
```

### 直接打开
也可以直接在浏览器中打开 `home/home.html` 文件开始游戏。

## 使用说明

### 用户认证
1. 首次使用需要注册账号
2. 输入邮箱和密码
3. 完成图形验证码
4. 同意用户协议
5. 登录后进入游戏首页

### 游戏操作
每个游戏都有详细的游戏说明，包括：
- 操作方式（键盘/鼠标/触摸）
- 游戏规则
- 得分机制
- 功能按钮说明

## 开发计划

- [ ] 添加更多游戏
- [ ] 实现多人在线对战
- [ ] 添加音效和背景音乐
- [ ] 优化移动端体验
- [ ] 添加成就系统
- [ ] 实现排行榜功能

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用MIT许可证。

## 作者

CodeChenHao

## 致谢

感谢所有为这个项目做出贡献的开发者！

---

**🎮 玩得开心！**
