"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { TextField, TextAreaField } from "@/components/Field";
import { Button } from "@/components/Button";
import { CreditStamp } from "@/components/CreditStamp";

export default function CreateTaskPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credits = Number(form.get("credits"));

    if (user && credits > user.credits) {
      showToast(`You only have ${user.credits} credits to escrow.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: String(form.get("title") || "").trim(),
          description: String(form.get("description") || "").trim(),
          credits,
        }),
      });
      showToast("Task posted. Your credits are now escrowed.", "success");
      await refreshUser();
      router.push("/app/my-tasks");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't create the task.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Create a task</h1>
        <p className="text-stone text-sm mt-1">
          Describe what you need. Your credits are escrowed the moment you post —
          the person who takes the job is paid the instant you confirm it&apos;s done.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-rule rounded-xl p-6 flex flex-col gap-4"
      >
        <TextField
          label="Title"
          name="title"
          required
          minLength={3}
          maxLength={100}
          placeholder="e.g. Code review for my React project"
        />
        <TextAreaField
          label="Description"
          name="description"
          rows={4}
          maxLength={500}
          placeholder="What exactly do you need, and by when?"
        />
        <TextField
          label="Credits"
          name="credits"
          type="number"
          required
          min={1}
          max={user?.credits ?? 1}
          defaultValue={1}
          hint={`You currently have ${user?.credits ?? 0} ${user?.credits === 1 ? "credit" : "credits"} available.`}
        />
        <div className="flex items-center justify-between pt-2 border-t border-rule mt-1">
          <CreditStamp size="sm" />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Escrowing…" : "Create task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
