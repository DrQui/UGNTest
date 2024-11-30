const SHEET_ID = "10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";
const API_KEY = "AIzaSyBPYtzf_E8mcQ1yzoh_KcocT87CTslTruE";
const SHEET_RANGE = "UGN Mission Partners";

let map;
let markers = []; // To store all markers for filtering

async function fetchSheetData() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U/gviz/tq?tqx=out:json&sheet=UGN%20Mission%20Partners";
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
    school: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVyJUGfzzT25SkqoD6VOaXStdrfTFVG7OSPUKTpHIZpbBGRWyeRsk6jfilJaUDSOk34PXLsn6mJyFI0ZayfFjDzyZNMZJV4pfMAJjLo_ZLKOuKCswJSCpahEiOSqhcGf3t8dqQk6oMBGayC6URpltPAks_nPi7FpxI_2ku9xpadHG_wzVX5QHq78PfBWfN/s320/School_2997321.png",
    church: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTppwO96YztqZCGPVXq3YYQjB2tLCFAWdtEhikPGsZFv-s9Q_33ogHS9ZP7Km1zW47C_8jFUbNIybpzDwSpyK39eUsSPVRFllICFkHzSeym93vjvG9vuqcvwGD6RJcnhvhCUP2f9YjX8XSWPC3yv-z-OW5uh2l4mun9cQ0lIhAb4Mzy0apMtLRDwa7jQRq/s512/church_1128009.png",
    park: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGnT5M1rkGPK3SQks0d5roWueo9UdMft_DoWuwoih6CG4r0V3uNFx4cVbMExyywAyIuvrnmfBYEeGi94ADhG-kXHlqjJJfSBUhEiVs9bagYbWShn4YmyOQEZkx95EqQ7SMs7VKQ89RxVEMps5Wqjg77erJQSG624DfV0uculem-P-ajRrAMxpflUwM7T7C/s512/park_5138904.png",
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
