import React from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  CircleMarker,
  Tooltip,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Map as MapIcon } from "lucide-react";

// ------------------------------------
// Station Coordinates
// ------------------------------------

const stationCoordinates = {
  "Mumbai CSMT": [18.9402, 72.8358],
  "Bhopal Jn": [23.2599, 77.4126],
  "Jhansi Jn": [25.4484, 78.5676],
  "Mathura Jn": [27.4924, 77.6737],
  "New Delhi (NDLS)": [28.6139, 77.209],
};

// ------------------------------------
// Train Icon
// ------------------------------------

const trainIcon = new L.DivIcon({
  className: "custom-train-marker",

  html: `
    <div
      style="
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #1769ff;
        border: 4px solid white;
        box-shadow: 0 4px 14px rgba(23,105,255,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      "
    >
      🚆
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// ------------------------------------
// Live Route Map
// ------------------------------------

const LiveRouteMap = ({ train, live, stations }) => {
  // ------------------------------------
  // Route coordinates
  // ------------------------------------

  const routeCoordinates = stations
    .map((station) => stationCoordinates[station.name])
    .filter(Boolean);

  // ------------------------------------
  // Current train location
  // Backend-ready
  // ------------------------------------

  const currentTrainPosition =
    live?.latitude && live?.longitude
      ? [live.latitude, live.longitude]
      : stationCoordinates["Mathura Jn"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <div className="flex items-center justify-between px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapIcon
              size={21}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Live Route
            </h2>

            <p className="text-[10px] text-slate-400">
              Track {train?.name || "Train"} on the map
            </p>
          </div>

        </div>

        {/* -------------------------------- */}
        {/* Legend */}
        {/* -------------------------------- */}

        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

            <span className="text-[10px] text-slate-600">
              Train Location
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="w-4 border-t-2 border-dashed border-blue-600" />

            <span className="text-[10px] text-slate-600">
              Route
            </span>
          </div>

        </div>

      </div>

      {/* -------------------------------- */}
      {/* Map */}
      {/* -------------------------------- */}

      <div className="px-3 pb-3">

        <div className="h-[260px] w-full rounded-xl overflow-hidden">

          <MapContainer
            center={currentTrainPosition}
            zoom={6}
            scrollWheelZoom={false}
            zoomControl={true}
            className="h-full w-full"
          >

            {/* -------------------------------- */}
            {/* Light Map */}
            {/* -------------------------------- */}

            <TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

            {/* -------------------------------- */}
            {/* Route */}
            {/* -------------------------------- */}

            {routeCoordinates.length > 1 && (
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: "#1769ff",
                  weight: 4,
                  opacity: 0.95,
                }}
              />
            )}

            {/* -------------------------------- */}
            {/* Station Markers */}
            {/* -------------------------------- */}

            {stations.map((station, index) => {
              const position =
                stationCoordinates[station.name];

              if (!position) return null;

              const isCurrent =
                station.status === "current";

              const isStart = index === 0;

              const isEnd =
                index === stations.length - 1;

              return (
                <CircleMarker
                  key={`${station.code}-${index}`}
                  center={position}
                  radius={isCurrent ? 7 : 5}
                  pathOptions={{
                    color: "#1769ff",
                    weight: 3,
                    fillColor: "#ffffff",
                    fillOpacity: 1,
                  }}
                >
                  <Tooltip
                    permanent
                    direction="right"
                    offset={[8, 0]}
                    className="train-station-label"
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#0f2a63",
                      }}
                    >
                      {isStart
                        ? "Mumbai"
                        : isEnd
                        ? "New Delhi"
                        : station.name.replace(
                            " Jn",
                            ""
                          )}
                    </span>
                  </Tooltip>

                  <Popup>
                    <div className="min-w-[120px]">
                      <p className="font-bold text-slate-900">
                        {station.name}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {station.code}
                      </p>

                      <p className="text-xs text-blue-600 mt-1">
                        {station.distance} km
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* -------------------------------- */}
            {/* Current Train */}
            {/* -------------------------------- */}

            <Marker
              position={currentTrainPosition}
              icon={trainIcon}
            >
              <Tooltip
                permanent
                direction="right"
                offset={[20, 0]}
                className="train-current-label"
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#0f2a63",
                  }}
                >
                  {live?.currentLocation || "Current Location"}
                </span>
              </Tooltip>

              <Popup>
                <div className="min-w-[170px]">

                  <p className="font-bold text-slate-900">
                    {train?.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Train No. {train?.number}
                  </p>

                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    Current Speed: {live?.speed} km/h
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {live?.currentLocation}
                  </p>

                </div>
              </Popup>
            </Marker>

          </MapContainer>

        </div>

      </div>

    </div>
  );
};

export default LiveRouteMap;