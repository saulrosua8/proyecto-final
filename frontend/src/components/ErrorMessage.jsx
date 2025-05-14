import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ErrorMessage() {
  const location = useLocation();
  const error = location.state?.error;
  if (!error) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span className="block sm:inline">{error}</span>
    </div>
  );
}
