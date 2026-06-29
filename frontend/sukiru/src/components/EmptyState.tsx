interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-rule rounded-lg px-6 py-12 text-center flex flex-col items-center gap-3">
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="text-sm text-stone max-w-sm">{description}</p>
      {action}
    </div>
  );
}
