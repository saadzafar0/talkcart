'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE } from '@/core/utils/constants';

interface ProductImageProps {
  images: string[];
  name: string;
}

export function ProductImage({ images, name }: ProductImageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        <Image
          src={allImages[selectedIndex]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                idx === selectedIndex
                  ? 'border-accent-600'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
