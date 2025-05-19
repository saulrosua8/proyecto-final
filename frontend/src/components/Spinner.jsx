import React from 'react';

const Spinner = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    default: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-indigo-500 border-t-transparent`}>
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner; 