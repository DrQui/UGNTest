const SHEET_ID = "10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";
const SHEET_NAME = "UGN Mission Partners";
const API_KEY = "AIzaSyBPYtzf_E8mcQ1yzoh_KcocT87CTslTruE";

const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

let map;
let markers = []; // To store all markers for filtering

// Initialize the Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
    zoom: 10,
  });

  // Load the data from Google Sheets and add markers
  fetch(sheetUrl)
    .then((response) => response.text())
    .then((data) => {
      // Parse the sheet data
      const json = JSON.parse(data.substring(47).slice(0, -2));
      const rows = json.table.rows;

      rows.forEach((row) => {
        const name = row.c[0]?.v || "No name";
        const lat = parseFloat(row.c[1]?.v);
        const lng = parseFloat(row.c[2]?.v);
        const type = row.c[3]?.v || "default"; // Type column
        const address = row.c[4]?.v || "No address";

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: name,
            icon: getDefaultIcon(type),
          });

          markers.push({ marker, name, type, address });

          // Add info window to marker
          const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${name}</h3><p>${type}</p><p>${address}</p>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        }
      });

      console.log("Markers loaded:", markers);
    })
    .catch((error) => console.error("Error fetching sheet data:", error));

  // Add search functionality
  const searchInput = document.getElementById("search-bar");
  searchInput.addEventListener("input", () => filterMarkers(searchInput.value));
}

// Get default icons for marker types
function getDefaultIcon(type) {
  const icons = {
    school:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVyJUGfzzT25SkqoD6VOaXStdrfTFVG7OSPUKTpHIZpbBGRWyeRsk6jfilJaUDSOk34PXLsn6mJyFI0ZayfFjDzyZNMZJV4pfMAJjLo_ZLKOuKCswJSCpahEiOSqhcGf3t8dqQk6oMBGayC6URpltPAks_nPi7FpxI_2ku9xpadHG_wzVX5QHq78PfBWfN/s320/School_2997321.png",
    church:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTppwO96YztqZCGPVXq3YYQjB2tLCFAWdtEhikPGsZFv-s9Q_33ogHS9ZP7Km1zW47C_8jFUbNIybpzDwSpyK39eUsSPVRFllICFkHzSeym93vjvG9vuqcvwGD6RJcnhvhCUP2f9YjX8XSWPC3yv-z-OW5uh2l4mun9cQ0lIhAb4Mzy0apMtLRDwa7jQRq/s512/church_1128009.png",
    park:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGnT5M1rkGPK3SQks0d5roWueo9UdMft_DoWuwoih6CG4r0V3uNFx4cVbMExyywAyIuvrnmfBYEeGi94ADhG-kXHlqjJJfSBUhEiVs9bagYbWShn4YmyOQEZkx95EqQ7SMs7VKQ89RxVEMps5Wqjg77erJQSG624DfV0uculem-P-ajRrAMxpflUwM7T7C/s512/park_5138904.png",
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
