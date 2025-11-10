import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadProductImages, compressImage, validateImageFile } from "@/lib/api/upload";

interface CloudinaryImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
  folder?: string;
}

export function CloudinaryImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
  className,
  folder,
}: CloudinaryImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    
    // Check max images limit
    if (value.length + filesArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed. You can add ${maxImages - value.length} more.`);
      return;
    }

    // Validate all files first
    for (let i = 0; i < filesArray.length; i++) {
      const validation = validateImageFile(filesArray[i], { maxSizeMB });
      if (!validation.valid) {
        toast.error(`${filesArray[i].name}: ${validation.error}`);
        return;
      }
    }

    try {
      setIsUploading(true);
      
      // Compress images before upload
      const compressedFiles: File[] = [];
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 25 }));
        
        try {
          const compressed = await compressImage(file, 1920, 0.85);
          compressedFiles.push(compressed);
          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
        } catch (error) {
          console.error(`Failed to compress ${file.name}:`, error);
          compressedFiles.push(file); // Use original if compression fails
        }
      }

      // Upload to Cloudinary
      const result = await uploadProductImages(compressedFiles);
      
      if (result.success && result.data) {
        const newUrls = result.data.map(img => img.url);
        onChange([...value, ...newUrls]);
        
        // Mark all as complete
        filesArray.forEach(file => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        });
        
        toast.success(`${filesArray.length} image(s) uploaded successfully`);
        
        // Clear progress after a delay
        setTimeout(() => setUploadProgress({}), 1000);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload images");
      setUploadProgress({});
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [value, maxImages]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Remove image
  const removeImage = useCallback(
    (index: number) => {
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
      toast.success("Image removed");
    },
    [value, onChange]
  );

  // Trigger file input
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />

          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-1">
                {isUploading ? "Uploading images..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WEBP up to {maxSizeMB}MB each
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {value.length}/{maxImages} images added
              </p>
            </div>

            {!isUploading && (
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[200px]">{filename}</span>
                    <span className="flex items-center gap-1">
                      {progress === 100 ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        `${progress}%`
                      )}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Images ({value.length}/{maxImages})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
              >
                <img
                  src={imageUrl}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="h-8 w-8"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-semibold">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !isUploading && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
          <p className="text-xs mt-1">Click or drag images to upload</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>☁️ Cloudinary:</strong> Images are automatically uploaded to Cloudinary, compressed, and optimized for web. 
          The first image will be the primary product image.
        </p>
      </div>
    </div>
  );
}
