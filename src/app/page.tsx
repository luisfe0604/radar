import { BrandMark } from "@/features/brand/BrandMark";
import { LayersControl } from "@/features/layers/LayersControl";
import { WeatherOverlayLayers } from "@/features/layers/WeatherOverlayLayers";
import { LayersProvider } from "@/features/layers/layers-context";
import { MapClickHandler } from "@/features/location/MapClickHandler";
import { SelectedLocationMarker } from "@/features/location/SelectedLocationMarker";
import { LocationProvider } from "@/features/location/location-context";
import { LocationPanel } from "@/features/location-panel/LocationPanel";
import { MapControls } from "@/features/map/MapControls";
import { MapDimmer } from "@/features/map/MapDimmer";
import { MapUrlSync } from "@/features/map/MapUrlSync";
import { MapView } from "@/features/map/MapView";
import { ShareButton } from "@/features/map/ShareButton";
import { RadarLayer } from "@/features/radar/RadarLayer";
import { RadarLegend } from "@/features/radar/RadarLegend";
import { RadarProvider } from "@/features/radar/radar-context";
import { RadarTimeline } from "@/features/radar/RadarTimeline";
import { SearchBox } from "@/features/search/SearchBox";
import { StreetViewModal } from "@/features/streetview/StreetViewModal";
import { StreetViewProvider } from "@/features/streetview/streetview-context";
import styles from "./page.module.css";

export default function Home() {
  return (
    <LayersProvider>
      <RadarProvider>
        <LocationProvider>
          <StreetViewProvider>
            <MapView>
              <MapDimmer />
              <RadarLayer />
              <WeatherOverlayLayers />
              <MapClickHandler />
              <SelectedLocationMarker />
              <MapControls />
              <MapUrlSync />
              <div className={styles.topLeftStack}>
                <BrandMark />
                <div className={styles.topLeftRow}>
                  <SearchBox />
                  <LayersControl />
                </div>
              </div>
              <div className={styles.bottomLeftStack}>
                <RadarLegend />
                <ShareButton />
              </div>
              <RadarTimeline />
              <LocationPanel />
            </MapView>
            <StreetViewModal />
          </StreetViewProvider>
        </LocationProvider>
      </RadarProvider>
    </LayersProvider>
  );
}
