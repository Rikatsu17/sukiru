"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import Link from "next/link";
import type { Application } from "@/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadApplications() {
    setError(null);
    try {
      const data = await apiRequest<Application[]>("/applications/my");
      setApplications(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your applications.");
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">My applications</h1>
        <p className="text-stone text-sm mt-1">
          Every task you&apos;ve applied for, and where it stands.
        </p>
      </div>

      {error && (
        <EmptyState
          title="Couldn't load your applications"
          description={error}
          action={<Button onClick={loadApplications} size="sm" variant="secondary">Try again</Button>}
        />
      )}

      {!error && applications === null && (
        <p className="text-sm text-stone">Loading your applications…</p>
      )}

      {!error && applications !== null && applications.length === 0 && (
        <EmptyState
          title="No applications yet"
          description="When you apply to an open task, you'll be able to track its status here."
          action={
            <Link href="/app">
              <Button size="sm">Browse open tasks</Button>
            </Link>
          }
        />
      )}

      {!error && applications && applications.length > 0 && (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white border border-rule rounded-lg p-5 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-medium">
                  {application.task_title || `Task ${application.task_id}`}
                </h3>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-sm text-stone leading-relaxed">
                {application.message || "No message attached."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
