export function AuthLoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary"
          aria-hidden="true"
        />
        <p className="text-sm font-bold text-muted">
          جارٍ التحقق من تسجيل الدخول...
        </p>
      </div>
    </div>
  );
}
