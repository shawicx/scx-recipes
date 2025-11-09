import { invoke } from "@tauri-apps/api/core";
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
  // 将前端的驼峰命名转换为后端期望的下划线命名
  const profileDto = {
    id: profile.id,
    user_id: profile.userId,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    activity_level: profile.activityLevel,
    health_goals: profile.healthGoals,
    dietary_preferences: profile.dietaryPreferences,
    dietary_restrictions: profile.dietaryRestrictions,
    allergies: profile.allergies,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };

  return await invoke("save_health_profile", { profile: profileDto });
};

export const getHealthProfile = async (
  userId: string,
): Promise<HealthProfile | null> => {
  const result: any = await invoke("get_health_profile", { userId });

  // 如果没有结果，返回null
  if (!result) {
    return null;
  }

  // 将后端的下划线命名转换为前端期望的驼峰命名
  return {
    id: result.id,
    userId: result.user_id,
    age: result.age,
    gender: result.gender,
    weight: result.weight,
    height: result.height,
    activityLevel: result.activity_level,
    healthGoals: result.health_goals,
    dietaryPreferences: result.dietary_preferences,
    dietaryRestrictions: result.dietary_restrictions,
    allergies: result.allergies,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
};

export const deleteHealthProfile = async (userId: string): Promise<boolean> => {
  return await invoke("delete_health_profile", { userId });
};

// Recommendation Commands
export const getRecommendations = async (
  userId: string,
): Promise<RecommendationItem[]> => {
  const result: any[] = await invoke("get_recommendations", { userId });

  // 转换返回结果的字段名
  return result.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    title: item.title,
    description: item.description,
    ingredients: item.ingredients,
    nutritionalInfo: {
      calories: item.nutritional_info.calories,
      protein: item.nutritional_info.protein,
      carbs: item.nutritional_info.carbs,
      fat: item.nutritional_info.fat,
      fiber: item.nutritional_info.fiber,
    },
    preparationTime: item.preparation_time,
    difficultyLevel: item.difficulty_level,
    mealType: item.meal_type,
    recipeInstructions: item.recipe_instructions,
    createdAt: item.created_at,
    isPersonalized: item.is_personalized,
    relevanceScore: item.relevance_score,
  }));
};

export const getRecommendationById = async (
  id: string,
): Promise<RecommendationItem | null> => {
  return await invoke("get_recommendation_by_id", { id });
};

// Diet History Commands
export const logDietEntry = async (entry: DietEntry): Promise<string> => {
  // 转换字段名为后端期望的格式
  const entryDto = {
    id: entry.id,
    user_id: entry.userId,
    diet_item_id: entry.dietItemId,
    date_attempted: entry.dateAttempted,
    rating: entry.rating,
    notes: entry.notes,
    was_prepared: entry.wasPrepared,
    meal_type: entry.mealType,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };

  return await invoke("log_diet_entry", { entry: entryDto });
};

export const getDietHistory = async (
  params: GetHistoryParams,
): Promise<DietEntry[]> => {
  // 转换参数字段名
  const paramsDto = {
    user_id: params.userId,
    start_date: params.startDate,
    end_date: params.endDate,
    limit: params.limit,
    offset: params.offset,
    meal_type: params.mealType,
  };

  const result: any[] = await invoke("get_diet_history", { params: paramsDto });

  // 转换返回结果的字段名
  return result.map((entry: any) => ({
    id: entry.id,
    userId: entry.user_id,
    dietItemId: entry.diet_item_id,
    dateAttempted: entry.date_attempted,
    rating: entry.rating,
    notes: entry.notes,
    wasPrepared: entry.was_prepared,
    mealType: entry.meal_type,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));
};

export const getDietHistoryCount = async (
  params: GetHistoryParams,
): Promise<number> => {
  // 转换参数字段名
  const paramsDto = {
    user_id: params.userId,
    start_date: params.startDate,
    end_date: params.endDate,
    meal_type: params.mealType,
  };

  try {
    return await invoke("get_diet_history_count", { params: paramsDto });
  } catch (error) {
    // 如果命令不存在，使用降级方案：获取所有数据并计算长度
    console.warn(
      "get_diet_history_count command not found, using fallback method",
    );
    try {
      const fallbackParamsDto = {
        ...paramsDto,
        limit: undefined,
        offset: undefined,
      };
      const allData = await invoke("get_diet_history", {
        params: fallbackParamsDto,
      });
      return Array.isArray(allData) ? allData.length : 0;
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError);
      return 0;
    }
  }
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

// Diet History Management Functions
export const addDietHistory = async (
  userId: string,
  historyData: {
    date: string;
    mealType: string;
    foodItems: string;
    calories: number;
    notes?: string;
  }
): Promise<boolean> => {
  return await invoke("add_diet_history", {
    userId,
    date: historyData.date,
    mealType: historyData.mealType,
    foodItems: historyData.foodItems,
    calories: historyData.calories,
    notes: historyData.notes || "",
  });
};

export const updateDietHistory = async (
  id: string,
  historyData: {
    date: string;
    mealType: string;
    foodItems: string;
    calories: number;
    notes?: string;
  }
): Promise<boolean> => {
  return await invoke("update_diet_history", {
    id,
    date: historyData.date,
    mealType: historyData.mealType,
    foodItems: historyData.foodItems,
    calories: historyData.calories,
    notes: historyData.notes || "",
  });
};

export const deleteDietHistory = async (id: string): Promise<boolean> => {
  return await invoke("delete_diet_history", { id });
};
