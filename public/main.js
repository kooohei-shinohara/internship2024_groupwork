document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.682839, 139.759455], 10);

    async function layerData() {
        response = await fetch("/api/baseMaps", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const baseMaps = await response.json();

        const satellite = L.tileLayer(baseMaps[0].url, {
            attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors'
        });

        const aviation = L.tileLayer(baseMaps[1].url, {
            attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a> contributors'
        });

    const osm = L.tileLayer(baseMaps[2].url, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });


        const baseLayers = {
            "OpenStreetMap": osm,
            "Satellite": satellite,
            "Aviation": aviation
        };

    osm.addTo(map);
    
    // スケールバーの追加
    L.control.scale({
        position:"bottomright"
    }).addTo(map);

        // スケールバーの追加
        L.control.scale().addTo(map);

        // レイヤーコントロールの追加 UI
        L.control.layers(baseLayers).addTo(map);
    }

    let tsunamiLayer;
    let shelterLayer;
    async function loadOverLayMapsData() {
        try {
            const response = await fetch('/api/overLayMaps', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch overLayMaps data');
            }
            const data = await response.json();
            shelterLayer = L.geoJSON(data[1], {
                pointToLayer: (feature, latlng) => L.marker(latlng),
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`<strong>${feature.properties.P20_002}</strong>`);
                }
            }).addTo(map);
            tsunamiLayer = L.geoJSON(data[0], {
                style: {
                    color: 'blue',
                    weight: 2,
                    opacity: 0.5
                }
            }).addTo(map);
        } catch (error) {
            console.error('Error fetching shelters data:', error);
        }
    }
    // ズームレベルに応じた洪水レイヤーの表示/非表示
    map.on('zoomend', () => {
        if (tsunamiLayer) {
            if (map.getZoom() < 15) {
                map.removeLayer(tsunamiLayer);
            } else {
                if (!map.hasLayer(tsunamiLayer)) {
                    map.addLayer(tsunamiLayer);
                }
            }
        }
    });


    // 検索ボタンのイベントリスナーをDOMContentLoadedの中で定義
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            if (shelterLayer) {
                shelterLayer.eachLayer((layer) => {
                    const shelterName = layer.feature.properties.P20_002.toLowerCase();
                    if (shelterName.includes(searchInput)) {
                        map.setView(layer.feature.geometry.coordinates[0], 15);
                        layer.openPopup();
                    }
                });
            }
        });
    }
    // 現在地表示機能
    function showCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('現在地')
                    .openPopup();
                map.setView([lat, lng], 15);
            }, (error) => {
                console.error('Error getting location:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }


    layerData();
    loadOverLayMapsData();
    showCurrentLocation();
});