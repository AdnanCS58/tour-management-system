'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

export default function TourMap({ members, userLocation, locationSharing, currentUserId }: TourMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]); // Default to Dhaka

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
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

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: '500px' }}>
      <MapContainer
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
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
            />
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {/* Other members' locations */}
        {membersWithLocation.map((member, index) => {
          if (member.user._id === currentUserId) return null;
          
          return (
            <Marker
              key={member.user._id}
              position={[member.lastLocation.lat, member.lastLocation.lng]}
              icon={getUserIcon(colors[index % colors.length])}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{member.user.name}</p>
                  {member.user.contactInfo && member.user.shareContact && (
                    <p className="text-sm text-gray-600">{member.user.contactInfo}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <style jsx>{`
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
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}