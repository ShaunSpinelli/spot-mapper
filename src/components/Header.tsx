import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🗺️</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Trip</h1>
              <p className="text-gray-600">Plan and organize your adventures</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Trips
            </a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Destinations
            </a>
            <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Profile
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
