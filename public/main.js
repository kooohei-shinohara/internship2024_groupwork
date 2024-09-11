document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.682839, 139.759455], 10);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    osm.addTo(map);
    
    // スケールバーの追加
    L.control.scale().addTo(map);

    async function loadSheltersData() {
        try {
            const response = await fetch('http://localhost:3002/api/emergency_shelters');
            if (!response.ok) {
                throw new Error('Failed to fetch shelters data');
            }
            const data = await response.json();
            const shelterLayer = L.geoJSON(data, {
                pointToLayer: (feature, latlng) => L.marker(latlng),
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        showInfoTable(feature.properties);
                    });
                    layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
                }
            }).addTo(map);
        } catch (error) {
            console.error('Error fetching shelters data:', error);
        }
    }

    function showInfoTable(properties) {
        const infoTableBody = document.getElementById('infoTableBody');
        infoTableBody.innerHTML = ''; // 既存の行をクリア

        for (const [key, value] of Object.entries(properties)) {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            keyCell.textContent = key;
            const valueCell = document.createElement('td');
            valueCell.textContent = value;
            row.appendChild(keyCell);
            row.appendChild(valueCell);
            infoTableBody.appendChild(row);
        }
    }

    // 検索ボタンのイベントリスナーをDOMContentLoadedの中で定義
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            if (shelterLayer) {
                shelterLayer.eachLayer((layer) => {
                    const shelterName = layer.feature.properties.name.toLowerCase();
                    if (shelterName.includes(searchInput)) {
                        map.setView(layer.getLatLng(), 15);
                        layer.openPopup();
                        showInfoTable(layer.feature.properties); // 検索結果を表示
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



    loadSheltersData();
    showCurrentLocation();
});