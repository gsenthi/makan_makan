export default function LoadingSpinner({ small = false }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-gray-800 ${
        small ? "w-4 h-4" : "w-8 h-8"
      }`}
    />
  );
}
