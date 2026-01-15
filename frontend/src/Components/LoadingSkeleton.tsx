const LoadingSkeleton = () => {
  return (
    <div className="p-5 border border-border  bg-card my-4  rounded-2xl">
      <div
        role="status"
        className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
      >
        <div className="w-full">
          <div className="h-2.5 bg-gray-700 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          <div className="h-2 bg-gray-700 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-700 rounded-full dark:bg-gray-700 mb-5"></div>
          <div className="flex gap-2">
            <div className="h-5 rounded-md bg-gray-700 w-10 "></div>
            <div className="h-5 rounded-md bg-gray-700 w-20 "></div>
            <div className="h-5 rounded-md bg-gray-700 w-10 "></div>
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
