import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { ApiError, getAppData, saveAppData } from './services/api';
import { appData as validAppData } from './services/api-schema';
import { initialData } from './services/meal-utils';
import type { AppData } from './types';

export { initialData } from './services/meal-utils';
type Draft = { data: AppData; revision: number; mutationId: string; pending?: AppData };

/** Giữ bản nháp cục bộ; tuần tự hóa PUT và không ghi đè dữ liệu mới từ thiết bị khác. */
export function useAppData(userId: string) {
  const draftKey = 'freshplan.draft.' + userId;
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState<string>();
  const [conflict, setConflict] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef<AppData | undefined>(undefined);
  const acknowledged = useRef<AppData | undefined>(undefined);
  const revision = useRef(0);
  const draft = useRef<Draft | undefined>(undefined);
  const running = useRef(false);
  const blocked = useRef(false);
  const storageTail = useRef<Promise<void>>(Promise.resolve());
  const storeDraft = useCallback((value?: Draft) => {
    const operation = storageTail.current.then(() => value
      ? AsyncStorage.setItem(draftKey, JSON.stringify(value))
      : AsyncStorage.removeItem(draftKey));
    storageTail.current = operation.catch(() => {});
    return operation;
  }, [draftKey]);
  const lifecycle = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    lifecycle.current = controller;
    if (ready) return () => controller.abort();
    (async () => {
      try {
        const record = await getAppData(userId, controller.signal);
        const raw = await AsyncStorage.getItem(draftKey);
        if (controller.signal.aborted) return;
        let cached: Draft | undefined;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Draft>;
          if (validAppData(parsed.data) && typeof parsed.revision === 'number' && Number.isSafeInteger(parsed.revision)
            && parsed.revision >= 0 && (parsed.pending === undefined || validAppData(parsed.pending)) && typeof parsed.mutationId === 'string' && parsed.mutationId) cached = parsed as Draft;
          else throw new Error('Bản nháp cục bộ không hợp lệ; chưa ghi đè dữ liệu.');
        }
        acknowledged.current = record.data;
        revision.current = record.revision;
        blocked.current = false;
        setConflict(false);
        let next = record.data;
        if (cached && JSON.stringify(cached.data) !== JSON.stringify(record.data)) {
          draft.current = cached;
          revision.current = cached.revision;
          next = cached.pending ?? cached.data;
          if (cached.revision !== record.revision) {
            blocked.current = true;
            setConflict(true);
            setSyncError('Bản nháp và dữ liệu máy chủ khác phiên bản. Thay đổi của bạn đang được giữ trên máy.');
          }
        } else {
          draft.current = undefined;
          if (cached?.pending && JSON.stringify(cached.pending) !== JSON.stringify(record.data)) {
            next = cached.pending;
            draft.current = { data: next, revision: record.revision, mutationId: randomUUID() };
            await storeDraft(draft.current);
          } else {
            await storeDraft();
          }
        }
        // Sang tuần mới: giữ kho/hồ sơ, bỏ lịch tuần cũ và đồng bộ trạng thái mới.
        const currentWeek = initialData().weekStart;
        if (next.weekStart !== currentWeek) next = { ...next, weekStart: currentWeek, slots: {}, savedPlan: undefined, checked: {} };
        if (controller.signal.aborted) return;
        setData(next);
        setReady(true);
      } catch (error) {
        if (!controller.signal.aborted) setSyncError(error instanceof Error ? error.message : 'Không tải được dữ liệu.');
      }
    })();
    return () => controller.abort();
  }, [userId, draftKey, attempt, ready, storeDraft]);

  useEffect(() => {
    if (!ready) return;
    pending.current = data;
    if (draft.current) {
      draft.current = { ...draft.current, pending: data };
      void storeDraft(draft.current).catch(() => setSyncError('Không lưu được bản nháp cục bộ.'));
    }
    const signal = lifecycle.current?.signal;
    if (!signal || signal.aborted || running.current || blocked.current) return;
    const drain = async () => {
      running.current = true;
      setSaving(true);
      try {
        while (!signal.aborted && pending.current && pending.current !== acknowledged.current) {
          // Khi thử lại phải dùng lại đúng payload/id của PUT chưa nhận được phản hồi.
          const change = draft.current ?? { data: pending.current, revision: revision.current, mutationId: randomUUID() };
          draft.current = { ...change, pending: pending.current };
          await storeDraft(draft.current);
          if (signal.aborted) return;
          const result = await saveAppData(userId, change.data, change.revision, change.mutationId, signal);
          if (signal.aborted) return;
          acknowledged.current = change.data;
          revision.current = result.revision;
          draft.current = undefined;
        }
        if (!signal.aborted) {
          await storeDraft();
          setSyncError(undefined);
        }
      } catch (error) {
        if (!signal.aborted) {
          blocked.current = true;
          setConflict(error instanceof ApiError && (error.status === 409 || error.status === 412));
          setSyncError((error instanceof Error ? error.message : 'Không lưu được dữ liệu.') + ' Bản nháp được giữ trên máy.');
        }
      } finally {
        running.current = false;
        if (!signal.aborted) {
          setSaving(false);
          // Có thể nhận thay đổi mới trong lúc xóa bản nháp cuối hàng đợi.
          if (!blocked.current && pending.current !== acknowledged.current) void drain();
        }
      }
    };
    void drain();
  }, [data, ready, userId, draftKey, attempt, storeDraft]);

  const retrySync = useCallback(() => {
    blocked.current = false;
    setSyncError(undefined);
    setAttempt(n => n + 1);
  }, []);

  // Chỉ gọi sau khi người dùng xác nhận bỏ bản nháp trong UI.
  const discardDraft = useCallback(async () => {
    if (running.current) return;
    try {
      await storeDraft();
      draft.current = undefined;
      pending.current = undefined;
      blocked.current = false;
      setReady(false);
      setConflict(false);
      setAttempt(n => n + 1);
    } catch {
      setSyncError('Không xóa được bản nháp. Thay đổi của bạn vẫn được giữ.');
    }
  }, [storeDraft]);

  return { data, setData, ready, saving, syncError, conflict, retrySync, discardDraft };
}