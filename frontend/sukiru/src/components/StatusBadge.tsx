import type { ApplicationStatus, TaskStatus, TransactionStatus } from "@/types";

type Status = TaskStatus | ApplicationStatus | TransactionStatus;

const styles: Record<string, string> = {
  pending: "bg-paper-dim text-stone border-rule",
  in_progress: "bg-steel/10 text-steel border-steel/30",
  completed: "bg-teel/10 text-teel border-teel/30",
  cancelled: "bg-danger/10 text-danger border-danger/30",
  accepted: "bg-teel/10 text-teel border-teel/30",
  rejected: "bg-danger/10 text-danger border-danger/30",
  escrowed: "bg-stamp/10 text-stamp-dark border-stamp/30",
  released: "bg-teel/10 text-teel border-teel/30",
  refunded: "bg-paper-dim text-stone border-rule",
};

const labels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  accepted: "Accepted",
  rejected: "Declined",
  escrowed: "Escrowed",
  released: "Released",
  refunded: "Refunded",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border font-mono uppercase tracking-wide ${styles[status] ?? styles.pending}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
