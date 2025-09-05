export interface ImageModel {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

export const defaultModels: ImageModel[] = [
  {
    id: 'google/gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash Image Preview',
    description: 'Google\'s advanced image generation model with contextual understanding'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek V3.1 (free)',
    description: 'Deepseek New Version'
  }
];