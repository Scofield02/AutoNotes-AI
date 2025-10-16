import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  
  const baseClasses = `
    inline-flex items-center justify-center px-6 py-3 border border-transparent 
    text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500
    disabled:cursor-not-allowed
    transition-all duration-300
  `;

  const variantClasses = {
    primary: `
      text-white bg-cyan-600 hover:bg-cyan-700
      disabled:bg-gray-600/50 disabled:text-gray-400
      button-glow
    `,
    secondary: `
      text-gray-200 bg-gray-700 hover:bg-gray-600
      disabled:bg-gray-800 disabled:text-gray-500
    `
  };

  return (
    <button
      {...props}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;