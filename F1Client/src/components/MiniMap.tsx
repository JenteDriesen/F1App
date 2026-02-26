import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MiniMapProps {
    lat: number;
    lng: number;
}

export default function MiniMap({ lat, lng }: MiniMapProps) {
    const position: LatLngExpression = [lat, lng];

    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: 200, width: 200, borderRadius: 12 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
        </MapContainer>
    )
}