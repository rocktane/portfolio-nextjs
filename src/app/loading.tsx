export default function Loading() {
  return (
    <div className="min-h-screen pt-16 px-8 md:px-14">
      {/* Hero skeleton */}
      <div className="py-8 md:py-10">
        <div className="h-16 md:h-24 bg-gray-200 rounded-lg animate-pulse w-3/4 mb-4" />
        <div className="h-16 md:h-24 bg-gray-200 rounded-lg animate-pulse w-2/3" />
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-64 bg-yellow/50 rounded-3xl animate-pulse md:row-span-2" />
        <div className="h-32 bg-yellow/50 rounded-3xl animate-pulse md:col-span-2" />
        <div className="h-48 bg-gray-200 rounded-3xl animate-pulse" />
        <div className="h-32 bg-yellow/50 rounded-3xl animate-pulse" />
      </div>
    </div>
  );
}
