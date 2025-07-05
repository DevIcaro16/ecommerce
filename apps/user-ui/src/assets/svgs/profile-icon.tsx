import React from 'react';

interface ProfileIconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({
    size = 40,
    className = '',
    color = 'currentColor'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Círculo interno para a cabeça - fundo branco */}
            <circle
                cx="12"
                cy="10"
                r="3"
                fill="white"
                stroke={color}
                strokeWidth="1"
            />

            {/* Corpo/forma de perfil - mais achatado */}
            <path
                d="M8 18C8 16.8954 9.79086 16 12 16C14.2091 16 16 16.8954 16 18"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
};

export default ProfileIcon;
