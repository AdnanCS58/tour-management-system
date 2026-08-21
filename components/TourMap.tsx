'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default markers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TourMapProps {
  members: any[];
  userLocation: { lat: number; lng: number } | null;
  locationSharing: boolean;
  currentUserId: string;
}

// Locator Button Component - Google Maps style
function LocatorButton({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  const handleLocate = () => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1.5,
      });
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            16,
            { duration: 1.5 }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
      <div className="leaflet-control">
        <button
          onClick={handleLocate}
          className="locator-btn"
          title="My location"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function TourMap({ members, userLocation, locationSharing, currentUserId }: TourMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]); // Default to Dhaka
  const [mapKey, setMapKey] = useState(0);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapKey(prev => prev + 1);
    }
  }, [userLocation]);

  const membersWithLocation = members.filter(
    (member) => member.locationSharing && member.lastLocation?.lat
  );

  const getUserIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color};" class="marker-pin"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });
  };

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
  };

  return (
    <div className="map-wrapper" style={{ height: '500px', position: 'relative' }}>
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User's own location */}
        {locationSharing && userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={100}
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }}
            />
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">You are here</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Other members' locations */}
        {membersWithLocation.map((member, index) => {
          if (member.user?._id === currentUserId) return null;
          
          const memberName = member.user?.name || 'Unknown';
          
          return (
            <Marker
              key={member.user?._id || index}
              position={[member.lastLocation.lat, member.lastLocation.lng]}
              icon={getUserIcon(colors[index % colors.length])}
              eventHandlers={{
                click: () => handleMemberClick(member),
              }}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{memberName}</p>
                  {member.user?.contactInfo && member.user?.shareContact && (
                    <p className="text-sm text-gray-600">{member.user.contactInfo}</p>
                  )}
                  {member.lastLocation?.updatedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {new Date(member.lastLocation.updatedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Locator Button - Right side below zoom controls */}
        <LocatorButton userLocation={userLocation} />
      </MapContainer>

      {/* Selected Member Info Panel */}
      {selectedMember && (
        <div className="member-info-panel">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-[#e8f0eb]">
              {selectedMember.user?.name || 'Unknown'}
            </p>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-[#6b7a72] hover:text-[#e8f0eb]"
            >
              ✕
            </button>
          </div>
          {selectedMember.lastLocation && (
            <div className="text-sm text-[#a0b0a8]">
              <p>Lat: {selectedMember.lastLocation.lat.toFixed(6)}</p>
              <p>Lng: {selectedMember.lastLocation.lng.toFixed(6)}</p>
              <p className="text-xs text-[#6b7a72] mt-1">
                Updated: {new Date(selectedMember.lastLocation.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
          {selectedMember.user?.contactInfo && selectedMember.user?.shareContact && (
            <p className="text-sm text-[#a0b0a8] mt-2">
              📞 {selectedMember.user.contactInfo}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .locator-btn {
          background: #121816;
          border: 1px solid #2a322e;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
        }
        .locator-btn:hover {
          background: #1a211e;
          border-color: #10b981;
          transform: scale(1.05);
        }
        .custom-div-icon {
          background: none;
          border: none;
        }
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          margin: -15px 0 0 -15px;
          border: 3px solid #0a0f0d;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }
        .map-wrapper {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid #2a322e;
        }
        .member-info-panel {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: #121816;
          border: 1px solid #2a322e;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          max-width: 250px;
        }
        :global(.leaflet-container) {
          background: #0a0f0d !important;
          font-family: inherit;
        }
        :global(.leaflet-tile) {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7) !important;
        }
        :global(.leaflet-control-zoom) {
          border: 1px solid #2a322e !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        :global(.leaflet-control-zoom a) {
          background: #121816 !important;
          color: #e8f0eb !important;
          border-color: #2a322e !important;
        }
        :global(.leaflet-control-zoom a:hover) {
          background: #1a211e !important;
        }
        :global(.leaflet-control-attribution) {
          background: rgba(10, 15, 13, 0.8) !important;
          color: #6b7a72 !important;
        }
        :global(.leaflet-control-attribution a) {
          color: #a0b0a8 !important;
        }
        :global(.leaflet-popup-content-wrapper) {
          background: #121816 !important;
          color: #e8f0eb !important;
          border: 1px solid #2a322e;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        :global(.leaflet-popup-tip) {
          background: #121816 !important;
          border: 1px solid #2a322e;
        }
        :global(.leaflet-popup-close-button) {
          color: #6b7a72 !important;
        }
        :global(.leaflet-popup-close-button:hover) {
          color: #e8f0eb !important;
        }
      `}</style>
    </div>
  );
}