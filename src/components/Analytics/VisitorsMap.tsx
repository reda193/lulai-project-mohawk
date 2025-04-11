'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the WorldMap component with no SSR
const WorldMap = dynamic(
  () => import('react-svg-worldmap'),
  { ssr: false } // This prevents the component from being rendered on the server
);

const WorldMapWithTraffic = () => {
  // Use state to control rendering
  const [isClient, setIsClient] = useState(false);
  // State for hover information
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    country: string;
    description: string;
  } | null>(null);
  
  // Only render the map component on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Function to convert geographical coordinates to SVG coordinates
  // Uses a more accurate Mercator-like projection
  const geoToSvgPosition = (lon: number, lat: number): { x: number; y: number } => {
    // Longitude: -180 to 180 maps to approximately 60 to 940 in the SVG
    const x = ((lon + 180) / 360) * 880 + 60;
    
    // Latitude: Mercator projection has a non-linear mapping
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = 250 - (mercN * 250 / Math.PI);
    
    return { x, y };
  };
  
  // Sample traffic data with varying volumes and country names
  // Format: [longitude, latitude, trafficVolume, countryName, description]
  const trafficData: [number, number, number, string, string][] = [
    // North America
    [-100, 40, 3, "United States", "High traffic volume"],
    [-110, 60, 2, "Canada", "Medium traffic volume"],
    [-99, 19, 2, "Mexico", "Medium traffic volume"],
    
    // Europe
    [2, 48, 3, "France", "High traffic volume"],
    [10, 51, 3, "Germany", "High traffic volume"],
    [-0.1, 51, 2, "United Kingdom", "Medium traffic volume"],
    [9, 45, 2, "Italy", "Medium traffic volume"],
    [15, 60, 1, "Scandinavia", "Low traffic volume"],
    [20, 55, 1, "Eastern Europe", "Low traffic volume"],
    
    // Asia
    [116, 40, 3, "China", "High traffic volume"],
    [139, 36, 3, "Japan", "High traffic volume"],
    [78, 22, 3, "India", "High traffic volume"],
    [103, 1, 2, "Singapore", "Medium traffic volume"],
    [101, 13, 1, "Thailand", "Low traffic volume"],
    
    // Australia/Oceania
    [149, -35, 2, "Australia", "Medium traffic volume"],
    [174, -41, 1, "New Zealand", "Low traffic volume"],
    
    // South America
    [-58, -34, 2, "Argentina", "Medium traffic volume"],
    [-47, -15, 2, "Brazil", "Medium traffic volume"],
    [-77, -12, 1, "Peru", "Low traffic volume"],
    
    // Africa
    [18, 9, 2, "Nigeria", "Medium traffic volume"],
    [25, -29, 2, "South Africa", "Medium traffic volume"],
    [31, 30, 1, "Egypt", "Low traffic volume"],
    [36, -1, 1, "Kenya", "Low traffic volume"],
  ];

  // Empty data array for the world map
  const emptyData: any[] = [];
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">World Map</h2>
      <div className="w-full h-96 bg-gray-50 rounded-lg relative overflow-hidden">
        {isClient && (
          <div className="absolute inset-0 flex items-center mr-10 justify-center">
            <div className="">
              <WorldMap
                color="#000000"
                backgroundColor="#f9fafb"
                borderColor="#e5e7eb"
                size="lg"
                data={emptyData}
                frame={false}
                styleFunction={() => ({
                  fill: "#e2e8f0",
                  stroke: "#4a5568",
                  strokeWidth: 1,
                  fillOpacity: 0.7
                })}
              />
              
              {/* Traffic indicator dots overlay */}
              <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                viewBox="0 0 1000 500" 
                preserveAspectRatio="xMidYMid meet"
              >
                {trafficData.map((point, index) => {
                  // Get SVG position using our improved conversion function
                  const position = geoToSvgPosition(point[0], point[1]);
                  
                  // Determine dot size based on traffic volume
                  let radius: number;
                  switch(point[2]) {
                    case 1: radius = 3; break;  // Small traffic
                    case 2: radius = 6; break;  // Medium traffic
                    case 3: radius = 10; break; // Large traffic
                    default: radius = 3;
                  }
                  
                  return (
                    <circle
                      key={index}
                      cx={position.x}
                      cy={position.y}
                      r={radius}
                      fill="black"
                      opacity="0.8"
                      className="cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                      onMouseEnter={() => setHoverInfo({ 
                        x: position.x, 
                        y: position.y, 
                        country: point[3], 
                        description: point[4]
                      })}
                      onMouseLeave={() => setHoverInfo(null)}
                    />
                  );
                })}
                
                {/* Tooltip for hover information */}
                {hoverInfo && (
                  <g>
                    <rect
                      x={hoverInfo.x + 10}
                      y={hoverInfo.y - 40}
                      width="160"
                      height="60"
                      rx="4"
                      fill="white"
                      stroke="#4a5568"
                      strokeWidth="1"
                    />
                    <text
                      x={hoverInfo.x + 20}
                      y={hoverInfo.y - 15}
                      fontFamily="sans-serif"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#000000"
                    >
                      {hoverInfo.country}
                    </text>
                    <text
                      x={hoverInfo.x + 20}
                      y={hoverInfo.y + 5}
                      fontFamily="sans-serif"
                      fontSize="12"
                      fill="#4a5568"
                    >
                      {hoverInfo.description}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}

    </div>
  );
};

export default WorldMapWithTraffic;