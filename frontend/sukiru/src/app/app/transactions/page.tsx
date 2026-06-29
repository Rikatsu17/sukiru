"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  async function loadTransactions() {
    setError(null);
    try {
      const data = await apiRequest<Transaction[]>("/transactions/my");
      setTransactions(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your transactions.");
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Transactions</h1>
        <p className="text-stone text-sm mt-1">
          Every credit that has moved in or out of your balance.
        </p>
      </div>

      {error && (
        <EmptyState
          title="Couldn't load your transactions"
          description={error}
          action={<Button onClick={loadTransactions} size="sm" variant="secondary">Try again</Button>}
        />
      )}

      {!error && transactions === null && (
        <p className="text-sm text-stone">Loading your ledger…</p>
      )}

      {!error && transactions !== null && transactions.length === 0 && (
        <EmptyState
          title="Your ledger is empty"
          description="Complete a task or have one of yours completed, and the credit transfer will show up here."
        />
      )}

      {!error && transactions && transactions.length > 0 && (
        <div className="bg-white border border-rule rounded-lg overflow-hidden">
          <ul className="ruled-bg divide-y divide-rule">
            {transactions.map((tx) => {
              const isIncoming = tx.receiver_id === user?.id;
              return (
                <li key={tx.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">
                      {tx.task_title || `Task ${tx.task_id}`}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm whitespace-nowrap shrink-0 ${
                      isIncoming ? "text-teel" : "text-stone"
                    }`}
                  >
                    {isIncoming ? "+" : "-"}
                    {tx.amount} cr
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
