"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import Link from "next/link";
import type { Task } from "@/types";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { refreshUser } = useAuth();

  async function loadTasks() {
    setError(null);
    try {
      const data = await apiRequest<Task[]>("/tasks/my");
      setTasks(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your tasks.");
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  async function handleCancel(taskId: string) {
    setBusyId(taskId);
    try {
      await apiRequest(`/tasks/${taskId}/cancel`, { method: "POST" });
      showToast("Task cancelled. Your credits are back in your balance.", "success");
      await Promise.all([loadTasks(), refreshUser()]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't cancel this task.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleComplete(taskId: string) {
    setBusyId(taskId);
    try {
      await apiRequest(`/tasks/${taskId}/complete`, { method: "POST" });
      showToast("Marked complete. Credits have been released to whoever did the work.", "success");
      await Promise.all([loadTasks(), refreshUser()]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't mark this task complete.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">My tasks</h1>
        <p className="text-stone text-sm mt-1">
          Tasks you&apos;ve posted, from waiting for an applicant to paid out.
        </p>
      </div>

      {error && (
        <EmptyState
          title="Couldn't load your tasks"
          description={error}
          action={<Button onClick={loadTasks} size="sm" variant="secondary">Try again</Button>}
        />
      )}

      {!error && tasks === null && <p className="text-sm text-stone">Loading your tasks…</p>}

      {!error && tasks !== null && tasks.length === 0 && (
        <EmptyState
          title="You haven't posted anything yet"
          description="Post a task to get help from another student — your credits stay safely escrowed until the work is done."
          action={
            <Link href="/app/create-task">
              <Button size="sm">Create your first task</Button>
            </Link>
          }
        />
      )}

      {!error && tasks && tasks.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              actions={
                <>
                  {task.status === "pending" && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busyId === task.id}
                      onClick={() => handleCancel(task.id)}
                    >
                      {busyId === task.id ? "Cancelling…" : "Cancel"}
                    </Button>
                  )}
                  {task.status === "in_progress" && (
                    <Button
                      size="sm"
                      disabled={busyId === task.id}
                      onClick={() => handleComplete(task.id)}
                    >
                      {busyId === task.id ? "Completing…" : "Mark complete"}
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
