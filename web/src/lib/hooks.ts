import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFleet,
  fetchVivariumStatus,
  createVivarium,
  stopVivarium,
  deleteVivarium,
  fetchHubHealth,
  fetchMe,
  updateMe,
} from "./api";

export function useFleet() {
  return useQuery({
    queryKey: ["fleet"],
    queryFn: fetchFleet,
    refetchInterval: 10_000,
  });
}

export function useVivariumStatus(id: number | null) {
  return useQuery({
    queryKey: ["fleet", id, "status"],
    queryFn: () => fetchVivariumStatus(id!),
    enabled: id !== null,
  });
}

export function useHubHealth() {
  return useQuery({
    queryKey: ["hub-health"],
    queryFn: fetchHubHealth,
    refetchInterval: 30_000,
  });
}

export function useCreateVivarium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, runtime }: { name: string; runtime?: string }) =>
      createVivarium(name, runtime),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet"] }),
  });
}

export function useStopVivarium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stopVivarium(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet"] }),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { telegramId: number }) => updateMe(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useDeleteVivarium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVivarium(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet"] }),
  });
}
