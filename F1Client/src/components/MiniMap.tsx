import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MiniMapProps {
    lat: number;
    lng: number;
}

export default function MiniMap({ lat, lng }: MiniMapProps) {
    const position: LatLngExpression = [lat, lng];

    return (
        <div className="border border-danger rounded overflow-hidden" style={{ height: 300, width: 300, borderRadius: 12 }}>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: 300, width: 300 }} >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
        </div>
    )
}