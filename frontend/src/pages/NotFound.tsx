import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-light rounded-2xl p-10 text-center max-w-md">
        <p className="text-6xl mb-4">🧭</p>
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <p className="text-white/50 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
