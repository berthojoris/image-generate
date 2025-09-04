import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl, model } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const selectedModel = model || 'google/gemini-2.5-flash-image-preview:free';

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.length < 10) {
      return NextResponse.json({
        error: 'OpenRouter API key not configured properly. Please add a valid API key to .env.local file.'
      }, { status: 500 });
    }

    // Prepare the messages array for OpenRouter API
    const messages = [
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: prompt
          }
        ] as Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string}}>
      }
    ];

    // Add image to the content if provided
    if (imageUrl) {
      messages[0].content.push({
        type: 'image_url' as const,
        image_url: {
          url: imageUrl
        }
      });
    }

    // Make request to OpenRouter API
    console.log('Making request to OpenRouter with model:', selectedModel);
    console.log('Request payload:', {
      model: selectedModel,
      messages: messages.length > 0 ? messages : 'No messages',
      modalities: ['image', 'text']
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'BlogSpace Image Generator',
        'User-Agent': 'BlogSpace/1.0'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        modalities: ['image', 'text'],
        max_tokens: 1000,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    console.log('OpenRouter response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Failed to generate image response';

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('OpenRouter API Error:', errorData);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('OpenRouter API Error (non-JSON):', errorText.substring(0, 200));

          // Extract meaningful error from HTML if possible
          if (errorText.includes('401') || errorText.includes('Unauthorized')) {
            errorMessage = 'Invalid API key or unauthorized access';
          } else if (errorText.includes('404')) {
            errorMessage = 'Model not found or unavailable';
          } else if (errorText.includes('429')) {
            errorMessage = 'Rate limit exceeded. Please try again later';
          } else if (errorText.includes('500')) {
            errorMessage = 'Server error. Please try again later';
          } else if (errorText.includes('503') || response.status === 503) {
            errorMessage = 'OpenRouter service is temporarily unavailable. Please try again in a few minutes.';
          } else if (errorText.includes('cloudflare') || errorText.includes('<!DOCTYPE')) {
            errorMessage = 'OpenRouter service is currently experiencing issues. Please try again later.';
          } else if (response.status >= 500) {
            errorMessage = 'OpenRouter service is experiencing server issues. Please try again later.';
          }
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        errorMessage = `API request failed with status ${response.status}`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing OpenRouter response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ error: 'Invalid response from OpenRouter' }, { status: 500 });
    }

    const message = data.choices[0].message;
    const generatedText = message.content || '';
    const generatedImages = message.images || [];

    return NextResponse.json({
      success: true,
      result: generatedText,
      images: generatedImages,
      usage: data.usage || null
    });

  } catch (error) {
    console.error('Image generation error:', error);

    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. The AI service is taking too long to respond. Please try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to AI service. Please check your internet connection and try again.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'API configuration error. Please ensure the OpenRouter API key is properly configured.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}