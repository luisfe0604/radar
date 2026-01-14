const legendEl = document.querySelector(".legend");
const toggleBtn = document.querySelector(".legend-toggle");

toggleBtn.addEventListener("click", () => {
  const legendEl = document.querySelector(".legend");
  if (!legendEl) return;

  const hidden = legendEl.classList.toggle("hidden");
  toggleBtn.textContent = hidden ? "☰" : "✕";
});

const map = L.map("map").setView([-23.55, -46.63], 6);

let userMarker = null;

function getUserLocation({ highAccuracy }) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 12000 : 6000,
        maximumAge: 60000
      }
    );
  });
}

async function locateUser() {
  if (!("geolocation" in navigator)) {
    console.warn("Geolocalização não suportada");
    return;
  }

  try {
    // tentativa 1 — alta precisão
    const pos = await getUserLocation({ highAccuracy: true });
    applyUserLocation(pos);
  } catch (err) {
    console.warn("Alta precisão falhou, tentando baixa...", err.message);

    try {
      // tentativa 2 — baixa precisão
      const pos = await getUserLocation({ highAccuracy: false });
      applyUserLocation(pos);
    } catch (err2) {
      console.warn("Localização indisponível:", err2.message);
    }
  }
}

function applyUserLocation(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  map.flyTo([lat, lng], 8, { duration: 1.2 });

  if (userMarker) {
    userMarker.setLatLng([lat, lng]);
  } else {
    userMarker = L.circleMarker([lat, lng], {
      radius: 6,
      color: "#2564eb60",
      fillColor: "#3b83f650",
      fillOpacity: 1,
      weight: 2
    }).addTo(map);
  }
}

locateUser();


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "legend");

  div.innerHTML = `
    <div class="legend-title">Intensidade da chuva</div>

    <div class="legend-item">
      <span class="color very-light"></span> Muito fraca
    </div>
    <div class="legend-item">
      <span class="color light"></span> Fraca
    </div>
    <div class="legend-item">
      <span class="color moderate"></span> Moderada
    </div>
    <div class="legend-item">
      <span class="color strong"></span> Forte
    </div>
    <div class="legend-item">
      <span class="color very-strong"></span> Muito forte
    </div>
    <div class="legend-item">
      <span class="color extreme"></span> Extrema
    </div>
  `;

  return div;
};

map.on("zoomend", () => {
  if (currentLayer) {
    currentLayer.setOpacity(RADAR_OPACITY);
  }
});

map.on("zoom", () => {
  if (!currentLayer) return;

  const z = map.getZoom();

  const factor = Math.max(0.3, 1 - (z - 6) * 0.08);

  currentLayer.setOpacity(RADAR_OPACITY * factor);
});

map.options.zoomAnimation = false;
map.options.fadeAnimation = false;
map.createPane("radarPane");
map.getPane("radarPane").style.zIndex = 450;
map.getPane("radarPane").style.pointerEvents = "none";


legend.addTo(map);

const RADAR_OPACITY = 0.7;
const RADAR_MAX_ZOOM = 10;
const UPDATE_TIME = 3 * 60 * 1000; 
const FRAME_DELAY = 700; 
const MAX_HISTORY = 10; 

const lightningLayer = L.layerGroup();

let frames = [];
let currentLayer = null;
let updateInterval = null;
let historyInterval = null;
let mode = "live"; // live | history
let simulationInterval = null;
let simulationStep = 0;


function createRadarLayer(time) {
  return L.tileLayer(
    `https://tilecache.rainviewer.com/v2/radar/${time}/256/{z}/{x}/{y}/2/1_1.png`,
    {
      opacity: RADAR_OPACITY,
      maxNativeZoom: RADAR_MAX_ZOOM,
      maxZoom: 18,

      updateWhenZooming: false,
      updateWhenIdle: true,
      keepBuffer: 6,
      noWrap: true
    }
  );
}

function fadeLayers(oldLayer, newLayer) {
  newLayer.setOpacity(RADAR_OPACITY);

  if (!oldLayer) return;

  let opacity = RADAR_OPACITY;

  const fade = setInterval(() => {
    opacity -= 0.08;
    oldLayer.setOpacity(Math.max(opacity, 0));

    if (opacity <= 0) {
      map.removeLayer(oldLayer);
      clearInterval(fade);
    }
  }, 50);
}

function updateClock(unixTime) {
  const date = new Date(unixTime * 1000);
  document.getElementById("updateTime").textContent = date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

async function fetchFrames() {
  const res = await fetch(
    "https://api.rainviewer.com/public/weather-maps.json"
  );
  const data = await res.json();
  return data.radar.past.map((f) => f.time);
}

async function startLive() {
  mode = "live";
  stopSimulation();
  clearIntervals();

  frames = await fetchFrames();
  const lastFrame = frames[frames.length - 1];

  const newLayer = createRadarLayer(lastFrame);
  newLayer.addTo(map);
  fadeLayers(currentLayer, newLayer);

  currentLayer = newLayer;
  updateClock(lastFrame);

  updateInterval = setInterval(updateLive, UPDATE_TIME);
}

async function updateLive() {
  if (mode !== "live") return;

  const newFrames = await fetchFrames();
  const latest = newFrames[newFrames.length - 1];

  if (!frames.length || latest !== frames[frames.length - 1]) {
    frames = newFrames;

    const newLayer = createRadarLayer(latest);
    newLayer.addTo(map);
    fadeLayers(currentLayer, newLayer);

    currentLayer = newLayer;
    updateClock(latest);
  }
}

async function playHistory() {
  mode = "history";
  clearIntervals();

  frames = await fetchFrames();
  const historyFrames = frames.slice(-MAX_HISTORY);
  let index = 0;

  historyInterval = setInterval(() => {
    if (index >= historyFrames.length) {
      clearInterval(historyInterval);
      startLive();
      return;
    }

    const time = historyFrames[index];
    const newLayer = createRadarLayer(time);

    newLayer.addTo(map);
    fadeLayers(currentLayer, newLayer);

    currentLayer = newLayer;
    updateClock(time);
    index++;
  }, FRAME_DELAY);
}

function simulateFuture(minutes = 30) {
  if (!currentLayer) return;

  mode = "simulation";
  clearIntervals();
  stopSimulation();

  const container = currentLayer.getContainer();
  if (!container) return;

  let step = 0;
  const steps = minutes / 5;

  simulationInterval = setInterval(() => {
    step++;

    const offsetX = step * 14;
    const offsetY = step * 8;

    container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    if (step >= steps) {
      clearInterval(simulationInterval);
    }
  }, 700);
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }

  if (currentLayer) {
    const container = currentLayer.getContainer();
    if (container) {
      container.style.transform = "none";
    }
  }
}


function clearIntervals() {
  if (updateInterval) clearInterval(updateInterval);
  if (historyInterval) clearInterval(historyInterval);
}

document.getElementById("live").addEventListener("click", startLive);
document.getElementById("history").addEventListener("click", playHistory);
document.getElementById("simulate").addEventListener("click", () => {
  simulateFuture(30);
});

startLive();
