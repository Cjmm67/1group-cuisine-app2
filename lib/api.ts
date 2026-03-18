import { Recipe, Chef, Masterclass, Job, Supplier, WasteLog, User } from '@/types/index';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Recipes
  async getRecipes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Recipe[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return this.request(`/recipes?${queryParams}`);
  }

  async getRecipeBySlug(slug: string): Promise<Recipe> {
    return this.request(`/recipes/${slug}`);
  }

  async createRecipe(data: Partial<Recipe>): Promise<Recipe> {
    return this.request('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chefs
  async getChefs(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Chef[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return this.request(`/chefs?${queryParams}`);
  }

  async getChefBySlug(slug: string): Promise<Chef> {
    return this.request(`/chefs/${slug}`);
  }

  // Masterclasses
  async getMasterclasses(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Masterclass[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/masterclasses?${queryParams}`);
  }

  async getMasterclassBySlug(slug: string): Promise<Masterclass> {
    return this.request(`/masterclasses/${slug}`);
  }

  // Jobs
  async getJobs(params?: {
    page?: number;
    limit?: number;
    cuisine?: string;
    location?: string;
  }): Promise<{ data: Job[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params?.location) queryParams.append('location', params.location);

    return this.request(`/jobs?${queryParams}`);
  }

  async getJobById(id: string): Promise<Job> {
    return this.request(`/jobs/${id}`);
  }

  // Suppliers
  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Supplier[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return this.request(`/suppliers?${queryParams}`);
  }

  // Waste Logs
  async getWasteLogs(chefId: string): Promise<WasteLog[]> {
    return this.request(`/waste-logs?chefId=${chefId}`);
  }

  async createWasteLog(data: Partial<WasteLog>): Promise<WasteLog> {
    return this.request('/waste-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getCurrentUser(): Promise<User> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) throw new Error('No auth token');

    return this.request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export const apiClient = new ApiClient();
