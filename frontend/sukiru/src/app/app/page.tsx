"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { TaskCard } from "@/components/TaskCard";
import { ApplyModal } from "@/components/ApplyModal";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import type { Task } from "@/types";

export default function OpenTasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<Task | null>(null);
  const { showToast } = useToast();

  async function loadTasks() {
    setError(null);
    try {
      const data = await apiRequest<Task[]>("/tasks/open");
      setTasks(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load open tasks.");
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  async function handleApply(message: string) {
    if (!applyingTo) return;
    try {
      await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({ task_id: applyingTo.id, message }),
      });
      showToast("Application sent. Check My Applications for updates.", "success");
      setApplyingTo(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't send your application.", "error");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Open tasks</h1>
        <p className="text-stone text-sm mt-1">
          Browse what other students need help with and apply with a short note.
        </p>
      </div>

      {error && (
        <EmptyState
          title="Couldn't load tasks"
          description={error}
          action={<Button onClick={loadTasks} size="sm" variant="secondary">Try again</Button>}
        />
      )}

      {!error && tasks === null && (
        <p className="text-sm text-stone">Loading open tasks…</p>
      )}

      {!error && tasks !== null && tasks.length === 0 && (
        <EmptyState
          title="Nothing open right now"
          description="Every task on the board has already been taken. Check back soon, or post one of your own."
        />
      )}

      {!error && tasks && tasks.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              actions={
                <Button size="sm" onClick={() => setApplyingTo(task)}>
                  Apply
                </Button>
              }
            />
          ))}
        </div>
      )}

      {applyingTo && (
        <ApplyModal
          taskTitle={applyingTo.title}
          onClose={() => setApplyingTo(null)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
}
