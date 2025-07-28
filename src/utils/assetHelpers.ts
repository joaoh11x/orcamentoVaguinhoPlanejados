import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

export const loadAssetAsBase64 = async (assetPath: any): Promise<string | null> => {
  try {
    // Método 1: Asset API (funciona na maioria dos casos)
    try {
      const asset = Asset.fromModule(assetPath);
      await asset.downloadAsync();
      
      if (asset.localUri) {
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log('Asset carregado via Asset API');
        return base64;
      }
    } catch (assetError) {
      console.log('Falha no Asset API:', assetError);
    }

    // Método 2: Bundle directory (funciona em APK builds)
    if (Platform.OS === 'android') {
      const possiblePaths = [
        `${FileSystem.bundleDirectory}assets/logo.png`,
        `${FileSystem.bundleDirectory}logo.png`,
        `${FileSystem.bundleDirectory}assets/images/logo.png`,
      ];

      for (const path of possiblePaths) {
        try {
          const base64 = await FileSystem.readAsStringAsync(path, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log(`Asset carregado via bundle: ${path}`);
          return base64;
        } catch (bundleError) {
          console.log(`Falha no caminho ${path}:`, bundleError);
        }
      }
    }

    console.log('Nenhum método de carregamento funcionou');
    return null;
  } catch (error) {
    console.error('Erro geral ao carregar asset:', error);
    return null;
  }
};
