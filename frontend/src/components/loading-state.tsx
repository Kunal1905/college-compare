type LoadingStateProps = {
  title?: string;
  description?: string;
};

export const LoadingState = ({
  title = "Loading colleges",
  description = "Fetching the latest results for you.",
}: LoadingStateProps) => {
  return (
    <div className="cc-card mx-auto max-w-2xl p-10 text-center">
      <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-surface-container border-t-primary" />
      <h3 className="text-2xl font-semibold text-on-surface">{title}</h3>
      <p className="mt-3 text-sm text-on-surface-variant">{description}</p>
    </div>
  );
};
