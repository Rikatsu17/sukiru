"use client";

import { FormEvent, useState } from "react";

interface ApplyModalProps {
  taskTitle: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export function ApplyModal({ taskTitle, onClose, onSubmit }: ApplyModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-rule rounded-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-medium mb-1">Apply for &ldquo;{taskTitle}&rdquo;</h3>
        <p className="text-sm text-stone mb-4">
          A short note helps the task owner see why you&apos;re a good fit.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="I've done a few React projects and can have this turned around in two days…"
            className="w-full border border-rule rounded-md px-3.5 py-2.5 text-sm bg-paper text-ink placeholder:text-stone/60 focus:border-ink transition-colors resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-stone hover:text-ink transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium hover:bg-stamp-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Send application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
