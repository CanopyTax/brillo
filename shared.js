export function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

export const rendererToMain = '__SEND_TO_MAIN';
export const mainToRenderer = '__SEND_TO_RENDERER';
export const rendererToMainResponse = '__SEND_TO_MAIN_RESPONSE';
export const mainToRendererResponse = '__SEND_TO_RENDERER_RESPONSE';