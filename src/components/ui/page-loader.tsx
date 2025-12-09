import { LoadingSpinner } from "./loading-spinner";

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" className="text-primary" />
    </div>
  );
}
