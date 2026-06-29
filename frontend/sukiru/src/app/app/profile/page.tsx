"use client";

import { FormEvent, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { TextField, TextAreaField } from "@/components/Field";
import { Button } from "@/components/Button";
import { CreditStamp } from "@/components/CreditStamp";
import type { User } from "@/types";

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const updated = await apiRequest<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: String(form.get("full_name") || "").trim(),
          bio: String(form.get("bio") || "").trim(),
          faculty: String(form.get("faculty") || "").trim(),
          course: String(form.get("course") || "").trim(),
          avatar_url: String(form.get("avatar_url") || "").trim() || null,
        }),
      });
      updateLocalUser(updated);
      showToast("Profile saved.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't save your profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Profile</h1>
        <p className="text-stone text-sm mt-1">
          This is what other students see when you apply to their tasks.
        </p>
      </div>

      <div className="bg-white border border-rule rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-stone">Current balance</p>
          <p className="font-display text-3xl font-medium mt-1">{user.credits} credits</p>
        </div>
        <CreditStamp size="md" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-rule rounded-xl p-6 flex flex-col gap-4"
      >
        <TextField
          label="Full name"
          name="full_name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={user.full_name}
        />
        <TextField label="Email" name="email" type="email" defaultValue={user.email} disabled />
        <TextAreaField
          label="Bio"
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={user.bio || ""}
          placeholder="What can you help with? What are you hoping to learn?"
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Faculty" name="faculty" maxLength={100} defaultValue={user.faculty || ""} />
          <TextField label="Course" name="course" maxLength={100} defaultValue={user.course || ""} />
        </div>
        <TextField
          label="Avatar URL"
          name="avatar_url"
          type="url"
          defaultValue={user.avatar_url || ""}
        />
        <div className="flex justify-end pt-2 border-t border-rule mt-1">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
