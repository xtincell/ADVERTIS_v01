// ==========================================================================
// HOOK — useOptimisticMutation
// Wrapper around tRPC mutations with toast notifications and loading state.
// ==========================================================================

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseOptimisticMutationOptions<TInput, TOutput> {
  /** The tRPC mutation hook result (.mutateAsync) */
  mutationFn: (input: TInput) => Promise<TOutput>;
  /** Toast message on success */
  successMessage?: string;
  /** Toast message on error (or function that receives the error) */
  errorMessage?: string | ((error: unknown) => string);
  /** Callback after successful mutation */
  onSuccess?: (data: TOutput) => void;
  /** Callback after failed mutation */
  onError?: (error: unknown) => void;
}

interface UseOptimisticMutationReturn<TInput> {
  /** Execute the mutation */
  execute: (input: TInput) => Promise<void>;
  /** Whether the mutation is in progress */
  isLoading: boolean;
}

/**
 * Wraps a tRPC mutation with consistent toast notifications and loading state.
 *
 * @example
 * const updateMutation = api.pillar.update.useMutation();
 * const { execute, isLoading } = useOptimisticMutation({
 *   mutationFn: updateMutation.mutateAsync,
 *   successMessage: "Contenu sauvegardé.",
 *   errorMessage: "Erreur lors de la sauvegarde.",
 * });
 */
export function useOptimisticMutation<TInput, TOutput = unknown>({
  mutationFn,
  successMessage = "Sauvegardé.",
  errorMessage = "Une erreur est survenue.",
  onSuccess,
  onError,
}: UseOptimisticMutationOptions<TInput, TOutput>): UseOptimisticMutationReturn<TInput> {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      try {
        const result = await mutationFn(input);
        if (successMessage) toast.success(successMessage);
        onSuccess?.(result);
      } catch (err) {
        const msg =
          typeof errorMessage === "function" ? errorMessage(err) : errorMessage;
        if (msg) toast.error(msg);
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, successMessage, errorMessage, onSuccess, onError],
  );

  return { execute, isLoading };
}
