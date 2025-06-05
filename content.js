// ChatGPT 美化复制助手 - 内容脚本
class ChatGPTCopyEnhancer {
  constructor() {
    this.init();
    this.cardStyles = {
      default: '简约风格',
      colorful: '彩色卡片',
      minimal: '极简风格',
      xiaohongshu: '小红书风格',
      quote: '引用风格'
    };
    this.currentStyle = 'xiaohongshu'; // 默认小红书风格
    this.loadSettings();
  }

  async init() {
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.observeMessages());
    } else {
      this.observeMessages();
    }
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

    // 监听设置更新消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SETTINGS_UPDATED') {
        this.currentStyle = message.cardStyle;
        console.log('设置已更新:', this.currentStyle);
      }
    });
  }

  observeMessages() {
    // 使用 MutationObserver 监听页面变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          this.enhanceCopyButtons();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初始增强已存在的复制按钮
    setTimeout(() => this.enhanceCopyButtons(), 1000);
  }

  enhanceCopyButtons() {
    // 查找所有消息容器
    const messageContainers = document.querySelectorAll('[data-message-author-role="assistant"]');
    
    messageContainers.forEach((container) => {
      if (container.querySelector('.enhanced-copy-btn')) return; // 已经增强过的跳过

      // 查找原始复制按钮
      const originalCopyBtn = container.querySelector('button[aria-label*="copy" i], button[title*="copy" i], button[data-testid*="copy" i]');
      
      if (originalCopyBtn) {
        this.addEnhancedCopyButton(container, originalCopyBtn);
      } else {
        // 如果没找到原始按钮，尝试在消息底部添加
        const messageContent = container.querySelector('.markdown, [class*="message"], [class*="content"]');
        if (messageContent) {
          this.addEnhancedCopyButton(container, null);
        }
      }
    });
  }

  addEnhancedCopyButton(messageContainer, originalBtn) {
    // 创建增强复制按钮容器
    const enhancedContainer = document.createElement('div');
    enhancedContainer.className = 'enhanced-copy-container';
    
    // 创建下拉菜单按钮
    const dropdownBtn = document.createElement('button');
    dropdownBtn.className = 'enhanced-copy-btn';
    dropdownBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      <span>美化复制</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 8l4-4H2z"/>
      </svg>
    `;

    // 创建下拉菜单
    const dropdown = document.createElement('div');
    dropdown.className = 'copy-dropdown';
    dropdown.innerHTML = `
      <div class="dropdown-item" data-style="xiaohongshu">
        <span class="style-icon">📱</span>小红书风格
      </div>
      <div class="dropdown-item" data-style="colorful">
        <span class="style-icon">🎨</span>彩色卡片
      </div>
      <div class="dropdown-item" data-style="minimal">
        <span class="style-icon">✨</span>极简风格
      </div>
      <div class="dropdown-item" data-style="quote">
        <span class="style-icon">💬</span>引用风格
      </div>
      <div class="dropdown-item" data-style="default">
        <span class="style-icon">📋</span>原始文本
      </div>
    `;

    enhancedContainer.appendChild(dropdownBtn);
    enhancedContainer.appendChild(dropdown);

    // 添加事件监听器
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      
      // 关闭其他下拉菜单
      document.querySelectorAll('.copy-dropdown.show').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
      });
    });

    // 下拉菜单项点击事件
    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        const style = item.dataset.style;
        this.copyWithStyle(messageContainer, style);
        dropdown.classList.remove('show');
      }
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    // 插入到适当位置
    this.insertEnhancedButton(messageContainer, enhancedContainer, originalBtn);
  }

  insertEnhancedButton(messageContainer, enhancedContainer, originalBtn) {
    // 尝试多种插入策略
    if (originalBtn) {
      // 在原始按钮旁边插入
      originalBtn.parentNode.insertBefore(enhancedContainer, originalBtn.nextSibling);
    } else {
      // 在消息底部插入
      const messageContent = messageContainer.querySelector('.markdown, [class*="message"], [class*="content"]');
      if (messageContent) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'message-actions';
        buttonContainer.appendChild(enhancedContainer);
        messageContent.appendChild(buttonContainer);
      }
    }
  }

  async copyWithStyle(messageContainer, style) {
    // 获取消息文本
    const messageText = this.extractMessageText(messageContainer);
    
    if (!messageText) {
      this.showNotification('未找到可复制的内容', 'error');
      return;
    }

    // 根据样式格式化文本
    const formattedText = this.formatTextWithStyle(messageText, style);
    
    try {
      await navigator.clipboard.writeText(formattedText);
      this.showNotification(`已复制 ${this.cardStyles[style]} 格式`, 'success');
    } catch (error) {
      console.error('复制失败:', error);
      this.showNotification('复制失败，请重试', 'error');
    }
  }

  extractMessageText(messageContainer) {
    // 获取消息内容
    const contentSelectors = [
      '.markdown',
      '[class*="message-content"]',
      '[class*="content"]',
      '.prose',
      'div[data-message-id] > div > div'
    ];

    let messageElement = null;
    for (const selector of contentSelectors) {
      messageElement = messageContainer.querySelector(selector);
      if (messageElement) break;
    }

    if (!messageElement) {
      messageElement = messageContainer;
    }

    // 提取纯文本，保留基本格式
    return this.extractTextWithFormatting(messageElement);
  }

  extractTextWithFormatting(element) {
    let text = '';
    
    function traverse(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        // 处理不同的HTML标签
        switch (tagName) {
          case 'p':
          case 'div':
            if (text && !text.endsWith('\n')) text += '\n';
            for (const child of node.childNodes) {
              traverse(child);
            }
            text += '\n';
            break;
          case 'br':
            text += '\n';
            break;
          case 'code':
            text += '`' + node.textContent + '`';
            break;
          case 'pre':
            text += '\n```\n' + node.textContent + '\n```\n';
            break;
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            text += '\n' + '#'.repeat(parseInt(tagName[1])) + ' ';
            for (const child of node.childNodes) {
              traverse(child);
            }
            text += '\n';
            break;
          case 'li':
            text += '• ';
            for (const child of node.childNodes) {
              traverse(child);
            }
            text += '\n';
            break;
          case 'strong':
          case 'b':
            text += '**';
            for (const child of node.childNodes) {
              traverse(child);
            }
            text += '**';
            break;
          case 'em':
          case 'i':
            text += '*';
            for (const child of node.childNodes) {
              traverse(child);
            }
            text += '*';
            break;
          default:
            for (const child of node.childNodes) {
              traverse(child);
            }
        }
      }
    }
    
    traverse(element);
    return text.replace(/\n{3,}/g, '\n\n').trim();
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
💭 来自ChatGTP的回答
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

  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `copy-notification ${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 3秒后自动消失
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// 初始化增强功能
new ChatGPTCopyEnhancer(); 