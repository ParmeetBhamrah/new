import React from 'react'
import './index.css'

function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        <h1 className="main-heading">
          NAMASTE Medical Code Translation
        </h1>
        
        <div className="card">
          <h2 className="section-heading">Test Vanilla CSS</h2>
          <p className="description-text">
            This is a clean frontend setup using vanilla CSS. 
            If you can see the styled elements below, CSS is working correctly!
          </p>
          
          <div className="test-grid">
            <div className="color-box red-box">Red Box</div>
            <div className="color-box green-box">Green Box</div>
            <div className="color-box blue-box">Blue Box</div>
          </div>
          
          <button className="test-button">
            Test Button
          </button>
        </div>

        <div className="card">
          <h2 className="section-heading">Ready for Development</h2>
          <p className="description-text">
            The frontend is now set up with vanilla CSS and ready for building 
            the medical code translation interface. All styling is handled through 
            standard CSS classes defined in index.css.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App