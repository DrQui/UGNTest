const SHEET_ID = "10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";
const API_KEY = "AIzaSyBPYtzf_E8mcQ1yzoh_KcocT87CTslTruE";
const SHEET_RANGE = "UGN Mission Partners";

let map;
let markers = []; // To store all markers for filtering

async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const rows = data.values;
  return rows;
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
    zoom: 10,
  });

  fetchSheetData().then((rows) => {
    rows.slice(1).forEach((row) => {
      const [name, address, type, iconUrl, imageUrl] = row;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          const position = results[0].geometry.location;

          const marker = new google.maps.Marker({
            position,
            map,
            title: name,
            icon: iconUrl || getDefaultIcon(type),
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 300px;">
                <strong>${name}</strong><br>
                <em>Type:</em> ${type}<br>
                <em>Address:</em> ${address}<br>
                ${imageUrl ? `<img src="${imageUrl}" alt="${name}" style="width:100%; height:auto; margin-top:5px;">` : ""}
              </div>
            `,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));

          // Add marker to the array for filtering
          markers.push({ marker, name, type, address });
        } else {
          console.error(`Geocode failed for ${address}: ${status}`);
        }
      });
    });
  });

  // Add search functionality
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => filterMarkers(searchInput.value));
}

// Default icons based on type
function getDefaultIcon(type) {
  const icons = {
    school: "https://example.com/school-icon.png",
    church: "https://example.com/church-icon.png",
    park: "https://example.com/park-icon.png",
  };
  return icons[type.toLowerCase()] || null;
}

// Filter markers based on search query
function filterMarkers(query) {
  const lowerCaseQuery = query.toLowerCase();
  markers.forEach(({ marker, name, type, address }) => {
    const matches =
      name.toLowerCase().includes(lowerCaseQuery) ||
      type.toLowerCase().includes(lowerCaseQuery) ||
      address.toLowerCase().includes(lowerCaseQuery);

    if (matches) {
      marker.setMap(map); // Show marker
    } else {
      marker.setMap(null); // Hide marker
    }
  });
}

window.onload = initMap;
