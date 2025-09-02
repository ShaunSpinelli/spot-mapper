import React, { useState } from 'react'

export interface UserProfile {
  name: string
  surname: string
  age: number
}

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void
  initialData?: UserProfile | null
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: initialData?.name || '',
    surname: initialData?.surname || '',
    age: initialData?.age || 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required'
    }

    if (formData.age <= 0 || formData.age > 150) {
      newErrors.age = 'Please enter a valid age (1-150)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center mb-6">
        <div className="text-2xl mr-3">👤</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">User Profile</h3>
          <p className="text-gray-600 text-sm">Tell us a bit about yourself</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.surname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.surname && (
              <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
            )}
          </div>
        </div>
        
        <div className="max-w-xs">
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            Age *
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            min="1"
            max="150"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your age"
          />
          {errors.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age}</p>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {initialData ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserProfileForm
