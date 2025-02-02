import { create } from 'zustand'
import { StateCreator } from 'zustand'

interface LoadingState {
  // Global loading state
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
  
  // Component-specific loading states
  loadingStates: Record<string, boolean>
  setLoading: (component: string, loading: boolean) => void
  isLoading: (component: string) => boolean
  
  // Route change loading
  isRouteChanging: boolean
  setRouteChanging: (loading: boolean) => void
  
  // Data fetching states
  fetchingStates: Record<string, boolean>
  setFetching: (key: string, loading: boolean) => void
  isFetching: (key: string) => boolean
}

type LoadingStateCreator = StateCreator<LoadingState>

export const useLoadingStore = create<LoadingState>((set, get): LoadingState => ({
  // Global loading
  isGlobalLoading: false,
  setGlobalLoading: (loading: boolean) => set({ isGlobalLoading: loading }),
  
  // Component loading
  loadingStates: {},
  setLoading: (component: string, loading: boolean) => 
    set((state: LoadingState) => ({
      loadingStates: {
        ...state.loadingStates,
        [component]: loading,
      },
    })),
  isLoading: (component: string) => get().loadingStates[component] || false,
  
  // Route change loading
  isRouteChanging: false,
  setRouteChanging: (loading: boolean) => set({ isRouteChanging: loading }),
  
  // Data fetching
  fetchingStates: {},
  setFetching: (key: string, loading: boolean) =>
    set((state: LoadingState) => ({
      fetchingStates: {
        ...state.fetchingStates,
        [key]: loading,
      },
    })),
  isFetching: (key: string) => get().fetchingStates[key] || false,
})) 