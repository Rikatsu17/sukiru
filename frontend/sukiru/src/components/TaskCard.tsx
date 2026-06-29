import { ReactNode } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function TaskCard({ task, actions, footer }: TaskCardProps) {
  return (
    <article className="bg-white border border-rule rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-medium leading-snug">{task.title}</h3>
        <span className="font-mono text-sm text-stamp-dark whitespace-nowrap shrink-0">
          {task.credits} cr
        </span>
      </div>
      <p className="text-sm text-stone leading-relaxed">
        {task.description || "No description provided."}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={task.status} />
        {task.owner_name && (
          <span className="text-xs text-stone">posted by {task.owner_name}</span>
        )}
        {task.executor_name && (
          <span className="text-xs text-stone">taken by {task.executor_name}</span>
        )}
      </div>
      {footer}
      {actions && <div className="flex gap-2 pt-1">{actions}</div>}
    </article>
  );
}
