import { useNavigate } from 'react-router-dom';

export default function Error500() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Server Error</h2>
        <p className="text-gray-600 mb-8">
          Sorry, something went wrong on our server. Please try again later.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
