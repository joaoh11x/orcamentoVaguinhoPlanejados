const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar extensões de assets
config.resolver.assetExts.push(
  // Imagens
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg',
  // Outros assets
  'pdf', 'doc', 'docx'
);

module.exports = config;
