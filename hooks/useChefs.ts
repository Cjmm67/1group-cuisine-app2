import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useChefs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['chefs', params],
    queryFn: () => apiClient.getChefs(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChefBySlug(slug: string) {
  return useQuery({
    queryKey: ['chef', slug],
    queryFn: () => apiClient.getChefBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}
