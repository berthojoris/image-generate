import { NextResponse } from 'next/server';

interface OpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  output_modalities?: string[];
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

interface OpenRouterResponse {
  data?: OpenRouterModel[];
}

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Return default models if no API key is configured
      return NextResponse.json([
        {
          id: 'google/gemini-2.5-flash-image-preview:free',
          name: 'Gemini 2.5 Flash Image Preview (free)',
          description: 'Google\'s advanced image generation model with contextual understanding'
        },
        {
          id: 'black-forest-labs/flux-1-schnell:free',
          name: 'FLUX.1 Schnell (free)',
          description: 'Fast and high-quality image generation model by Black Forest Labs'
        }
      ]);
    }

    // Fetch available models from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch models from OpenRouter:', response.status, response.statusText);
      throw new Error(`Failed to fetch models from OpenRouter: ${response.status}`);
    }

    let data: OpenRouterResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing models response:', parseError);
      throw new Error('Invalid response format from OpenRouter models API');
    }

    // Filter for image generation models that are free
    const imageModels = data.data?.filter((model: OpenRouterModel) => {
      const hasImageOutput = model.output_modalities?.includes('image');
      const isFree = model.pricing?.prompt === '0' || model.id.includes(':free');
      return hasImageOutput && isFree;
    }) || [];

    // Map to our interface format
    const formattedModels = imageModels.map((model: OpenRouterModel) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description || `${model.name || model.id} - Image generation model`,
      pricing: model.pricing
    }));

    // Ensure we have at least the default models
    if (formattedModels.length === 0) {
      return NextResponse.json([
        {
          id: 'google/gemini-2.5-flash-image-preview:free',
          name: 'Gemini 2.5 Flash Image Preview (free)',
          description: 'Google\'s advanced image generation model with contextual understanding'
        },
        {
          id: 'black-forest-labs/flux-1-schnell:free',
          name: 'FLUX.1 Schnell (free)',
          description: 'Fast and high-quality image generation model by Black Forest Labs'
        }
      ]);
    }

    return NextResponse.json(formattedModels);

  } catch (error) {
    console.error('Error fetching models:', error);

    // Return default models as fallback
    return NextResponse.json([
      {
        id: 'google/gemini-2.5-flash-image-preview:free',
        name: 'Gemini 2.5 Flash Image Preview (free)',
        description: 'Google\'s advanced image generation model with contextual understanding'
      },
      {
        id: 'black-forest-labs/flux-1-schnell:free',
        name: 'FLUX.1 Schnell (free)',
        description: 'Fast and high-quality image generation model by Black Forest Labs'
      }
    ]);
  }
}