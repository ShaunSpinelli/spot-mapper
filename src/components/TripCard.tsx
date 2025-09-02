import React from 'react'
import { type Trip } from '../App'

interface TripCardProps {
  trip: Trip
  onDelete: () => void
}

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {trip.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={trip.image} 
            alt={trip.destination}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
            {trip.title}
          </h3>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            title="Delete trip"
          >
            🗑️
          </button>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <span className="text-lg mr-2">📍</span>
          <span className="font-medium">{trip.destination}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <span className="mr-1">📅</span>
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
            {calculateDays(trip.startDate, trip.endDate)} days
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3">
          {trip.description}
        </p>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg transition-colors duration-200 font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default TripCard
