import { invoke } from "@tauri-apps/api/tauri";
import {
  HealthProfile,
  RecommendationItem,
  DietEntry,
  GetHistoryParams,
  UpdateDietEntryParams,
  Recipe,
  SearchRecipesParams,
  AppConfig,
} from "./types";

// Health Profile Commands
export const saveHealthProfile = async (
  profile: HealthProfile,
): Promise<string> => {
  return await invoke("save_health_profile", { profile });
};

export const getHealthProfile = async (
  userId: string,
): Promise<HealthProfile | null> => {
  return await invoke("get_health_profile", { userId });
};

export const deleteHealthProfile = async (userId: string): Promise<boolean> => {
  return await invoke("delete_health_profile", { userId });
};

// Recommendation Commands
export const getRecommendations = async (
  userId: string,
): Promise<RecommendationItem[]> => {
  return await invoke("get_recommendations", { userId });
};

export const getRecommendationById = async (
  id: string,
): Promise<RecommendationItem | null> => {
  return await invoke("get_recommendation_by_id", { id });
};

// Diet History Commands
export const logDietEntry = async (entry: DietEntry): Promise<string> => {
  return await invoke("log_diet_entry", { entry });
};

export const getDietHistory = async (
  params: GetHistoryParams,
): Promise<DietEntry[]> => {
  return await invoke("get_diet_history", { params });
};

export const updateDietEntry = async (
  params: UpdateDietEntryParams,
): Promise<boolean> => {
  return await invoke("update_diet_entry", { params });
};

// Recipe Commands
export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  return await invoke("get_recipe_by_id", { id });
};

export const searchRecipes = async (
  params: SearchRecipesParams,
): Promise<Recipe[]> => {
  return await invoke("search_recipes", { params });
};

// Configuration Commands
export const getConfig = async (): Promise<AppConfig> => {
  return await invoke("get_config");
};

export const setConfig = async (config: AppConfig): Promise<boolean> => {
  return await invoke("set_config", { config });
};
