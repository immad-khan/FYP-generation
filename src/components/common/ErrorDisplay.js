const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="p-6 rounded-xl bg-red-500/20 border border-red-500/30">
      <div className="flex items-start">
        <i className="fas fa-exclamation-circle text-red-400 text-xl mr-3 mt-0.5"></i>
        <div className="flex-1">
          <h3 className="font-semibold text-red-300 mb-1">Something went wrong</h3>
          <p className="text-red-200 text-sm mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;