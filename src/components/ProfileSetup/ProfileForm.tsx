import React, { useState, useEffect } from "react";
import {
  saveHealthProfile,
  getHealthProfile,
  deleteHealthProfile,
} from "../../lib/api";
import { HealthProfile } from "../../lib/types";

const ProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<HealthProfile>({
    userId: "",
    age: 0,
    gender: "prefer_not_to_say",
    weight: 0,
    height: 0,
    activityLevel: "sedentary",
    healthGoals: [],
    dietaryPreferences: [],
    dietaryRestrictions: [],
    allergies: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<HealthProfile | null>(
    null,
  );

  // Load existing profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Using a default user ID for this example - in a real app, this would be the logged-in user
        const userId = "current-user";
        const loadedProfile = await getHealthProfile(userId);
        if (loadedProfile) {
          setExistingProfile(loadedProfile);
          setProfile(loadedProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof HealthProfile,
  ) => {
    const value = e.target.value;
    // Split the input by commas and trim whitespace
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setProfile((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real app, userId might come from auth context
      const profileToSave = {
        ...profile,
        userId: profile.userId || "current-user", // default user ID
      };

      await saveHealthProfile(profileToSave);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile.userId) {
      setError("No user ID specified");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete your health profile? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteHealthProfile(profile.userId);
      // Reset the profile after deletion
      setProfile({
        userId: profile.userId || "current-user",
        age: 0,
        gender: "prefer_not_to_say",
        weight: 0,
        height: 0,
        activityLevel: "sedentary",
        healthGoals: [],
        dietaryPreferences: [],
        dietaryRestrictions: [],
        allergies: [],
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Health Profile Setup
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {existingProfile
            ? "Profile updated successfully!"
            : "Profile saved successfully!"}
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          Loading...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User ID - Read only if existing profile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={profile.userId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user ID"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={profile.age || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="18"
              max="120"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={profile.weight || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              step="0.1"
              required
            />
          </div>

          {/* Height */}
          <div>
            <label
              htmlFor="height"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={profile.height || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          {/* Activity Level */}
          <div>
            <label
              htmlFor="activityLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Activity Level
            </label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">
                Sedentary (little or no exercise)
              </option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">
                Moderate (exercise 3-5 days/week)
              </option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very_active">
                Very Active (hard exercise daily)
              </option>
            </select>
          </div>

          {/* Health Goals */}
          <div className="md:col-span-2">
            <label
              htmlFor="healthGoals"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Health Goals (comma separated)
            </label>
            <input
              type="text"
              id="healthGoals"
              value={profile.healthGoals.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "healthGoals")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., weight_loss, muscle_gain, maintain"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple goals with commas
            </p>
          </div>

          {/* Dietary Preferences */}
          <div className="md:col-span-2">
            <label
              htmlFor="dietaryPreferences"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dietary Preferences (comma separated)
            </label>
            <input
              type="text"
              id="dietaryPreferences"
              value={profile.dietaryPreferences.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "dietaryPreferences")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., vegetarian, low_carb, keto"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple preferences with commas
            </p>
          </div>

          {/* Dietary Restrictions */}
          <div className="md:col-span-2">
            <label
              htmlFor="dietaryRestrictions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dietary Restrictions (comma separated)
            </label>
            <input
              type="text"
              id="dietaryRestrictions"
              value={profile.dietaryRestrictions.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "dietaryRestrictions")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., gluten_free, dairy_free, nut_free"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple restrictions with commas
            </p>
          </div>

          {/* Allergies */}
          <div className="md:col-span-2">
            <label
              htmlFor="allergies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Allergies (comma separated)
            </label>
            <input
              type="text"
              id="allergies"
              value={profile.allergies.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "allergies")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., nuts, shellfish, soy"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple allergies with commas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading
              ? "Saving..."
              : existingProfile
                ? "Update Profile"
                : "Save Profile"}
          </button>

          {existingProfile && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Delete Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
