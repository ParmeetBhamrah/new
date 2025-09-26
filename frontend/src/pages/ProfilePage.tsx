import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, MapPin, Shield } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        await refreshProfile();
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [refreshProfile]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <p className="text-gray-500">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  const profileFields = [
    {
      label: 'ABHA ID',
      value: user.abha_id,
      icon: Shield,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Full Name',
      value: user.name,
      icon: User,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Email Address',
      value: user.email,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Phone Number',
      value: user.phone,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Date of Birth',
      value: user.dob,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Address',
      value: user.address,
      icon: MapPin,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Information</h1>
        <p className="text-gray-600">Your ABHA account details and personal information</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileFields.map((field, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200"
            >
              <div className={`p-2 rounded-lg ${field.bgColor}`}>
                <field.icon className={`w-5 h-5 ${field.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {field.label}
                </div>
                <div className="text-gray-900 font-medium break-words">
                  {field.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Account created: {new Date(user.created_at).toLocaleDateString()}</span>
            <span>Gender: {user.gender === 'M' ? 'Male' : 'Female'}</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Security Notice</h3>
            <p className="text-sm text-blue-700">
              Your ABHA ID is a unique identifier for accessing healthcare services. 
              Keep your login credentials secure and do not share them with others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;