// ChatGPT 美化复制助手 - 弹出窗口脚本
class PopupManager {
  constructor() {
    this.currentStyle = 'xiaohongshu';
    this.styleOptions = document.querySelectorAll('.style-option');
    this.previewBox = document.getElementById('preview');
    this.saveBtn = document.getElementById('saveBtn');
    this.successMessage = document.getElementById('successMessage');
    
    this.init();
  }

  async init() {
    // 加载已保存的设置
    await this.loadSettings();
    
    // 绑定事件监听器
    this.bindEvents();
    
    // 显示初始预览
    this.updatePreview();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['cardStyle']);
      if (result.cardStyle) {
        this.currentStyle = result.cardStyle;
      }
    } catch (error) {
      console.log('使用默认设置');
    }

    // 更新UI选中状态
    this.updateSelectedStyle();
  }

  bindEvents() {
    // 样式选项点击事件
    this.styleOptions.forEach(option => {
      option.addEventListener('click', () => {
        const style = option.dataset.style;
        this.selectStyle(style);
      });
    });

    // 保存按钮点击事件
    this.saveBtn.addEventListener('click', () => {
      this.saveSettings();
    });
  }

  selectStyle(style) {
    this.currentStyle = style;
    this.updateSelectedStyle();
    this.updatePreview();
  }

  updateSelectedStyle() {
    this.styleOptions.forEach(option => {
      const radio = option.querySelector('input[type="radio"]');
      if (option.dataset.style === this.currentStyle) {
        option.classList.add('active');
        radio.checked = true;
      } else {
        option.classList.remove('active');
        radio.checked = false;
      }
    });
  }

  updatePreview() {
    const sampleText = "这是一个示例回答，展示了AI如何帮助解决问题。通过使用先进的自然语言处理技术，我可以理解和回应各种复杂的问题。";
    const formattedText = this.formatTextWithStyle(sampleText, this.currentStyle);
    this.previewBox.textContent = formattedText;
  }

  formatTextWithStyle(text, style) {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    switch (style) {
      case 'xiaohongshu':
        return this.formatXiaohongshuStyle(text, timestamp);
      case 'colorful':
        return this.formatColorfulStyle(text, timestamp);
      case 'minimal':
        return this.formatMinimalStyle(text, timestamp);
      case 'quote':
        return this.formatQuoteStyle(text, timestamp);
      case 'image':
        return this.formatImageStyle(text, timestamp);
      case 'default':
      default:
        return text;
    }
  }

  formatXiaohongshuStyle(text, timestamp) {
    const emojis = ['✨', '💡', '🔥', '💯', '🌟', '🎯', '💪', '🚀'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return `${randomEmoji} AI智能问答 ${randomEmoji}

${text}

—————————————————
💭 来自ChatGPT的回答
⏰ ${timestamp}
🏷️ #AI问答 #ChatGPT #智能助手

${randomEmoji} 觉得有用请点赞收藏哦 ${randomEmoji}`;
  }

  formatColorfulStyle(text, timestamp) {
    return `🎨 ============ AI回答 ============ 🎨

${text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 ChatGPT智能回答
📅 生成时间：${timestamp}
💝 分享即是传播知识的力量

🌈 ================================ 🌈`;
  }

  formatMinimalStyle(text, timestamp) {
    return `${text}

———
📝 AI回答 | ${timestamp}`;
  }

  formatQuoteStyle(text, timestamp) {
    const lines = text.split('\n');
    const quotedLines = lines.map(line => line.trim() ? `> ${line}` : '>').join('\n');
    
    return `💬 AI智能问答

${quotedLines}

— ChatGPT · ${timestamp}`;
  }

  formatImageStyle(text, timestamp) {
    return `🖼️ 图片预览

📱 将生成精美的图片卡片
🎨 包含渐变背景和装饰元素
📝 支持Markdown格式渲染
⏬ 自动下载到本地

示例内容：
"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"

⏰ 生成时间：${timestamp}
🏷️ #AI问答 #ChatGPT #精美图片`;
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        cardStyle: this.currentStyle
      });
      
      this.showSuccessMessage();
      
      // 通知content script更新设置
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com'))) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          cardStyle: this.currentStyle
        }).catch(() => {
          // 忽略错误，可能页面还没加载插件脚本
        });
      }
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  showSuccessMessage() {
    this.successMessage.classList.add('show');
    setTimeout(() => {
      this.successMessage.classList.remove('show');
    }, 2000);
  }
}

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 