'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-image-preview');
  const [enhanceSizeAndQuality, setEnhanceSizeAndQuality] = useState(false);
  const [deepAnalyze, setDeepAnalyze] = useState(false);
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<string[]>([]);
  const availableModels = defaultModels;
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication immediately on component mount
  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authenticated='));

      if (!authCookie || authCookie.split('=')[1] !== 'true') {
        setIsAuthenticated(false);
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  // Don't render anything until authentication is checked
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the main content
  if (isAuthenticated === false) {
    return null;
  }

  // Models are loaded from the static file - no API loading needed

  const handleImageUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (validFiles.length === 0) {
      toast.error('Please upload valid image files');
      return;
    }

    if (uploadedImages.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImages(prev => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
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
      let enhancedPrompt = prompt.trim();

      if (uploadedImages.length > 0) {
        // Handle multiple images
        const imageDescriptions = await Promise.all(
          uploadedImages.map(async (imageUrl, index) => {
            const dimensions = await getImageDimensions(imageUrl);
            const aspectRatio = dimensions.width / dimensions.height;
            const orientation = aspectRatio > 1 ? 'landscape' : aspectRatio < 1 ? 'portrait' : 'square';
            return `Image ${index + 1}: ${orientation} orientation (${dimensions.width}:${dimensions.height})`;
          })
        );

        enhancedPrompt += ` Analyze and combine elements from ${uploadedImages.length} uploaded images: ${imageDescriptions.join(', ')}. Generate a cohesive image that preserves the quality and characteristics of all uploaded images. Maintain high fidelity and ensure the result looks like real photos with excellent quality.`;
      }

      if (enhanceSizeAndQuality) {
        enhancedPrompt += ' Enhance the image to high definition (HD) quality.';
      }

      if (deepAnalyze) {
        enhancedPrompt += ' Analyze the image deeply and suggest enhancements to improve it, like noise reduction or sharpening.';
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          imageUrls: uploadedImages,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      setResult(data);
      if (data.images && data.images.length > 0) {
        toast.success('Images generated successfully!');
      } else {
        toast.success('Response generated successfully!');
      }

      if (deepAnalyze && data.result) {
        const suggestions = data.result.split('\n').filter((s: string) => s.trim().length > 0);
        setEnhancementSuggestions(suggestions);
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


  const retryGeneration = () => {
    setServiceError(null);
    generateImage();
  };

  const clearAll = () => {
    setPrompt('');
    setUploadedImages([]);
    setResult(null);
    setEnhancementSuggestions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyEnhancements = () => {
    const enhancedPrompt = `${prompt} ${enhancementSuggestions.join(' ')}`;
    setPrompt(enhancedPrompt);
    generateImage();
  };


  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block rounded-lg bg-primary/10 p-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              AI Image Generator
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Generate stunning AI images by analyzing your uploaded images with text prompts.
              Powered by Google&apos;s Gemini 2.5 Flash.
            </p>
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
              <Card className="w-full">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className="space-y-4">
                      <Label className="font-semibold text-lg">Upload Images (Max 5)</Label>
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 h-full flex flex-col justify-center",
                          dragActive
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {uploadedImages.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <Image
                                    src={image}
                                    alt={`Uploaded ${index + 1}`}
                                    width={150}
                                    height={150}
                                    className="object-cover rounded-lg w-full h-28"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setUploadedImages(prev => prev.filter((_, i) => i !== index));
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-center space-x-2">
                               <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Add more
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setUploadedImages([])}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                Drop your images here
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                or click to browse
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2"
                            >
                              Choose Images
                            </Button>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                    {/* Prompt and Config */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="model" className="font-semibold text-lg">
                          AI Model
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
                                    <span className="text-xs text-muted-foreground">
                                      {model.description}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prompt" className="font-semibold text-lg">
                          Prompt
                        </Label>
                        <Textarea
                          id="prompt"
                          placeholder="Describe what you want to do with the uploaded images..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="mt-2 min-h-[120px] resize-y"
                          disabled={isGenerating}
                        />
                      </div>
                      <div className="space-y-2">
                         <Label className="font-semibold text-lg">Options</Label>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="enhanceSize" checked={enhanceSizeAndQuality} onChange={(e) => setEnhanceSizeAndQuality(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                          <Label htmlFor="enhanceSize" className="text-sm font-medium">
                            Enhance size and quality
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="deepAnalyze" checked={deepAnalyze} onChange={(e) => setDeepAnalyze(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                          <Label htmlFor="deepAnalyze" className="text-sm font-medium">
                            Deep analyze
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        onClick={generateImage}
                        disabled={isGenerating || !prompt.trim() || uploadedImages.length === 0}
                        className="flex-1 sm:flex-none"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={clearAll}
                        disabled={isGenerating}
                        size="lg"
                        className="flex-1 sm:flex-none"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Clear
                      </Button>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span>Generated Content</span>
                    </span>
                    {result && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.result)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          AI is working its magic...
                        </p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="space-y-6">
                      {/* Generated Images */}
                      {result.images && result.images.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            Generated Images
                          </h3>
                          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {result.images.map((image, index) => (
                              <div key={index} className="relative group aspect-square">
                                <Image
                                  src={image.image_url.url}
                                  alt={`Generated image ${index + 1}`}
                                  fill
                                  className="rounded-lg shadow-md transition-transform group-hover:scale-[1.02] object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Button
                                    onClick={() => downloadImage(image.image_url.url, index)}
                                    className="bg-white/90 text-gray-800 hover:bg-white"
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
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            Generated Description
                          </h3>
                          <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {result.result}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Enhancement Suggestions */}
                      {enhancementSuggestions.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                            Enhancement Suggestions
                          </h3>
                          <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300 mb-4">
                            {enhancementSuggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm leading-relaxed">
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                          <Button
                            onClick={applyEnhancements}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            disabled={isGenerating}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Yes, Process Enhancement
                          </Button>
                        </div>
                      )}


                      {result.usage && (
                        <div className="mt-6 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">
                            Token Usage
                          </p>
                          <div className="flex space-x-4 text-xs">
                              <p><span className="font-semibold text-foreground">{result.usage.prompt_tokens}</span> Prompt</p>
                              <p><span className="font-semibold text-foreground">{result.usage.completion_tokens}</span> Response</p>
                              <p><span className="font-semibold text-primary">{result.usage.total_tokens}</span> Total</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Your generated images and descriptions will appear here.
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