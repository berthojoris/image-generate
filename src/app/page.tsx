'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Upload,
  Image as ImageIcon,
  Wand2,
  Copy,
  X,
  Loader2,
  Sparkles,
  Zap,
  Download,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultModels } from '@/lib/models';

interface GenerationResult {
  result: string;
  images?: Array<{
    type: string;
    image_url: {
      url: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-image-preview:free');
  const availableModels = defaultModels;
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Models are loaded from the static file - no API loading needed

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setServiceError(null); // Clear any previous service errors

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrl: uploadedImage,
          model: selectedModel
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      setResult(data);
      if (data.images && data.images.length > 0) {
        toast.success('Images generated successfully!');
      } else {
        toast.success('Response generated successfully!');
      }
    } catch (error) {
      console.error('Generation error:', error);

      let errorMessage = 'Failed to generate response';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Provide more helpful error messages
      if (errorMessage.includes('API key')) {
        errorMessage = 'API configuration error. Please check if the OpenRouter API key is properly set.';
      } else if (errorMessage.includes('Model not found')) {
        errorMessage = 'The selected model is not available. Please try a different model.';
      } else if (errorMessage.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('Service Temporarily Unavailable')) {
        setServiceError('OpenRouter service is temporarily unavailable. Please try again in a few minutes.');
        errorMessage = 'Service temporarily unavailable. Please see the alert above for more details.';
      } else if (errorMessage.includes('service is currently experiencing issues')) {
        setServiceError('OpenRouter service is currently experiencing issues. Please try again later.');
        errorMessage = 'Service experiencing issues. Please see the alert above for more details.';
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadImage = (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setServiceError(null); // Clear any previous service errors
    try {
      const response = await fetch('/api/test-openrouter');
      const result = await response.json();

      if (result.status === 'success') {
        toast.success('OpenRouter connection successful!');
      } else {
        if (result.message && result.message.includes('503')) {
          setServiceError('OpenRouter service is temporarily unavailable. Please try again later.');
        }
        toast.error(result.message || 'Connection test failed');
      }
    } catch {
      toast.error('Failed to test connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const retryGeneration = () => {
    setServiceError(null);
    generateImage();
  };

  const clearAll = () => {
    setPrompt('');
    setUploadedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              AI Image Generator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Generate stunning AI images from text prompts or analyze existing images.
              Powered by Google&apos;s Gemini 2.5 Flash.
            </p>
            <div className="flex items-center justify-center mt-6 space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Free Model
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {availableModels.find(m => m.id === selectedModel)?.name.split('(')[0].trim() || 'Gemini 2.5 Flash'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Error Alert */}
            {serviceError && (
              <div className="lg:col-span-2">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Service Temporarily Unavailable
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {serviceError}
                      </p>
                      <div className="mt-3 flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={retryGeneration}
                          disabled={isGenerating}
                          className="bg-white dark:bg-gray-800 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Try Again
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setServiceError(null)}
                          className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <X className="h-3 w-3 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Input Section */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-violet-600" />
                    <span>Upload Image (Optional)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                      dragActive
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploadedImage ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={uploadedImage}
                          alt="Uploaded"
                          fill
                          className="object-contain rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => setUploadedImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Drop your image here
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            or click to browse
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-4"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="h-5 w-5 text-violet-600" />
                    <span>Model & Prompt Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="model" className="text-sm font-medium">
                      Select AI Model
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              {model.description && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {model.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="prompt" className="text-sm font-medium">
                      Describe the image you want to generate or analyze
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="Example: Generate a beautiful sunset over mountains, or describe this uploaded image in detail..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-2 min-h-[120px] resize-none border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={generateImage}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={clearAll}
                      disabled={isGenerating}
                      size="lg"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-violet-600" />
                      <span>Generated Content</span>
                    </span>
                    {result && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.result)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          AI is generating your image...
                        </p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="space-y-6">
                      {/* Generated Images */}
                      {result.images && result.images.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Generated Images
                          </h3>
                          <div className="grid gap-4">
                            {result.images.map((image, index) => (
                              <div key={index} className="relative group aspect-video">
                                <Image
                                  src={image.image_url.url}
                                  alt={`Generated image ${index + 1}`}
                                  fill
                                  className="rounded-lg shadow-md transition-transform group-hover:scale-[1.02] object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Button
                                    onClick={() => downloadImage(image.image_url.url, index)}
                                    className="bg-white/90 text-gray-800 hover:bg-white border-0 shadow-lg"
                                    size="sm"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generated Text */}
                      {result.result && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Generated Description
                          </h3>
                          <div className="prose dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              {result.result}
                            </div>
                          </div>
                        </div>
                      )}

                      {result.usage && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                            Token Usage:
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div className="text-center">
                              <div className="font-semibold text-gray-700 dark:text-gray-300">
                                {result.usage.prompt_tokens}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">Prompt</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-700 dark:text-gray-300">
                                {result.usage.completion_tokens}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">Response</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-violet-600">
                                {result.usage.total_tokens}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">Total</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Your generated images and descriptions will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}