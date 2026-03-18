import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Recipe } from '@/types/index';

export function useRecipes(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => apiClient.getRecipes(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecipeBySlug(slug: string) {
  return useQuery({
    queryKey: ['recipe', slug],
    queryFn: () => apiClient.getRecipeBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}
