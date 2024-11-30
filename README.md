// Your Google Sheet ID
const SHEET_ID = "10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";
const API_KEY = "AIzaSyBPYtzf_E8mcQ1yzoh_KcocT87CTslTruE";
const SHEET_RANGE = "UGN Mission Partners"; // Name of the sheet/tab

// Fetch data from Google Sheets
async function fetchSheetData() {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`);
  const data = await response.json();
  const rows = data.values;
  return rows;
}

// Initialize Google Map
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.7749, lng: -122.4194 }, // Default center (adjust as needed)
    zoom: 10,
  });

  fetchSheetData().then((rows) => {
    rows.slice(1).forEach((row) => {
      const [name, address, type, iconUrl] = row;

      // Geocode address if coordinates not provided
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          const position = results[0].geometry.location;
          const marker = new google.maps.Marker({
            position,
            map,
            title: name,
            icon: iconUrl || getDefaultIcon(type), // Use custom or default icon
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${name}</strong><br>Type: ${type}<br>Address: ${address}`,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));
        } else {
          console.error(`Geocode failed for ${address}: ${status}`);
        }
      });
    });
  });
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

window.onload = initMap;
