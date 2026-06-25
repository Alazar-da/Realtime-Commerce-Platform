// app/dashboard/products/components/ProductModal.tsx
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { SubCategory } from "@/types/subCategory";
import { UploadService } from "@/services/uploadService";
import { ProductService } from "@/services/productService";
import { toast } from "react-hot-toast";
import { Upload, X, Check, AlertCircle, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Product;
  categories: Category[];
  subCategories: SubCategory[];
}

export function ProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
  categories,
  subCategories
}: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock' | 'backorder' | 'discontinued'>('in_stock');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Image state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // Validation state
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugMessage, setSlugMessage] = useState<string>('');
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [checkingSku, setCheckingSku] = useState(false);
  const [skuAvailable, setSkuAvailable] = useState<boolean | null>(null);
  const [skuMessage, setSkuMessage] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category_id);
      setSubCategoryId(initialData.sub_category_id || '');
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description || '');
      setShortDescription(initialData.short_description || '');
      setPrice(initialData.price.toString());
      setComparePrice(initialData.compare_price?.toString() || '');
      setCostPrice(initialData.cost_price?.toString() || '');
      setSku(initialData.sku);
      setStockQuantity(initialData.stock_quantity.toString());
      setLowStockThreshold(initialData.low_stock_threshold.toString());
      setStockStatus(initialData.stock_status);
      setStatus(initialData.status);
      setFeatured(initialData.featured);
      setBestSeller(initialData.best_seller);
      setOnSale(initialData.on_sale);
      setMetaTitle(initialData.meta_title || '');
      setMetaDescription(initialData.meta_description || '');
      setMetaKeywords(initialData.meta_keywords || '');
      setTags(initialData.tags || []);
      setExistingImage(initialData.image_url);
      setImagePreview(initialData.image_url);
      setGalleryImages(initialData.gallery_images || []);
      setSlugAvailable(true);
      setSkuAvailable(true);
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setCategoryId('');
    setSubCategoryId('');
    setName('');
    setSlug('');
    setDescription('');
    setShortDescription('');
    setPrice('');
    setComparePrice('');
    setCostPrice('');
    setSku('');
    setStockQuantity('0');
    setLowStockThreshold('5');
    setStockStatus('in_stock');
    setStatus('draft');
    setFeatured(false);
    setBestSeller(false);
    setOnSale(false);
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setTags([]);
    setTagInput('');
    setImage(null);
    setImagePreview(null);
    setExistingImage(null);
    setGalleryImages([]);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setSlugAvailable(null);
    setSlugMessage('');
    setSlugSuggestion(null);
    setSkuAvailable(null);
    setSkuMessage('');
  };

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

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSku = e.target.value.toUpperCase().trim();
    setSku(newSku);
    setSkuAvailable(null);
    setSkuMessage('');
  };

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug && slug.length >= 3) {
        validateSlug(slug);
      } else if (slug && slug.length < 3 && slug.length > 0) {
        setSlugAvailable(false);
        setSlugMessage('Slug must be at least 3 characters');
      } else {
        setSlugAvailable(null);
        setSlugMessage('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sku && sku.length >= 3) {
        validateSku(sku);
      } else if (sku && sku.length < 3 && sku.length > 0) {
        setSkuAvailable(false);
        setSkuMessage('SKU must be at least 3 characters');
      } else {
        setSkuAvailable(null);
        setSkuMessage('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [sku]);

  const validateSlug = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) return;
    setCheckingSlug(true);
    try {
      const result = await ProductService.validateSlug(slugToCheck, initialData?.id);
      setSlugAvailable(result.available);
      setSlugMessage(result.message || '');
      setSlugSuggestion(result.suggested || null);
    } catch (error) {
      console.error('Error validating slug:', error);
    } finally {
      setCheckingSlug(false);
    }
  };

  const validateSku = async (skuToCheck: string) => {
    if (!skuToCheck || skuToCheck.length < 3) return;
    setCheckingSku(true);
    try {
      const result = await ProductService.validateSku(skuToCheck, initialData?.id);
      setSkuAvailable(result.available);
      setSkuMessage(result.message || '');
    } catch (error) {
      console.error('Error validating SKU:', error);
    } finally {
      setCheckingSku(false);
    }
  };

  // Image handling
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Image size exceeds 5MB limit`);
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
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
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} exceeds 5MB limit`);
        continue;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} type not allowed`);
        continue;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    setGalleryFiles(prev => [...prev, ...validFiles]);
    setGalleryPreviews(prev => [...prev, ...validPreviews]);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Tags
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    if (!sku.trim()) {
      toast.error('SKU is required');
      return;
    }

    if (!price || isNaN(parseFloat(price))) {
      toast.error('Valid price is required');
      return;
    }

    if (slugAvailable === false) {
      toast.error('Please choose a different slug');
      return;
    }

    if (skuAvailable === false) {
      toast.error('Please choose a different SKU');
      return;
    }

    // Validate slug if not checked
    if (slugAvailable === null) {
      setCheckingSlug(true);
      try {
        const result = await ProductService.validateSlug(slug, initialData?.id);
        setSlugAvailable(result.available);
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

    // Validate SKU if not checked
    if (skuAvailable === null) {
      setCheckingSku(true);
      try {
        const result = await ProductService.validateSku(sku, initialData?.id);
        setSkuAvailable(result.available);
        if (!result.available) {
          toast.error('Please choose a different SKU');
          setCheckingSku(false);
          return;
        }
      } catch (error) {
        toast.error('Failed to validate SKU');
        setCheckingSku(false);
        return;
      }
      setCheckingSku(false);
    }

    try {
      setLoading(true);
      
      let imageUrl = existingImage;
      let galleryUrls = [...galleryImages];

      // Upload main image
      if (image) {
        setUploadingImage(true);
        try {
          const uploadResult = await UploadService.uploadImage(image, 'products');
          imageUrl = uploadResult.url;
          if (existingImage && initialData?.image_url !== existingImage) {
            const oldPath = existingImage.split('/').pop();
            if (oldPath) {
              await UploadService.deleteImage(oldPath);
            }
          }
        } catch (uploadError) {
          toast.error(uploadError instanceof Error ? uploadError.message : 'Failed to upload image');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Upload gallery images
      if (galleryFiles.length > 0) {
        setUploadingImage(true);
        try {
          for (const file of galleryFiles) {
            const result = await UploadService.uploadImage(file, 'products');
            galleryUrls.push(result.url);
          }
        } catch (uploadError) {
          toast.error('Failed to upload gallery images');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const data = {
        category_id: categoryId,
        sub_category_id: subCategoryId || undefined,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        price: parseFloat(price),
        compare_price: comparePrice ? parseFloat(comparePrice) : undefined,
        cost_price: costPrice ? parseFloat(costPrice) : undefined,
        sku: sku.trim().toUpperCase(),
        stock_quantity: parseInt(stockQuantity) || 0,
        stock_status: stockStatus,
        low_stock_threshold: parseInt(lowStockThreshold) || 5,
        image_url: imageUrl || undefined,
        gallery_images: galleryUrls.length > 0 ? galleryUrls : undefined,
        status,
        featured,
        best_seller: bestSeller,
        on_sale: onSale,
        meta_title: metaTitle.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
        meta_keywords: metaKeywords.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined
      };

      await onSubmit(data);
      toast.success(initialData ? 'Product updated successfully' : 'Product created successfully');
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
      console.error(error);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const isFormValid = () => {
    return (
      categoryId &&
      name.trim() &&
      slug.trim() &&
      slugAvailable === true &&
      sku.trim() &&
      skuAvailable === true &&
      price &&
      !checkingSlug &&
      !checkingSku &&
      !uploadingImage
    );
  };

  const filteredSubCategories = subCategories.filter(
    sc => sc.category_id === categoryId
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category & Sub-category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subCategory">Sub-Category</Label>
              <Select value={subCategoryId} onValueChange={setSubCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={categoryId ? "Select a sub-category" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">None</SelectItem>
                  {filteredSubCategories.map((subCategory) => (
                    <SelectItem key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter product name"
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
                placeholder="Enter URL-friendly slug"
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
            {slugMessage && (
              <p className={cn("text-sm mt-1", slugAvailable === true ? "text-green-600" : "text-red-600")}>
                {slugMessage}
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <div className="relative">
              <Input
                id="sku"
                value={sku}
                onChange={handleSkuChange}
                placeholder="Enter unique SKU (e.g., PRD-001)"
                className={cn(
                  "pr-10",
                  skuAvailable === true && "border-green-500",
                  skuAvailable === false && "border-red-500"
                )}
                disabled={loading || uploadingImage}
                required
              />
              {checkingSku ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              ) : skuAvailable === true ? (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              ) : skuAvailable === false ? (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              ) : null}
            </div>
            {skuMessage && (
              <p className={cn("text-sm mt-1", skuAvailable === true ? "text-green-600" : "text-red-600")}>
                {skuMessage}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                disabled={loading || uploadingImage}
                required
              />
            </div>
            <div>
              <Label htmlFor="comparePrice">Compare Price</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="Original price"
                disabled={loading || uploadingImage}
              />
            </div>
            <div>
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Your cost"
                disabled={loading || uploadingImage}
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                disabled={loading || uploadingImage}
              />
            </div>
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                disabled={loading || uploadingImage}
              />
            </div>
            <div>
              <Label htmlFor="stockStatus">Stock Status</Label>
              <Select value={stockStatus} onValueChange={(value: any) => setStockStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="backorder">Backorder</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief description (appears in product cards)"
              rows={2}
              disabled={loading || uploadingImage}
            />
          </div>

          <div>
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product description"
              rows={4}
              disabled={loading || uploadingImage}
            />
          </div>

          {/* Images */}
          <div>
            <Label>Main Image</Label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={imagePreview} alt="Product preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-xs aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Upload image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <Label>Gallery Images</Label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors p-4">
              <Upload className="h-6 w-6 text-gray-400 mb-1" />
              <p className="text-sm text-gray-500">Click to upload gallery images</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleGalleryChange}
                className="hidden"
                multiple
              />
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {galleryImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {galleryPreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={preview} alt={`New gallery ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Featured</Label>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Best Seller</Label>
                <Switch checked={bestSeller} onCheckedChange={setBestSeller} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">On Sale</Label>
                <Switch checked={onSale} onCheckedChange={setOnSale} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags (press Enter)"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO title (max 60 chars)"
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO description (max 160 chars)"
              maxLength={160}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input
              id="metaKeywords"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="Comma-separated keywords"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isFormValid() || checkingSlug || checkingSku || uploadingImage}>
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadingImage ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                initialData ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}