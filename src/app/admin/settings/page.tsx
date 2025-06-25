'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Save, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const siteSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  siteUrl: z.string().url('Please enter a valid URL'),
  contactEmail: z.string().email('Please enter a valid email'),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  enableComments: z.boolean(),
  moderateComments: z.boolean(),
  postsPerPage: z.number().min(1).max(50),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
})

type SiteSettingsForm = z.infer<typeof siteSettingsSchema>

const defaultSettings: SiteSettingsForm = {
  siteName: 'BlogSpace',
  siteDescription: 'A modern blog platform built with Next.js',
  siteUrl: 'https://blogspace.example.com',
  contactEmail: 'contact@blogspace.example.com',
  allowRegistration: true,
  requireEmailVerification: false,
  enableComments: true,
  moderateComments: true,
  postsPerPage: 10,
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing maintenance. Please check back later.',
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<SiteSettingsForm>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: defaultSettings
  })

  const maintenanceMode = watch('maintenanceMode')
  const moderateComments = watch('moderateComments')
  const enableComments = watch('enableComments')

  const onSubmit = async (data: SiteSettingsForm) => {
    try {
      setIsLoading(true)
      
      // Here you would typically save to your database or configuration
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      toast.success('Logo selected. Save settings to apply changes.')
    }
  }

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      toast.success('Favicon selected. Save settings to apply changes.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your blog settings and preferences.
          </p>
        </div>
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isLoading}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic information about your blog site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  {...register('siteName')}
                  placeholder="Enter site name"
                />
                {errors.siteName && (
                  <p className="text-sm text-red-600">{errors.siteName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  {...register('siteUrl')}
                  placeholder="https://example.com"
                />
                {errors.siteUrl && (
                  <p className="text-sm text-red-600">{errors.siteUrl.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                {...register('siteDescription')}
                placeholder="Describe your blog"
                rows={3}
              />
              {errors.siteDescription && (
                <p className="text-sm text-red-600">{errors.siteDescription.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="contact@example.com"
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Upload your logo and favicon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site Logo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {logoFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLogoFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Recommended: 200x50px, PNG or SVG</p>
              </div>
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="flex-1"
                  />
                  {faviconFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFaviconFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Recommended: 32x32px, ICO or PNG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>
              Configure user registration and authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-gray-500">Allow new users to create accounts</p>
              </div>
              <Switch
                checked={watch('allowRegistration')}
                onCheckedChange={(checked) => setValue('allowRegistration', checked, { shouldDirty: true })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the site</p>
              </div>
              <Switch
                checked={watch('requireEmailVerification')}
                onCheckedChange={(checked) => setValue('requireEmailVerification', checked, { shouldDirty: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Content Settings</CardTitle>
            <CardDescription>
              Configure how content is displayed and managed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postsPerPage">Posts Per Page</Label>
              <Input
                id="postsPerPage"
                type="number"
                min="1"
                max="50"
                {...register('postsPerPage', { valueAsNumber: true })}
              />
              {errors.postsPerPage && (
                <p className="text-sm text-red-600">{errors.postsPerPage.message}</p>
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Comments</Label>
                <p className="text-sm text-gray-500">Allow users to comment on articles</p>
              </div>
              <Switch
                checked={enableComments}
                onCheckedChange={(checked) => setValue('enableComments', checked, { shouldDirty: true })}
              />
            </div>
            {enableComments && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Moderate Comments</Label>
                    <p className="text-sm text-gray-500">Comments require approval before being published</p>
                  </div>
                  <Switch
                    checked={moderateComments}
                    onCheckedChange={(checked) => setValue('moderateComments', checked, { shouldDirty: true })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>
              Temporarily disable public access to your site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Show maintenance page to visitors</p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={(checked) => setValue('maintenanceMode', checked, { shouldDirty: true })}
              />
            </div>
            {maintenanceMode && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    {...register('maintenanceMessage')}
                    placeholder="Enter message to display during maintenance"
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}