// app/dashboard/categories/components/CategoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/category";
import { UploadService } from "@/services/uploadService";
import { CategoryService } from "@/services/categoryService";
import { toast } from "react-hot-toast";
import { ImageIcon, Upload, X, Check, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Category;
}

export function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData
}: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugMessage, setSlugMessage] = useState<string>('');
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setExistingImage(initialData.image_url);
      setImagePreview(initialData.image_url);
      setSlugAvailable(true);
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setStatus('active');
    setImage(null);
    setImagePreview(null);
    setExistingImage(null);
    setSlugAvailable(null);
    setSlugMessage('');
    setSlugSuggestion(null);
    setUploadingImage(false);
  };

  // Auto-generate slug from name when typing
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Only auto-generate slug if user hasn't manually edited it
    if (!slug || slug === generateSlugFromName(initialData?.name || '')) {
      const generatedSlug = generateSlugFromName(newName);
      setSlug(generatedSlug);
      setSlugAvailable(null);
      setSlugMessage('');
      setSlugSuggestion(null);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().trim();
    setSlug(newSlug);
    setSlugAvailable(null);
    setSlugMessage('');
    setSlugSuggestion(null);
  };

  // Debounced slug validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug && slug.length >= 3) {
        validateSlug(slug);
      } else if (slug && slug.length < 3) {
        setSlugAvailable(false);
        setSlugMessage('Slug must be at least 3 characters');
      } else {
        setSlugAvailable(null);
        setSlugMessage('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const validateSlug = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) return;
    
    setCheckingSlug(true);
    try {
      const result = await CategoryService.validateSlug(
        slugToCheck,
        initialData?.id
      );
      
      setSlugAvailable(result.available);
      setSlugMessage(result.message || '');
      setSlugSuggestion(result.suggested || null);
      
      if (!result.available && result.suggested) {
        setSlugMessage(`This slug is taken. Suggested: ${result.suggested}`);
      }
    } catch (error) {
      console.error('Error validating slug:', error);
    } finally {
      setCheckingSlug(false);
    }
  };

  const applySuggestion = () => {
    if (slugSuggestion) {
      setSlug(slugSuggestion);
      setTimeout(() => validateSlug(slugSuggestion), 100);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Image size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt || '')) {
      toast.error('File type not allowed. Please use JPEG, PNG, WebP, or GIF.');
      e.target.value = '';
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear any previous errors
    toast.dismiss();
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    // Validate slug
    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    // Check if slug is available
    if (slugAvailable === false) {
      toast.error('Please choose a different slug');
      return;
    }

    // If slug hasn't been validated yet, validate it
    if (slugAvailable === null) {
      setCheckingSlug(true);
      try {
        const result = await CategoryService.validateSlug(
          slug,
          initialData?.id
        );
        setSlugAvailable(result.available);
        setSlugMessage(result.message || '');
        
        if (!result.available) {
          toast.error('Please choose a different slug');
          setCheckingSlug(false);
          return;
        }
      } catch (error) {
        toast.error('Failed to validate slug');
        setCheckingSlug(false);
        return;
      }
      setCheckingSlug(false);
    }

    try {
      setLoading(true);
      
      let imageUrl = existingImage;

      // Upload new image if selected
      if (image) {
        setUploadingImage(true);
        try {
          const uploadResult = await UploadService.uploadImage(image, 'categories');
          imageUrl = uploadResult.url;
          
          // Delete old image if exists
          if (existingImage && initialData?.image_url !== existingImage) {
            const oldPath = existingImage.split('/').pop();
            if (oldPath) {
              await UploadService.deleteImage(oldPath);
            }
          }
          toast.success('Image uploaded successfully');
        } catch (uploadError) {
          // Handle upload errors with specific messages
          if (uploadError instanceof Error) {
            toast.error(uploadError.message);
          } else {
            toast.error('Failed to upload image');
          }
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const data = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || undefined,
        status,
        image_url: imageUrl || undefined
      };

      await onSubmit(data);
      toast.success(initialData ? 'Category updated successfully' : 'Category created successfully');
      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save category');
      }
      console.error(error);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const isFormValid = () => {
    return (
      name.trim() &&
      slug.trim() &&
      slugAvailable === true &&
      !checkingSlug &&
      !uploadingImage
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Image</Label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={imagePreview}
                    alt="Category preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={uploadingImage}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <label className={cn(
                  "flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  "hover:border-primary",
                  uploadingImage ? "opacity-50 cursor-not-allowed" : "border-gray-300"
                )}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              disabled={loading || uploadingImage}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <div className="relative">
              <Input
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="Enter URL-friendly slug (e.g., electronics)"
                className={cn(
                  "pr-10",
                  slugAvailable === true && "border-green-500",
                  slugAvailable === false && "border-red-500"
                )}
                disabled={loading || uploadingImage}
                required
              />
              {checkingSlug ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              ) : slugAvailable === true ? (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              ) : slugAvailable === false ? (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              ) : null}
            </div>
            
            {/* Slug Validation Messages */}
            {slugMessage && (
              <div className="mt-1">
                <p className={cn(
                  "text-sm",
                  slugAvailable === true ? "text-green-600" : "text-red-600"
                )}>
                  {slugMessage}
                </p>
                {slugSuggestion && !slugAvailable && (
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="text-sm text-primary hover:underline mt-1"
                    disabled={loading || uploadingImage}
                  >
                    Use suggestion: {slugSuggestion}
                  </button>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              URL-friendly identifier. Use lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows={3}
              disabled={loading || uploadingImage}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value: any) => setStatus(value)}
              disabled={loading || uploadingImage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading || uploadingImage}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isFormValid() || checkingSlug || uploadingImage}
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadingImage ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                initialData ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}