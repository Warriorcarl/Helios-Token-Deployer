import { parseUnits } from 'viem';
import { TOKEN_CONFIG } from '../constants/abi/tokenDeployerAbi';

// Token validation and deployment logic
export class TokenDeploymentManager {
  constructor() {
    this.denomSeed = Date.now();
  }

  // Update denom seed for unique denomination generation
  updateDenomSeed() {
    this.denomSeed = Date.now();
  }

  // Validate token name
  validateTokenName(name) {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Token name is required' };
    }
    if (name.length > 50) {
      return { isValid: false, error: 'Token name too long (max 50 characters)' };
    }
    // Check for spaces - not allowed in precompile tokens
    if (/\s/.test(name)) {
      return { isValid: false, error: 'Token name cannot contain spaces (precompile requirement)' };
    }
    // Only allow alphanumeric characters for precompile compatibility
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      return { isValid: false, error: 'Token name can only contain letters and numbers' };
    }
    return { isValid: true };
  }

  // Validate token symbol
  validateTokenSymbol(symbol) {
    if (!symbol || symbol.trim().length === 0) {
      return { isValid: false, error: 'Token symbol is required' };
    }
    if (!/^[A-Z0-9]+$/.test(symbol)) {
      return { isValid: false, error: 'Token symbol can only contain uppercase letters and numbers' };
    }
    if (symbol.length > TOKEN_CONFIG.MAX_SYMBOL_LENGTH) {
      return { isValid: false, error: `Token symbol cannot be more than ${TOKEN_CONFIG.MAX_SYMBOL_LENGTH} characters` };
    }
    return { isValid: true };
  }

  // Validate total supply
  validateTotalSupply(supply) {
    if (!supply || supply.trim().length === 0) {
      return { isValid: false, error: 'Total supply is required' };
    }
    if (!/^[0-9]+$/.test(supply)) {
      return { isValid: false, error: 'Total supply must be a number' };
    }
    if (supply === '0' || parseInt(supply) < TOKEN_CONFIG.MIN_SUPPLY) {
      return { isValid: false, error: 'Total supply must be greater than 0' };
    }
    return { isValid: true };
  }

  // Validate all token parameters
  validateTokenParams(name, symbol, supply) {
    const nameValidation = this.validateTokenName(name);
    const symbolValidation = this.validateTokenSymbol(symbol);
    const supplyValidation = this.validateTotalSupply(supply);

    const errors = [];
    if (!nameValidation.isValid) errors.push(nameValidation.error);
    if (!symbolValidation.isValid) errors.push(symbolValidation.error);
    if (!supplyValidation.isValid) errors.push(supplyValidation.error);

    return {
      isValid: errors.length === 0,
      errors,
      validations: {
        name: nameValidation,
        symbol: symbolValidation,
        supply: supplyValidation
      }
    };
  }

  // Generate random string for denomination
  generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate unique denomination
  generateDenom(symbol) {
    return `a${symbol.toLowerCase()}-${this.generateRandomString(6)}-${this.denomSeed}`;
  }

  // Prepare deployment arguments
  prepareDeploymentArgs(name, symbol, supply, logoBase64 = '') {
    const validation = this.validateTokenParams(name, symbol, supply);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const denom = this.generateDenom(symbol);
    const supplyBigInt = parseUnits(supply, TOKEN_CONFIG.DECIMALS);

    return [
      name.trim(),
      symbol.trim(),
      denom,
      supplyBigInt,
      TOKEN_CONFIG.DECIMALS,
      logoBase64
    ];
  }
}

// Logo generation and processing logic
export class LogoManager {
  // Generate procedural logo for token
  static generateLogo(symbol = 'TKN') {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, 200, 200);

    // Main circle with glow effect
    ctx.save();
    ctx.shadowColor = "#00fdff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, 2 * Math.PI);
    ctx.strokeStyle = "#2997ff";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // Random decorative circles
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        100 + Math.random() * 50 - 25,
        100 + Math.random() * 50 - 25,
        Math.random() * 35 + 10,
        0,
        2 * Math.PI
      );
      ctx.strokeStyle = "#2997ff";
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Text styling based on symbol length
    ctx.globalAlpha = 1;
    let fontSize = 70;
    if (symbol.length > 3) fontSize = 45;
    if (symbol.length > 4) fontSize = 36;

    // Draw symbol text
    ctx.font = `bold ${fontSize}px 'Panchang', sans-serif`;
    ctx.fillStyle = "#eaf6ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#00fdff";
    ctx.shadowBlur = 12;
    ctx.fillText(symbol.slice(0, 5).toUpperCase(), 100, 110);

    return canvas.toDataURL("image/png");
  }

  // Process uploaded image to standardized format
  static processUploadedImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext("2d");

          // Calculate scaling to fit within 200x200 while maintaining aspect ratio
          const scale = Math.min(200 / img.width, 200 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (200 - scaledWidth) / 2;
          const y = (200 - scaledHeight) / 2;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          const pngUrl = canvas.toDataURL("image/png");
          resolve(pngUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Extract base64 data from data URL
  static extractBase64(dataUrl) {
    if (!dataUrl) return '';
    return dataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
  }
}

// Form input sanitization
export class InputSanitizer {
  // Sanitize token symbol input
  static sanitizeTokenSymbol(input) {
    return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // Sanitize numeric input
  static sanitizeNumericInput(input) {
    return input.replace(/[^0-9]/g, '');
  }

  // Sanitize token name input - remove spaces for precompile compatibility
  static sanitizeTokenName(input) {
    return input.replace(/[<>\s]/g, ''); // Remove potentially dangerous characters and spaces
  }
}