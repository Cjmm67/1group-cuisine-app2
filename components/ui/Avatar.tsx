import React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, image, size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    if (image) {
      return (
        <div
          ref={ref}
          className={cn(
            'rounded-full overflow-hidden bg-gold-100 flex items-center justify-center',
            sizes[size],
            className
          )}
          {...props}
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full bg-gold-500 text-white font-semibold flex items-center justify-center',
          sizes[size],
          className
        )}
        {...props}
      >
        {getInitials(name)}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
