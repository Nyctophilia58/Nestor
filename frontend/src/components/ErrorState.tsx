interface Props {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ message = "Something went wrong", onRetry }: Props) => {
  return (
    <div className="text-center py-20 glass rounded-2xl text-white/40">
      <p className="text-5xl mb-4">⚠️</p>
      <p className="font-medium text-white/60 mb-1">{message}</p>
      <p className="text-sm mb-6">
        Please check your connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-blue-500/80 backdrop-blur text-white text-sm rounded-lg hover:bg-blue-500 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
