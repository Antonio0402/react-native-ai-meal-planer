import { useCallback, useEffect, useState } from "react";

/** Hủy request cũ khi tham số đổi và giữ lỗi để màn hình có thể thử lại. */
export function useApiQuery<T>(
  load: (signal: AbortSignal) => Promise<T>,
  initialValue: T,
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    load?: typeof load;
    attempt: number;
    value: T;
    error?: string;
  }>({
    attempt: -1,
    value: initialValue,
  });
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setResult({ load, attempt, value });
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setResult((previous) => ({
            load,
            attempt,
            value: previous.value,
            error: e instanceof Error ? e.message : "Không tải được dữ liệu.",
          }));
      });
    return () => controller.abort();
  }, [load, attempt]);
  const loading = result.load !== load || result.attempt !== attempt;
  return {
    value: result.value,
    loading,
    error: loading ? undefined : result.error,
    retry,
  };
}
