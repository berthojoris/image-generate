import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.length < 10) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenRouter API key not configured properly'
      });
    }

    // Test connection to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `OpenRouter API connection failed: ${response.status} ${response.statusText}`,
        details: 'Check if your API key is valid and has the correct permissions'
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'OpenRouter API connection successful',
      responseStatus: response.status
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test OpenRouter connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}