const SHEET_ID = "10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";
const SHEET_RANGE = "UGN Mission Partners";
const API_KEY = "AIzaSyBPYtzf_E8mcQ1yzoh_KcocT87CTslTruE";

let map;
let geocoder;

async function fetchSheetData() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/10YA-1CHFMSlWdhf5J8jrMnJc9k9VyzWC0TU6Xousp6U";

  try {
    const response = await fetch(sheetUrl);
    const textData = await response.text();
    const jsonData = JSON.parse(textData.substring(47).slice(0, -2));

    // Process the data to extract relevant information
    const locations = jsonData.table.rows.map(row => {
      const name = row.c[0]?.v || "No name";
      const address = row.c[1]?.v || "No address";
      const lat = parseFloat(row.c[2]?.v);
      const lng = parseFloat(row.c[3]?.v);

      // Only include locations with valid coordinates
      if (!isNaN(lat) && !isNaN(lng)) {
        return { name, address, lat, lng };
      }
    }).filter(location => location !== undefined);

    return locations;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
  }
}

// Usage example
(async () => {
  const locations = await fetchSheetData();
  if (locations) {
    console.log("Fetched locations:", locations);
    // Initialize your map and add markers here
  }
})();

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0522, lng: -118.2437 }, // Default center: Los Angeles
    zoom: 10,
  });

  geocoder = new google.maps.Geocoder();

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
        const type = row.c[8]?.v || "default"; // Type column for custom icons

        const infoContent = `
  <div style="max-width: 300px; padding: 15px; background-color: #f0f0f0; border: 1px solid black; border-radius: 8px;">
    <h3 style="margin: 0;">${name}</h3>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Website:</strong> <a href="${website}" target="_blank">${website}</a></p>
    <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Working Hours:</strong> ${hours}</p>
    <p><strong>Description:</strong> ${description}</p>
    ${image ? `<img src="${image}" alt="${name}" style="width: 100%; height: auto; border-radius: 4px;" />` : ""}
  </div>
`;
        if (address) {
          geocodeAddress(address, name, infoContent, type);
        }
      });
    })
    .catch(error => console.error("Error fetching or parsing sheet data:", error));
}

function geocodeAddress(address, name, infoContent, type) {
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;

      // Create AdvancedMarkerElement for custom markers
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        title: name,
        icon: getDefaultIcon(type), // Custom icon
      });

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      // Attach a click event to the marker
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    } else {
      console.error(`Geocoding failed for ${address}: ${status}`);
    }
  });
}

// Default icons based on type
function getDefaultIcon(type) {
  const icons = {
    school: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjVyJUGfzzT25SkqoD6VOaXStdrfTFVG7OSPUKTpHIZpbBGRWyeRsk6jfilJaUDSOk34PXLsn6mJyFI0ZayfFjDzyZNMZJV4pfMAJjLo_ZLKOuKCswJSCpahEiOSqhcGf3t8dqQk6oMBGayC6URpltPAks_nPi7FpxI_2ku9xpadHG_wzVX5QHq78PfBWfN/s320/School_2997321.png",
    church: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTppwO96YztqZCGPVXq3YYQjB2tLCFAWdtEhikPGsZFv-s9Q_33ogHS9ZP7Km1zW47C_8jFUbNIybpzDwSpyK39eUsSPVRFllICFkHzSeym93vjvG9vuqcvwGD6RJcnhvhCUP2f9YjX8XSWPC3yv-z-OW5uh2l4mun9cQ0lIhAb4Mzy0apMtLRDwa7jQRq/s512/church_1128009.png",
    park: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGnT5M1rkGPK3SQks0d5roWueo9UdMft_DoWuwoih6CG4r0V3uNFx4cVbMExyywAyIuvrnmfBYEeGi94ADhG-kXHlqjJJfSBUhEiVs9bagYbWShn4YmyOQEZkx95EqQ7SMs7VKQ89RxVEMps5Wqjg77erJQSG624DfV0uculem-P-ajRrAMxpflUwM7T7C/s512/park_5138904.png",
  };
  return icons[type.toLowerCase()] || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTppwO96YztqZCGPVXq3YYQjB2tLCFAWdtEhikPGsZFv-s9Q_33ogHS9ZP7Km1zW47C_8jFUbNIybpzDwSpyK39eUsSPVRFllICFkHzSeym93vjvG9vuqcvwGD6RJcnhvhCUP2f9YjX8XSWPC3yv-z-OW5uh2l4mun9cQ0lIhAb4Mzy0apMtLRDwa7jQRq/s512/church_1128009.png"; // Fallback icon
}

window.onload = initMap;
