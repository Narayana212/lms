"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImagePlus, Trash, Video } from 'lucide-react';

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
  type: string;
}

const VideoUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
  type
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  if (!isMounted) {
    return null;
  }

  return ( 
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] aspect-[16/9] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="sm">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <video
             
              className="object-cover "
            
              src={url}
            />
          </div>
        ))}
      </div>
      <CldUploadWidget onUpload={onUpload} uploadPreset="k1wxmokv">
        {({ open }) => {
          const onClick = () => {
            open();
          };

          return (
            <Button 
              type="button" 
              disabled={disabled} 
              variant="secondary" 
              onClick={onClick}
              className={` ${(value.length===1&& type==="images")?"hidden":"flex"}`}
            >
              <Video className="h-4 w-4 mr-2" />
              Upload the Video
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
 
export default VideoUpload;