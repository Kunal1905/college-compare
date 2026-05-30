import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="cc-card p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-lg font-semibold text-primary">
        0
      </div>
      <h3 className="text-2xl font-semibold text-on-surface">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
};
