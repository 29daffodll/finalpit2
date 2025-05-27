import React from 'react';

const LoadingOrError = ({ loading, error, loadingText = 'Loading...', children }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 text-gray-500 text-lg">
        {loadingText}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-32 text-red-600 text-lg">
        {error}
      </div>
    );
  }
  return <>{children}</>;
};

export default LoadingOrError; 