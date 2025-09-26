import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          NAMASTE Medical Code Translation
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Tailwind CSS</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
            <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
            <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors">
            Test Button
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-gray-600">
            This is a minimal frontend setup. If you can see the colored boxes and styling above, 
            Tailwind CSS is working correctly!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App