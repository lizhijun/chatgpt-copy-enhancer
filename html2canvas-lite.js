// HTML2Canvas 轻量级替代方案 - 专为ChatGPT美化复制助手设计
class HTML2CanvasLite {
  constructor() {
    this.scale = 2; // 高分辨率
  }

  async render(element, options = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 获取元素尺寸
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    // 设置canvas尺寸
    canvas.width = rect.width * this.scale;
    canvas.height = rect.height * this.scale;
    
    // 设置高分辨率渲染
    ctx.scale(this.scale, this.scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 渲染元素
    await this.renderElement(ctx, element, 0, 0, rect.width, rect.height);
    
    return canvas;
  }

  async renderElement(ctx, element, x, y, width, height) {
    const styles = window.getComputedStyle(element);
    
    // 渲染背景
    await this.renderBackground(ctx, element, x, y, width, height, styles);
    
    // 渲染边框
    this.renderBorder(ctx, element, x, y, width, height, styles);
    
    // 渲染内容
    await this.renderContent(ctx, element, x, y, width, height, styles);
    
    // 渲染子元素
    await this.renderChildren(ctx, element, x, y);
  }

  async renderBackground(ctx, element, x, y, width, height, styles) {
    const bgColor = styles.backgroundColor;
    const bgImage = styles.backgroundImage;
    
    // 渲染背景色
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      const borderRadius = this.parseBorderRadius(styles.borderRadius);
      
      if (borderRadius > 0) {
        this.roundRect(ctx, x, y, width, height, borderRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, width, height);
      }
    }
    
    // 渲染渐变背景
    if (bgImage && bgImage.includes('gradient')) {
      const gradient = this.parseGradient(bgImage, x, y, width, height);
      if (gradient) {
        ctx.fillStyle = gradient;
        const borderRadius = this.parseBorderRadius(styles.borderRadius);
        
        if (borderRadius > 0) {
          this.roundRect(ctx, x, y, width, height, borderRadius);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, width, height);
        }
      }
    }
  }

  renderBorder(ctx, element, x, y, width, height, styles) {
    const borderWidth = parseInt(styles.borderWidth) || 0;
    const borderColor = styles.borderColor;
    const borderRadius = this.parseBorderRadius(styles.borderRadius);
    
    if (borderWidth > 0 && borderColor && borderColor !== 'transparent') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      
      if (borderRadius > 0) {
        this.roundRect(ctx, x, y, width, height, borderRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, width, height);
      }
    }
  }

  async renderContent(ctx, element, x, y, width, height, styles) {
    // 只渲染文本内容，跳过其他元素
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent.trim();
      if (text) {
        this.renderText(ctx, text, x, y, styles);
      }
    }
  }

  async renderChildren(ctx, element, parentX, parentY) {
    for (const child of element.children) {
      const childRect = child.getBoundingClientRect();
      const parentRect = element.getBoundingClientRect();
      
      const x = parentX + (childRect.left - parentRect.left);
      const y = parentY + (childRect.top - parentRect.top);
      
      await this.renderElement(ctx, child, x, y, childRect.width, childRect.height);
    }
  }

  renderText(ctx, text, x, y, styles) {
    ctx.fillStyle = styles.color || '#000000';
    ctx.font = `${styles.fontWeight || 'normal'} ${styles.fontSize || '16px'} ${styles.fontFamily || 'Arial'}`;
    ctx.textAlign = styles.textAlign || 'left';
    ctx.textBaseline = 'top';
    
    const lines = text.split('\n');
    const lineHeight = parseInt(styles.lineHeight) || parseInt(styles.fontSize) * 1.2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight));
    });
  }

  parseGradient(gradientStr, x, y, width, height) {
    // 简化的渐变解析
    if (gradientStr.includes('linear-gradient')) {
      const match = gradientStr.match(/linear-gradient\([^)]+\)/);
      if (match) {
        const gradient = this.parseLinearGradient(match[0], x, y, width, height);
        return gradient;
      }
    } else if (gradientStr.includes('radial-gradient')) {
      const match = gradientStr.match(/radial-gradient\([^)]+\)/);
      if (match) {
        const gradient = this.parseRadialGradient(match[0], x, y, width, height);
        return gradient;
      }
    }
    return null;
  }

  parseLinearGradient(gradientStr, x, y, width, height) {
    // 简化实现 - 只支持基本的线性渐变
    const ctx = document.createElement('canvas').getContext('2d');
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    
    // 默认渐变色
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    return gradient;
  }

  parseRadialGradient(gradientStr, x, y, width, height) {
    const ctx = document.createElement('canvas').getContext('2d');
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.max(width, height) / 2;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    return gradient;
  }

  parseBorderRadius(borderRadius) {
    if (!borderRadius || borderRadius === '0px') return 0;
    return parseInt(borderRadius) || 0;
  }

  roundRect(ctx, x, y, width, height, radius) {
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
}

// 导出为全局变量
window.HTML2CanvasLite = HTML2CanvasLite; 