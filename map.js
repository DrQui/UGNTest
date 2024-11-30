const SHEET_ID = "10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";
const SHEET_RANGE = "UGN Mission Partners";
const API_KEY = "AIzaSyBPYtzf_E8mcQ1yzoh_KcocT87CTslTruE";

let map;
let geocoder; // Geocoder instance

async function fetchSheetData() {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_RANGE)}`;
  const response = await fetch(sheetUrl);
  const text = await response.text();
  const json = JSON.parse(text.substring(47).slice(0, -2)); // Parse JSON response
  return json.table.rows;
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0522, lng: -118.2437 }, // Default center: Los Angeles
    zoom: 10,
  });

  geocoder = new google.maps.Geocoder(); // Initialize geocoder

  fetchSheetData()
    .then(rows => {
      rows.forEach(row => {
        const name = row.c[0]?.v || "No name";
        const address = row.c[1]?.v || "No address";
        const website = row.c[2]?.v || "No website";
        const phone = row.c[3]?.v || "No phone";
        const email = row.c[4]?.v || "No email";
        const hours = row.c[5]?.v || "No working hours";
        const description = row.c[6]?.v || "No description";
        const image = row.c[7]?.v || "";

        const infoContent = `
          <div style="max-width: 300px;">
            <h3>${name}</h3>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Website:</strong> <a href="${website}" target="_blank">${website}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Working Hours:</strong> ${hours}</p>
            <p><strong>Description:</strong> ${description}</p>
            ${image ? `<img src="${image}" alt="${name}" style="width:100%; max-height:150px; object-fit:cover;" />` : ""}
          </div>
        `;

        if (address) {
          geocodeAddress(address, name, infoContent);
        }
      });
    })
    .catch(error => console.error("Error fetching or parsing sheet data:", error));
}

function geocodeAddress(address, name, infoContent) {
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;

      const marker = new google.maps.Marker({
        map: map,
        position: location,
        title: name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    } else {
      console.error(`Geocoding failed for ${address}: ${status}`);
    }
  });
}

window.onload = initMap;
