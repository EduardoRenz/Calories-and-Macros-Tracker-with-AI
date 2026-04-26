import React from 'react';
import Image from 'next/image';

interface AvatarProps {
    name?: string;
    size?: number;
    className?: string;
    photoURL?: string | null;
}

export const Avatar: React.FC<AvatarProps> = ({
    name = 'User',
    size = 40,
    className = '',
    photoURL
}) => {
    // If photoURL is provided, use the image
    if (photoURL) {
        return (
            <div
                className={`overflow-hidden ${className}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                }}
            >
                <Image
                    src={photoURL}
                    alt={name || 'User'}
                    width={size}
                    height={size}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // Generate consistent color based on name
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const backgroundColor = stringToColor(name);
    const initials = getInitials(name);

    return (
        <div
            data-testid="avatar"
            className={`flex items-center justify-center text-white font-semibold ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor,
                fontSize: `${size * 0.4}px`,
                borderRadius: '50%',
            }}
        >
            {initials}
        </div>
    );
};

export default Avatar;
