import React from "react";
import ProfileForm from "./ProfileForm";

const ProfileSetup: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Health Profile Setup
      </h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-6 text-center">
            Please fill in your health information to get personalized diet
            recommendations. All data is stored securely on your device.
          </p>

          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
