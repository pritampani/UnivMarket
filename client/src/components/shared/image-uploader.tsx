import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadImageToImgBB } from "@/utils/imgbb-utils";

interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string) => void;
  buttonText?: string;
  multiple?: boolean;
  className?: string;
}

export function ImageUploader({
  onImageUploaded,
  buttonText = "Upload Image",
  multiple = false,
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const file = files[0];
      const imageUrl = await uploadImageToImgBB(file);
      
      setUploadedImage(imageUrl);
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message === "File too large" ? "Maximum file size is 9MB" : (err.message || "Failed to upload image"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Image Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              multiple={multiple}
              disabled={isUploading}
            />
            
            {isUploading && (
              <div className="text-center py-2">
                <span className="text-sm">Uploading...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-500 p-2 rounded text-sm">
                {error}
              </div>
            )}
            
            {uploadedImage && !isUploading && (
              <div className="mt-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="max-w-full max-h-64 rounded-md mx-auto object-contain"
                />
                <p className="text-xs mt-2 text-center break-all">{uploadedImage}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Images are uploaded to ImgBB. Max file size is 10MB.
        </p>
      </CardFooter>
    </Card>
  );
}

export default ImageUploader;