import React from 'react'

export const JourneyLoader: React.FC<{ className?: string, text?: string }> = ({ className = '', text = 'Exploring...' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Mountain/Background */}
                <path
                    d="M 10 90 L 35 40 L 60 80 L 85 20 L 95 90" 
                    fill="none" 
                    stroke="#E5E7EB" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
                
                {/* Animated Trail */}
                <path
                    d="M 10 90 L 35 40 L 60 80 L 85 20 L 95 90" 
                    fill="none" 
                    stroke="#FBAE3D" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeDasharray="250"
                    strokeDashoffset="250"
                    className="animate-trail-journey"
                />
                
                {/* Hiker / Dot */}
                <circle cx="0" cy="0" r="3" fill="#FBAE3D" className="opacity-0"> 
                    <animateMotion 
                        dur="2s" 
                        repeatCount="indefinite"
                        path="M 10 90 L 35 40 L 60 80 L 85 20 L 95 90"
                    />
                    <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
                </circle>
            </svg>
            
            <style jsx>{`
                .animate-trail-journey {
                    animation: dash 2s ease-in-out infinite;
                }
                @keyframes dash {
                    0% { stroke-dashoffset: 250; }
                    50% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -250; opacity: 0; }
                }
            `}</style>
        </div>
        
        {text && (
             <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                {text}
             </p>
        )}
    </div>
  )
}
