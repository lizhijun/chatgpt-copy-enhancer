// ChatGPT 美化复制助手 - 内容脚本
class ChatGPTCopyEnhancer {
  constructor() {
    this.init();
    this.cardStyles = {
      default: '简约风格',
      colorful: '彩色卡片',
      minimal: '极简风格',
      xiaohongshu: '小红书风格',
      quote: '引用风格',
      image: '精美图片'
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
      <div class="dropdown-item" data-style="image">
        <span class="style-icon">🖼️</span>精美图片
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

    if (style === 'image') {
      // 生成图片
      await this.generateImage(messageText, messageContainer);
    } else {
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

  async generateImage(messageText, messageContainer) {
    try {
      this.showNotification('🎨 正在生成精美图片...', 'info');
      
      // 创建图片容器
      const imageContainer = this.createImageContainer(messageText);
      
      // 暂时添加到页面进行渲染
      document.body.appendChild(imageContainer);
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 转换为Canvas
      const canvas = await this.htmlToCanvas(imageContainer);
      
      // 移除临时容器
      document.body.removeChild(imageContainer);
      
      // 转换为图片并下载
      await this.downloadCanvasAsImage(canvas);
      
      this.showNotification('🖼️ 图片已生成并下载！', 'success');
      
    } catch (error) {
      console.error('图片生成失败:', error);
      this.showNotification('图片生成失败，请重试', 'error');
    }
  }

  createImageContainer(messageText) {
    const container = document.createElement('div');
    container.className = 'image-card-container';
    
    // 获取当前时间
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN');
    
    // 处理Markdown格式
    const processedText = this.processMarkdownForImage(messageText);
    
    container.innerHTML = `
      <div class="image-card">
        <!-- 顶部装饰 -->
        <div class="card-header">
          <div class="logo-section">
            <div class="ai-icon">🤖</div>
            <div class="title-section">
              <h2>AI智能问答</h2>
              <p>ChatGPT助手回答</p>
            </div>
          </div>
          <div class="decoration">✨</div>
        </div>
        
        <!-- 内容区域 -->
        <div class="card-content">
          ${processedText}
        </div>
        
        <!-- 底部信息 -->
        <div class="card-footer">
          <div class="footer-left">
            <div class="time">⏰ ${timestamp}</div>
            <div class="tags">
              <span class="tag">#AI问答</span>
              <span class="tag">#ChatGPT</span>
              <span class="tag">#智能助手</span>
            </div>
          </div>
          <div class="footer-right">
            <div class="share-text">分享即是传播知识 💡</div>
          </div>
        </div>
        
        <!-- 装饰元素 -->
        <div class="decoration-elements">
          <div class="star star1">⭐</div>
          <div class="star star2">✨</div>
          <div class="star star3">💫</div>
        </div>
      </div>
    `;
    
    return container;
  }

  processMarkdownForImage(text) {
    // 处理Markdown格式，转换为HTML
    let html = text;
    
    // 处理标题
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // 处理粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 处理行内代码
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // 处理代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理列表
    html = html.replace(/^[\s]*[-*+]\s+(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // 处理数字列表
    html = html.replace(/^[\s]*\d+\.\s+(.*)$/gm, '<li>$1</li>');
    
    // 处理段落
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() && 
          !paragraph.startsWith('<h') && 
          !paragraph.startsWith('<ul') && 
          !paragraph.startsWith('<ol') && 
          !paragraph.startsWith('<pre>')) {
        return `<p>${paragraph.trim()}</p>`;
      }
      return paragraph;
    }).join('\n');
    
    return html;
  }

  async htmlToCanvas(element) {
    try {
      // 使用自定义的HTML2CanvasLite库
      const html2canvas = new HTML2CanvasLite();
      const canvas = await html2canvas.render(element);
      return canvas;
    } catch (error) {
      console.error('HTML2Canvas渲染失败，使用备用方案:', error);
      // 备用方案：简化渲染
      return this.fallbackCanvasRender(element);
    }
  }

  fallbackCanvasRender(element) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rect = element.getBoundingClientRect();
        const scale = 2;
        
        // 设置canvas尺寸
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        ctx.scale(scale, scale);
        
        // 绘制渐变背景
        const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        
        // 绘制圆角矩形
        this.drawRoundedRect(ctx, 0, 0, rect.width, rect.height, 20);
        ctx.fill();
        
        // 绘制白色内容区域
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.drawRoundedRect(ctx, 30, 80, rect.width - 60, rect.height - 160, 15);
        ctx.fill();
        
        // 绘制标题
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('🤖 AI智能问答', 60, 50);
        
        // 绘制内容文本
        ctx.fillStyle = '#444444';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        const textContent = element.textContent || '';
        const lines = this.wrapText(ctx, textContent, rect.width - 120);
        
        lines.forEach((line, index) => {
          if (index < 15) { // 限制行数
            ctx.fillText(line, 50, 120 + (index * 24));
          }
        });
        
        // 绘制底部装饰
        ctx.fillStyle = '#666666';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const timestamp = new Date().toLocaleString('zh-CN');
        ctx.fillText(`⏰ ${timestamp}`, 50, rect.height - 40);
        
        ctx.fillText('#AI问答 #ChatGPT #智能助手', 50, rect.height - 20);
        
        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    });
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine.trim() !== '') {
      lines.push(currentLine.trim());
    }
    
    return lines;
  }

  async downloadCanvasAsImage(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('无法生成图片'));
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `chatgpt-answer-${Date.now()}.png`;
          
          // 模拟点击下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 清理URL
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          resolve();
        }, 'image/png', 0.9);
      } catch (error) {
        reject(error);
      }
    });
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