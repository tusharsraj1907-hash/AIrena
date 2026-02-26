import React from 'react';
import { AnimatedLogo } from './AnimatedLogo';

interface BrandingProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
    className?: string;
    showText?: boolean;
}

export const Branding: React.FC<BrandingProps> = ({
    size = 'md',
    className = '',
    showText = true
}) => {
    return (
        <AnimatedLogo size={size} showText={showText} className={className} />
    );
};
