# 🎨 ChatGPT 美化复制助手

一个Chrome浏览器插件，专为优化ChatGPT内容分享而设计。通过多种精美的卡片样式，让你的AI问答内容在社交媒体上更加生动有趣！

## ✨ 主要功能

- 🔍 **智能识别**：自动识别ChatGPT页面中的AI回复内容
- 🎨 **多种样式**：提供6种不同的复制格式，适应不同场景需求
- 🖼️ **图片生成**：一键生成精美图片卡片，支持直接下载分享
- 📱 **社交优化**：特别针对小红书等社交平台优化分享格式
- ⚡ **一键复制**：点击即可复制美化后的内容，无需手动编辑
- 🌙 **主题适配**：支持浅色和深色主题自动适配
- 📱 **响应式设计**：完美适配桌面和移动端界面

## 🎯 支持的卡片样式

### 📱 小红书风格
```
✨ AI智能问答 ✨

[AI回答内容]

—————————————————
💭 来自ChatGPT的回答
⏰ 2024/1/15 14:30:25
🏷️ #AI问答 #ChatGPT #智能助手

✨ 觉得有用请点赞收藏哦 ✨
```

### 🎨 彩色卡片
```
🎨 ============ AI回答 ============ 🎨

[AI回答内容]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 ChatGPT智能回答
📅 生成时间：2024/1/15 14:30:25
💝 分享即是传播知识的力量

🌈 ================================ 🌈
```

### ✨ 极简风格
```
[AI回答内容]

———
📝 AI回答 | 2024/1/15 14:30:25
```

### 💬 引用风格
```
💬 AI智能问答

> [AI回答内容]
> [以引用格式显示]

— ChatGPT · 2024/1/15 14:30:25
```

### 🖼️ 精美图片
一键生成精美的图片卡片，包含：
- 渐变紫蓝色背景设计
- 圆角卡片，现代化风格
- 毛玻璃效果内容区域
- 智能Markdown格式渲染
- 自动添加时间戳和话题标签
- 高分辨率PNG格式，直接下载

### 📋 原始文本
保持原始格式，无额外装饰。

## 📦 安装方法

### 方法一：开发者模式安装（推荐）

1. **下载插件文件**
   ```bash
   git clone https://github.com/your-username/chatgpt-copy-enhancer.git
   # 或直接下载ZIP文件并解压
   ```

2. **打开Chrome扩展程序页面**
   - 在Chrome地址栏输入：`chrome://extensions/`
   - 或者：右上角菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 点击右上角的"开发者模式"开关

4. **加载插件**
   - 点击"加载已解压的扩展程序"
   - 选择下载的插件文件夹
   - 确认安装

### 方法二：Chrome应用商店（待上架）
> 插件正在审核中，很快就能在Chrome应用商店找到！

## 🚀 使用指南

### 基本使用
1. **访问ChatGPT**：打开 [chat.openai.com](https://chat.openai.com) 或 [chatgpt.com](https://chatgpt.com)
2. **发起对话**：向ChatGPT提问并获得回答
3. **找到美化复制按钮**：在AI回复下方会出现紫色的"美化复制"按钮
4. **选择样式**：点击按钮，从下拉菜单中选择喜欢的卡片样式
5. **复制分享**：内容已自动复制到剪贴板，可直接粘贴分享

### 设置默认样式
1. **打开插件设置**：点击浏览器工具栏中的插件图标
2. **选择默认样式**：从5种样式中选择你最常用的一种
3. **保存设置**：点击"保存设置"按钮
4. **即时生效**：设置立即在所有ChatGPT页面生效

### 快捷操作技巧
- **快速复制**：直接点击下拉菜单中的样式选项，无需二次确认
- **批量操作**：可以连续复制多个回答的不同样式
- **移动端适配**：在移动端浏览器上按钮会自动调整大小

## 🔧 技术特性

- **智能检测**：使用MutationObserver实时监听页面变化
- **多元素兼容**：支持不同版本ChatGPT界面的元素选择器
- **格式保持**：智能保留原文的标题、列表、代码块等格式
- **性能优化**：轻量级设计，不影响页面加载速度
- **隐私保护**：所有处理都在本地进行，不上传任何数据

## 🛠️ 开发说明

### 项目结构
```
chatgpt-copy-enhancer/
├── manifest.json          # 插件配置文件
├── content.js             # 内容脚本（主要功能）
├── styles.css             # 样式文件
├── popup.html             # 设置面板HTML
├── popup.js               # 设置面板逻辑
├── icons/                 # 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # 项目说明
```

### 本地开发
1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/chatgpt-copy-enhancer.git
   cd chatgpt-copy-enhancer
   ```

2. **安装到Chrome**
   - 按照上面的安装方法加载到Chrome

3. **修改代码**
   - 修改代码后需要在扩展程序页面点击"重新加载"

4. **调试技巧**
   - 使用`console.log`在浏览器控制台查看日志
   - 在扩展程序页面点击"检查视图"来调试popup页面

## 🤝 贡献指南

欢迎提交问题和功能建议！

### 报告问题
如果遇到问题，请在[Issues](https://github.com/your-username/chatgpt-copy-enhancer/issues)中描述：
- 详细的问题描述
- Chrome版本和操作系统
- 复现步骤
- 截图（如果适用）

### 功能建议
我们欢迎新的卡片样式想法和功能建议：
- 新的社交媒体平台适配
- 更多装饰风格
- 界面改进建议

### 代码贡献
1. Fork这个项目
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 致谢

- 感谢ChatGPT提供优秀的AI对话体验
- 感谢所有测试用户的反馈和建议
- 特别感谢小红书等社交平台的内容格式启发

## 📞 联系方式

- 项目地址：[GitHub](https://github.com/your-username/chatgpt-copy-enhancer)
- 问题反馈：[Issues](https://github.com/your-username/chatgpt-copy-enhancer/issues)
- 邮箱：your-email@example.com

---

**让AI分享更精彩！🚀** 