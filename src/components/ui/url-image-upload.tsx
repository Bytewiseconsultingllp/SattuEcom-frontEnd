import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface URLImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function URLImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  className,
}: URLImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Validate image URL
  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      setIsValidating(true);
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type");
      return response.ok && contentType?.startsWith("image/");
    } catch (error) {
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Add URL to images
  const handleAddUrl = async () => {
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      toast.error("Invalid URL format");
      return;
    }

    if (value.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate it's an image
    const isValid = await validateImageUrl(trimmedUrl);
    if (!isValid) {
      toast.error("URL is not a valid image or is not accessible");
      return;
    }

    onChange([...value, trimmedUrl]);
    setUrlInput("");
    toast.success("Image URL added");
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const text = e.dataTransfer.getData("text/plain");
      if (text) {
        setUrlInput(text);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
      toast.success("Image removed");
    },
    [value, onChange]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* URL Input Area */}
      {value.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <LinkIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Paste image URL</span>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddUrl}
                disabled={isValidating || !urlInput.trim()}
              >
                {isValidating ? "Validating..." : "Add"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Paste image URLs from Cloudinary, Imgur, or any image hosting service
            </p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label>Added Images ({value.length}/{maxImages})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {value.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
              >
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 bg-secondary hover:bg-secondary/80 rounded flex items-center justify-center"
                    title="Open image in new tab"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </a>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images added yet</p>
          <p className="text-xs mt-1">Paste image URLs above to add them</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>💡 Tip:</strong> Use image URLs from Cloudinary, Imgur, or any CDN. 
          First image will be the primary product image.
        </p>
      </div>
    </div>
  );
}
