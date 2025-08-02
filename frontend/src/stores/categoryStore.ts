import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryFilters, 
  CategoryStats,
  CategoryTreeNode,
  MoveCategoryData,
  SortCategoriesData,
  CategoryReorderData
} from '@/types';
import { apiClient } from '@/lib/api/client';

interface CategoryState {
  // State
  categories: Category[];
  rootCategories: Category[];
  categoryTree: CategoryTreeNode[];
  selectedCategory: Category | null;
  categoryStats: CategoryStats | null;
  loading: boolean;
  error: string | null;
  filters: CategoryFilters;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategoryTree: () => Promise<void>;
  fetchRootCategories: () => Promise<void>;
  fetchCategory: (id: string) => Promise<void>;
  fetchCategoryStats: (id: string) => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  moveCategory: (data: MoveCategoryData) => Promise<void>;
  sortCategories: (data: SortCategoriesData) => Promise<void>;
  reorderCategoriesDragDrop: (data: CategoryReorderData) => Promise<void>;
  searchCategories: (query: string) => Promise<Category[]>;
  
  // Filter and utility actions
  setFilters: (filters: Partial<CategoryFilters>) => void;
  clearFilters: () => void;
  toggleCategoryExpansion: (categoryId: string) => void;
  buildCategoryTree: (categories: Category[]) => CategoryTreeNode[];
  getCategoryPath: (categoryId: string) => Category[];
  getCategoryChildren: (categoryId: string) => Category[];
  
  // Reset actions
  clearSelectedCategory: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialFilters: CategoryFilters = {
  search: '',
  page: 1,
  limit: 50,
};

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        categories: [],
        rootCategories: [],
        categoryTree: [],
        selectedCategory: null,
        categoryStats: null,
        loading: false,
        error: null,
        filters: initialFilters,

        // Fetch all categories
        fetchCategories: async () => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.get<Category[]>('/categories');
            const categories = response.data;
            set({
              categories,
              categoryTree: get().buildCategoryTree(categories),
              loading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar categorías',
              loading: false
            });
          }
        },

        // Fetch categories as tree structure
        fetchCategoryTree: async () => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.get<Category[]>('/categories?tree=true');
            const categories = response.data;
            set({
              categories,
              categoryTree: get().buildCategoryTree(categories),
              loading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar árbol de categorías',
              loading: false
            });
          }
        },

        // Fetch root categories only
        fetchRootCategories: async () => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.get<Category[]>('/categories/root');
            set({
              rootCategories: response.data,
              loading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar categorías principales',
              loading: false
            });
          }
        },

        // Fetch single category
        fetchCategory: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.get<Category>(`/categories/${id}`);
            set({
              selectedCategory: response.data,
              loading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar categoría',
              loading: false
            });
          }
        },

        // Fetch category statistics
        fetchCategoryStats: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.get<CategoryStats>(`/categories/${id}/stats`);
            set({
              categoryStats: response.data,
              loading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error al cargar estadísticas',
              loading: false
            });
          }
        },

        // Create new category
        createCategory: async (data: CreateCategoryData) => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.post<Category>('/categories', data);
            const newCategory = response.data;
            
            const currentCategories = get().categories;
            const updatedCategories = [...currentCategories, newCategory];
            
            set({
              categories: updatedCategories,
              categoryTree: get().buildCategoryTree(updatedCategories),
              loading: false
            });
            
            return newCategory;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear categoría';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Update category
        updateCategory: async (id: string, data: UpdateCategoryData) => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.patch<Category>(`/categories/${id}`, data);
            const updatedCategory = response.data;
            
            const currentCategories = get().categories;
            const updatedCategories = currentCategories.map(cat =>
              cat.id === id ? updatedCategory : cat
            );
            
            set({
              categories: updatedCategories,
              categoryTree: get().buildCategoryTree(updatedCategories),
              selectedCategory: get().selectedCategory?.id === id ? updatedCategory : get().selectedCategory,
              loading: false
            });
            
            return updatedCategory;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar categoría';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Delete category
        deleteCategory: async (id: string) => {
          set({ loading: true, error: null });
          try {
            await apiClient.delete(`/categories/${id}`);
            
            const currentCategories = get().categories;
            const updatedCategories = currentCategories.filter(cat => cat.id !== id);
            
            set({ 
              categories: updatedCategories,
              categoryTree: get().buildCategoryTree(updatedCategories),
              selectedCategory: get().selectedCategory?.id === id ? null : get().selectedCategory,
              loading: false 
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar categoría';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Move category to new parent
        moveCategory: async (data: MoveCategoryData) => {
          set({ loading: true, error: null });
          try {
            const response = await apiClient.patch<Category>(`/categories/${data.categoryId}`, {
              parentId: data.newParentId
            });
            const updatedCategory = response.data;
            
            const currentCategories = get().categories;
            const updatedCategories = currentCategories.map(cat =>
              cat.id === data.categoryId ? updatedCategory : cat
            );
            
            set({
              categories: updatedCategories,
              categoryTree: get().buildCategoryTree(updatedCategories),
              loading: false
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al mover categoría';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Sort categories
        sortCategories: async (data: SortCategoriesData) => {
          set({ loading: true, error: null });
          try {
            // Update each category's order
            await Promise.all(
              data.categories.map(cat => 
                apiClient.patch(`/categories/${cat.id}`, { order: cat.order })
              )
            );
            
            // Refresh categories
            await get().fetchCategories();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al ordenar categorías';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Reorder categories with drag & drop
        reorderCategoriesDragDrop: async (data: CategoryReorderData) => {
          set({ loading: true, error: null });
          try {
            const { draggedCategoryId, targetCategoryId, position, newParentId, newOrder } = data;
            
            // Update the dragged category
            const updateData: { order: number; parentId?: string } = { order: newOrder };
            if (newParentId !== undefined) {
              updateData.parentId = newParentId;
            }
            
            await apiClient.patch(`/categories/${draggedCategoryId}`, updateData);
            
            // If we need to update other categories' orders, do it here
            // This might be needed if we're inserting between existing categories
            
            // Refresh categories to get the updated tree
            await get().fetchCategories();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al reordenar categorías';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Search categories
        searchCategories: async (query: string) => {
          try {
            const response = await apiClient.get<Category[]>(`/categories/search?name=${encodeURIComponent(query)}`);
            return response.data;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al buscar categorías';
            set({ error: errorMessage });
            throw new Error(errorMessage);
          }
        },

        // Set filters
        setFilters: (newFilters: Partial<CategoryFilters>) => {
          set({ filters: { ...get().filters, ...newFilters } });
        },

        // Clear filters
        clearFilters: () => {
          set({ filters: initialFilters });
        },

        // Toggle category expansion in tree view
        toggleCategoryExpansion: (categoryId: string) => {
          const updateTreeNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
            return nodes.map(node => {
              if (node.id === categoryId) {
                return { ...node, expanded: !node.expanded };
              }
              if (node.children.length > 0) {
                return { ...node, children: updateTreeNode(node.children) };
              }
              return node;
            });
          };

          set({ categoryTree: updateTreeNode(get().categoryTree) });
        },

        // Build category tree structure
        buildCategoryTree: (categories: Category[]): CategoryTreeNode[] => {
          const buildTree = (parentId: string | null = null, level: number = 0): CategoryTreeNode[] => {
            return categories
              .filter(cat => cat.parentId === parentId)
              .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
              .map(cat => ({
                ...cat,
                level,
                expanded: false,
                children: buildTree(cat.id, level + 1)
              }));
          };

          return buildTree();
        },

        // Get category path (breadcrumb)
        getCategoryPath: (categoryId: string): Category[] => {
          const categories = get().categories;
          const path: Category[] = [];
          
          const findPath = (id: string): boolean => {
            const category = categories.find(cat => cat.id === id);
            if (!category) return false;
            
            path.unshift(category);
            
            if (category.parentId) {
              return findPath(category.parentId);
            }
            
            return true;
          };
          
          findPath(categoryId);
          return path;
        },

        // Get category children
        getCategoryChildren: (categoryId: string): Category[] => {
          return get().categories.filter(cat => cat.parentId === categoryId);
        },

        // Clear selected category
        clearSelectedCategory: () => {
          set({ selectedCategory: null, categoryStats: null });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Reset store
        reset: () => {
          set({
            categories: [],
            rootCategories: [],
            categoryTree: [],
            selectedCategory: null,
            categoryStats: null,
            loading: false,
            error: null,
            filters: initialFilters,
          });
        },
      }),
      {
        name: 'category-store',
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    { name: 'CategoryStore' }
  )
);

// Selector hooks for optimized subscriptions
export const useCategoryTree = () => useCategoryStore(state => state.categoryTree);
export const useSelectedCategory = () => useCategoryStore(state => state.selectedCategory);
export const useCategoryLoading = () => useCategoryStore(state => state.loading);
export const useCategoryError = () => useCategoryStore(state => state.error);
export const useCategoryFilters = () => useCategoryStore(state => state.filters);