// Group: Alexander, Alex, Camille, Emily, Discord
// Date: December 3rd, 2024

/* 
  TODO:
    - MD5 password verification and saving
    - using sessionStorage
    - make it look better
    - check if inputs are valid 
    - edit the pm time
    - check if most recent table row should be at top
*/


/* Setup */
// initialize the map centered at (Vancouver, BC) with default zoom level 12
var map = L.map('map', { 
  trackResize: true, 
  minZoom: 10        
}).setView([49.2827, -123.1207], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
/* End of setup */


// Array to hold locations
let locationData = []; 
// Array to keep references to map markers
let markers = [];      
// Flag to track if the map is in view-only mode
let viewOnly = false; 


/* Functionality */
// toggles adding new markers 
function toggleViewOnly() {
  viewOnly = !viewOnly; 
  alert(viewOnly ? "Map is now in view-only mode. You cannot add new markers." : "Map is no longer in view-only mode.");
  const button = document.getElementById('toggleViewOnlyBtn');
  if (viewOnly) {
    // TODO: maybe add images
    button.innerHTML = '<img src="cant_addmarker.png" alt="View Only">'; 
  } else {
    button.innerHTML = '<img src="addmarker.png" alt="Add Mode">'; 
  }
}
// add event listener to the toggle button
document.getElementById('toggleViewOnlyBtn').addEventListener('click', toggleViewOnly);

// handles map click events to add a new marker with form input
function onMapClick(e) {
  console.log("View-Only Mode: " + viewOnly);
  // flag to track if the map is in view-only mode
  if (viewOnly) { 
    return; 
  }
  // get current timestamp
  const timeReported = new Date().toLocaleString('en-US', { hour12: true }); 
  // HTML form for capturing marker details
  const formHTML = `
    <div class="popup-content">
      <form id="locationForm">
        <label>Location Name: <input type="text" id="locationName" placeholder="Enter location (e.g., SFU)"></label><br>
        <label>Type: <input type="text" id="reportType" placeholder="Enter type (e.g., shooting, medical)"></label><br>
        <label>Status: 
          <select id="status">
            <option value="open" selected>Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </label><br>
        <label>More Info: <textarea id="moreInfo" placeholder="Enter additional details"></textarea></label><br>
        <label>Optional Image: <input type="file" id="imageUpload" accept="image/*"></label><br>
        <button type="submit">Submit</button>
      </form>
    </div>
  `;

  // display form in a popup at the clicked location
  const popup = L.popup({
    shadowSize: [50, 50]
  }).setLatLng(e.latlng).setContent(formHTML).openOn(map);
  
  // handle form submission to add marker data
  document.getElementById('locationForm').onsubmit = function(event) {
    event.preventDefault();
    // retrieve form data
    const locationName = document.getElementById('locationName').value;
    const reportType = document.getElementById('reportType').value;
    const status = document.getElementById('status').value;
    const moreInfo = document.getElementById('moreInfo').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    const imageURL = imageFile ? URL.createObjectURL(imageFile) : null; 

    // add location data to the array locationData
    const locationEntry = { locationName, reportType, status, timeReported, moreInfo, imageURL, markerPassword: null };
    locationData.push(locationEntry);

    // create a marker on the map
    const markerIndex = locationData.length - 1; // index of the newly added location
    // add marker to the array markers
    const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    markers.push(marker);

    // add a tooltip to the marker
    marker.bindTooltip(`<strong>${locationName}</strong><br>${reportType}`, {
      // moves the tooltip 20px left, -20px down
      offset: [-15, -20],
      direction: 'top',
    });

    // add a new row to the table with location details
    const tableRow = document.createElement('tr');
    const hasMoreInfo = moreInfo ? '✅' : '❎';
    tableRow.innerHTML = `
      <td>${locationName}</td>
      <td>${reportType}</td>
      <td>${timeReported}</td>
      <td>${status}</td>
      <td>
        <span onclick="viewDetails(${markerIndex})" style="cursor:pointer;color:blue;text-decoration:underline;">View Info</span> (${hasMoreInfo})
      </td>
    `;
    // find first instance of table in html file
    document.querySelector('table').appendChild(tableRow);

    // hover over table row case
    tableRow.addEventListener('mouseover', () => {
      marker.openTooltip();
      tableRow.style.backgroundColor = '#FFFF00';
    });
    tableRow.addEventListener('mouseout', () => {
      marker.closeTooltip();
      tableRow.style.backgroundColor = '';
    });
    // hover over tooltip case
    marker.on('mouseover', () => {
      marker.openTooltip();
      tableRow.style.backgroundColor = '#FFFF00';
    });
    marker.on('mouseout', () => {
      marker.closeTooltip();
      tableRow.style.backgroundColor = '';
    });

    // clicking on marker shows details
    marker.on('click', () => {
      viewDetails(markerIndex);
    });

    // close the popup after adding the marker
    popup.remove(); 
  };
}

// attach the map click handler
map.on('click', onMapClick);

// display details of a selected marker in a modal
function viewDetails(index) {
  const locationEntry = locationData[index];
  const modalHTML = `
    <div id="detailsModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeModal()">×</span>
        <div class="modal-header">
          ${locationEntry.imageURL ? `<img src="${locationEntry.imageURL}" alt="Location Image" style="width: 100%; height: auto;">` : ''}
        </div>
        <div class="modal-body">
          <h2>${locationEntry.locationName}</h2>
          <p><b>Type:</b> ${locationEntry.reportType}</p>
          <p><b>Status:</b> ${locationEntry.status}</p>
          <p><b>Reported:</b> ${locationEntry.timeReported}</p>
          <p><b>More Info:</b> ${locationEntry.moreInfo || 'No additional details'}</p>
          <button onclick="editMarker(${index})">Edit</button>
          <button onclick="deleteMarker(${index})">Delete</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('detailsModal').style.display = 'block';
}

// close the details modal
function closeModal() {
  const modal = document.getElementById('detailsModal');
  if (modal) { 
    modal.remove();
  }
}

// Edit an existing marker's details
function editMarker(index) {
  // get the marker's data
  const markerData = locationData[index]; 
  // retrieve the password if set
  let savedPassword = markerData.markerPassword; 

  // if no password exists, ask the user to make one
  if (!savedPassword) {
    const newPassword = prompt("No password set. Please create a new password:");
    if (newPassword) {
      markerData.markerPassword = newPassword;
      alert("Password set successfully. You can now edit this marker.");
    } 
    else {
      alert("Password creation canceled.");
      return;
    }
  } 
  else {
    // verify the user's password before editing
    const enteredPassword = prompt("Enter password to edit:");
    if (enteredPassword !== savedPassword) {
      alert("Incorrect password. Edit canceled.");
      return;
    }
  }

  // allow the user to update the status
  const newStatus = prompt("Change the status (open/resolved):", markerData.status);
  if (newStatus) {
    markerData.status = newStatus;
    // update the marker's popup to reflect the new status
    markers[index].bindPopup(
      `<b>Location:</b> ${markerData.locationName}<br>
      <b>Type:</b> ${markerData.reportType}<br>
      <b>Status:</b> ${newStatus}<br>
      <b>Reported:</b> ${markerData.timeReported}<br>
      <button onclick="viewDetails(${index})">More Info</button>
      <button onclick="editMarker(${index})">Edit</button>
      <button onclick="deleteMarker(${index})">Delete</button>`
    ).openPopup();

    // Update the corresponding table row's status cell
    const tableRow = document.querySelectorAll('table tr')[index + 1]; // adjust for header row
    // change the status in the corresponding table row
    tableRow.cells[3].innerText = newStatus;

    alert("Marker updated successfully.");
  }
}

// Delete a marker from the map and data
function deleteMarker(index) {
  // get the marker's data
  const markerData = locationData[index]; 
  // retrieve the password
  const savedPassword = markerData.markerPassword; 

  // prompt the user for the right password
  const enteredPassword = prompt("Enter password to delete:");
  if (enteredPassword === savedPassword) {
    // remove the marker from the map and arrays
    map.removeLayer(markers[index]);
    markers.splice(index, 1);
    locationData.splice(index, 1);

    // update the table by removing the corresponding row
    const table = document.querySelector('table');
    // adjust for header row
    table.deleteRow(index + 1); 
    alert("Marker deleted successfully.");
  } 
  else {
    alert("Incorrect password. Cannot delete this marker.");
  }
}

