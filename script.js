// Group: Alexander, Alex, Camille, Emily, Jose
// Date: December 3rd, 2024

/* 
  TODO:
    - MD5 password verification and saving
    - use DOM API for storage
    - make it look better
    - check if inputs are valid 
    - edit the time appearamce in table
    - check if most recent table row should be at top
    - make the HTML content form more pleasant
    - delete alerts
    - make modal format better
*/




/* Setup */
// initialize the map centered at (Vancouver, BC) with default zoom level 12
//window.localStorage.clear();
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
// If there are requests in local storage, retrieve them first
let storedRequests = localStorage.getItem("requestsArray");
let locationData = storedRequests ? JSON.parse(storedRequests) : [];
// Array to keep references to map markers
// locally stored markers are initialized through DOM load event   
let markers = [];
// Flag to track if the map is in view-only mode

/* Functionality */
// handles map click events to add a new marker with form input
function onMapClick(e) {
  // get current timestamp
  const timeReported = new Date().toLocaleString('en-US', { hour12: true });
  // HTML form for capturing marker details
  const formHTML = `
    <div class="popup-content">
      <form id="locationForm">
        <labe>Name: <input type="text" id="name"></label><br>
        <label>Location: <input type="text" id="locationName" placeholder="Enter location (e.g., SFU)"></label><br>
        <label>Type: <input type="text" id="reportType" placeholder="Enter type (e.g., shooting, medical)" required></label><br>        
        <label>Status: 
          <select id="status">
            <option value="open" selected>Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </label><br>
        <label>Phone number: <input type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="xxx-xxx-xxxx"></label><br>        
        <label>More Info: <textarea id="moreInfo" placeholder="Enter additional details"></textarea></label><br>
        <label>Optional Image: <input type="file" id="imageUpload" accept="image/*"></label><br>
        <labe>Create password: <input type="checkbox" id="passCheck"></label><br>
        <button type="submit">Submit</button>
      </form>
    </div>
  `;

  // display form in a popup at the clicked location
  const popup = L.popup({
    shadowSize: [50, 50]
  }).setLatLng(e.latlng).setContent(formHTML).openOn(map);

  // handle form submission to add marker data
  document.getElementById('locationForm').onsubmit = function (event) {
    event.preventDefault();
    // retrieve form data
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value || 'None';
    const locationName = document.getElementById('locationName').value;
    const reportType = document.getElementById('reportType').value;
    const status = 'Open';
    const moreInfo = document.getElementById('moreInfo').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    const imageURL = imageFile ? URL.createObjectURL(imageFile) : null;

    // add location data to the array locationData

    if (document.getElementById('passCheck').checked) {
      var pass = createPassword();
      locationData.push({ name, phone, locationName, reportType, status, location, imageURL, moreInfo, timeReported, markerPassword: pass });
    } else {
      locationData.push({ name, phone, locationName, reportType, status, location, imageURL, moreInfo, timeReported, markerPassword: null });
    }
    console.log(locationData);
    localStorage.setItem("requestsArray", JSON.stringify(locationData));

    // create a marker on the map
    const markerIndex = locationData.length - 1;
    // add marker to the markers array
    const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    markers.push(marker);

    // add a tooltip to the marker
    marker.bindTooltip(`<strong>${locationName}</strong><br>${reportType}`, {
      // moves the tooltip 20px left, -20px down
      offset: [-15, -20],
      direction: 'top',
    });

    // add marker to local storage
    // only store essential info, bc marker objects are complicated
    const markerData = markers.map(marker => ({
      lat: marker.getLatLng().lat,
      lng: marker.getLatLng().lng,
    }));
    localStorage.setItem("markerArray", JSON.stringify(markerData));

    // add a new row to the table with location details
    const tableRow = document.createElement('tr');
    const hasMoreInfo = moreInfo ? '✅' : '❎';
    tableRow.innerHTML = `
      <td>${name}</td>
      <td>${phone}</td>
      <td>${reportType}</td>
      <td>${locationName}</td>
      <td>${imageURL}</td>
      <td>
      <span onclick="viewDetails(${markerIndex})" style="cursor:pointer;color:blue;text-decoration:underline;">View Info</span> (${hasMoreInfo})
      </td> 
      <td>${timeReported}</td>
      <td>${status}</td>
    `;
    // find first instance of table in html file
    document.querySelector('#requestsTable tbody').appendChild(tableRow);
    console.log("Row added:", tableRow);

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
  updateVisibleRows();
}

// Function to render data that was stored in local
function renderLocalMarkers() {
  const storedMarkers = localStorage.getItem("markerArray");
  if (storedMarkers) {
    const markerData = JSON.parse(storedMarkers);
    markerData.forEach(({ lat, lng }, index) => {
      const marker = L.marker([lat, lng]).addTo(map);
      markers.push(marker);

      const location = locationData[index];
      if (location) {
        marker.bindTooltip(`<strong>${location.locationName}</strong><br>${location.reportType}`, {
          offset: [-15, -20],
          direction: 'top',
        });
      }

      // Add click event to marker to show details
      marker.on('click', () => {
        viewDetails(index);
      });
    });
  }
}

function renderLocalTable() {
  if (locationData.length > 0) {
    locationData.forEach((entry, index) => {
      const tableRow = document.createElement('tr');
      const hasMoreInfo = entry.moreInfo ? '✅' : '❎';
      tableRow.innerHTML = `
        <td>${entry.name}</td>
        <td>${entry.phone}</td>
        <td>${entry.reportType}</td>
        <td>${entry.locationName}</td>
        <td>${entry.imageURL}</td>
        <td>
          <span onclick="viewDetails(${index})" style="cursor:pointer;color:blue;text-decoration:underline;">View Info</span> (${hasMoreInfo})
        </td>
        <td>${entry.timeReported}</td>
        <td>${entry.status}</td>
      `;
      document.querySelector('#requestsTable tbody').appendChild(tableRow);

      const marker = markers[index]; // Ensure synchronization
      if (marker) {
        tableRow.addEventListener('mouseover', () => {
          marker.openTooltip();
          tableRow.style.backgroundColor = '#FFFF00';
        });
        tableRow.addEventListener('mouseout', () => {
          marker.closeTooltip();
          tableRow.style.backgroundColor = '';
        });

        marker.on('mouseover', () => {
          marker.openTooltip();
          tableRow.style.backgroundColor = '#FFFF00';
        });
        marker.on('mouseout', () => {
          marker.closeTooltip();
          tableRow.style.backgroundColor = '';
        });
      }
    });
  }
}


// attach the map click handler
map.on('click', onMapClick);

// Function to display details of a selected marker in a modal
function viewDetails(index) {
  // get the location data for the selected marker
  const locationEntry = locationData[index];
  // create the HTML content for the modal (DETAILS)
  const modalHTML = `
    <div id="detailsModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeModal()">×</span>  <!-- Close button for the modal -->
        <div class="modal-header">
          <!-- If an image URL is present, display the image -->
          ${locationEntry.imageURL ? `<img src="${locationEntry.imageURL}" alt="Location Image" style="width: 100%; height: auto;">` : ''}
        </div>
        <div class="modal-body">
          <!-- Display the location details -->
          <h2>${locationEntry.locationName}</h2>
          <p><b>Type:</b> ${locationEntry.reportType}</p>
          <p><b>Status:</b> ${locationEntry.status}</p>
          <p><b>Reported:</b> ${locationEntry.timeReported}</p>
          <p><b>More Info:</b> ${locationEntry.moreInfo || 'No additional details'}</p>
          <!-- Buttons for editing or deleting the marker -->
          <button onclick="editMarker(${index})">Edit</button>
          <button onclick="deleteMarker(${index})">Delete</button>
        </div>
      </div>
    </div>
  `;
  // add the modal (DETAILS) HTML to the page and show it
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('detailsModal').style.display = 'block';
}

// function to close the details modal
function closeModal() {
  // get the modal element
  const modal = document.getElementById('detailsModal');
  if (modal) {
    // remove the modal from the page
    modal.remove();
  }
}

// Function to edit the details of a marker
function editMarker(index) {
  // get the marker data
  const markerData = locationData[index];
  // get the password if set for the marker
  let savedPassword = markerData.markerPassword;

  // if no password is set, prompt the user to create one
  if (!savedPassword) {
    const newPassword = prompt("No password set. Please create a new password:");
    if (newPassword) {
      // save the new password
      markerData.markerPassword = newPassword;
      alert("Password set successfully. You can now edit this marker.");
    } else {
      alert("Password creation canceled.");
      return;
    }
  } else {
    // if a password exists just ask the user to enter it
    const enteredPassword = CryptoJS.MD5(prompt("Enter password to edit: ")).tosString();
    if (enteredPassword !== savedPassword) {
      alert("Incorrect password. Edit canceled.");
      return;
    }
  }

  // ask the user if they want to continue with editing
  const shouldEdit = confirm("Do you want to edit the marker?");
  if (shouldEdit) {
    const newStatus = prompt("Change the status (open/resolved):", markerData.status);
    if (newStatus) {
      // update the status of the marker
      markerData.status = newStatus;
      // markers[index].bindPopup(
      //   `<b>Location:</b> ${markerData.locationName}<br>
      //   <b>Type:</b> ${markerData.reportType}<br>
      //   <b>Status:</b> ${newStatus}<br>
      //   <b>Reported:</b> ${markerData.timeReported}<br>
      //   <button onclick="viewDetails(${index})">More Info</button>
      //   <button onclick="editMarker(${index})">Edit</button>
      //   <button onclick="deleteMarker(${index})">Delete</button>`
      // );

      // update the status in the table row
      const tableRow = document.querySelectorAll('table tr')[index + 1];
      tableRow.cells[3].innerText = newStatus;

      alert("Marker updated successfully.");

      // close the modal after editing
      closeModal();
    }
  } else {
    alert("Edit canceled.");
  }
  updateVisibleRows()
}

// function to delete a marker (similar password checker as editMarker)
function deleteMarker(index) {
  // get the marker data
  const markerData = locationData[index];
  // get the password if set for the marker
  const savedPassword = markerData.markerPassword;

  // if no password exists prompt the user to make one
  if (!savedPassword) {
    createPassword();
  }
  else {
    // if a password is set, ask the user to enter it
    const enteredPassword = CryptoJS.MD5(prompt("Enter password to delete:")).toString();
    if (enteredPassword !== savedPassword) {
      alert("Incorrect password. Deletion canceled.");
      return;
    }
  }
  // ask the user to confirm if they want to delete the marker
  const deleteConfirmed = confirm("Are you sure you want to delete this marker?");
  if (deleteConfirmed) {
    // we need to consider 3 cases
    // remove the marker from the map
    map.removeLayer(markers[index]);
    // remove the marker from the markers array
    markers.splice(index, 1);
    // remove the marker data from the locationData array
    locationData.splice(index, 1);

    // Remove the corresponding row from the table
    const table = document.querySelector('#requestsTable');
    if (!table) {
        console.error("Table not found. Ensure #requestsTable exists in the DOM.");
    }    
    table.deleteRow(index + 1);

    // debug
    alert("Marker deleted successfully.");

    // close the modal (the details) after deletion
    closeModal();
  }
  updateVisibleRows()
}

//Emergency Request Table:
const tableBody = document.querySelector('#requestsTable tbody');
const popupForm = document.querySelector('#popupForm');
const overlay = document.querySelector('#overlay');
const detailPopup = document.createElement('div');

// Create and style the detail popup dynamically
detailPopup.id = 'detailPopup';
document.body.appendChild(detailPopup);

function showPopup() {
  popupForm.style.display = 'block';
  overlay.style.display = 'block';
}

function hidePopup() {
  popupForm.style.display = 'none';
  overlay.style.display = 'none';
}

function showDetails(request) {
  detailPopup.innerHTML = `
        <h3>Request Details</h3>
        <p><strong>Name:</strong> ${request.Name}</p>
        <p><strong>Phone Number:</strong> ${request.PhoneNumber}</p>
        <p><strong>Type:</strong> ${request.Type}</p>
        <p><strong>Location:</strong> ${request.Location}</p>
        <p><strong>Picture:</strong> <img src="${request.Picture}" alt="Request Image" style="width: 100px; height: 100px;"></p>
        <p><strong>Comments:</strong> ${request.Comments}</p>
        <p><strong>Time:</strong> ${request.Time}</p>
        <p><strong>Status:</strong> ${request.Status}</p>
        <button onclick="hideDetails()">Close</button>
    `;
  detailPopup.style.display = 'block';
  overlay.style.display = 'block';
}

function hideDetails() {
  detailPopup.style.display = 'none';
  overlay.style.display = 'none';
}


function renderTable(requests) {
  // Clear the table first
  tableBody.innerHTML = '';

  // Add rows for each request
  requests.forEach(request => {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer'; // Make rows clickable

    for (const key in request) {
      const cell = document.createElement('td');
      if (key === 'Picture') {
        const img = document.createElement('img');
        img.src = request[key];
        img.alt = 'Request Image';
        img.style.width = '50px';
        img.style.height = '50px';
        cell.appendChild(img);
      } else {
        cell.textContent = request[key];
      }
      row.appendChild(cell);
    }

    // Add click event listener to the row
    row.addEventListener('click', () => showDetails(request));
    tableBody.appendChild(row);
  });
}


// password stuff
function createPassword() {
  var newPassword = prompt("No password set. Please create a new password:");
  newPassword = CryptoJS.MD5(newPassword);
  newPassword = newPassword.toString();
  if (newPassword) {
    // save the newly created password

    //markerData.markerPassword = newPassword;  
    return newPassword;
  } else {
    alert("Password creation canceled.");
    return null;
  }
}
var hash = CryptoJS.MD5("Message");
function admin() {
  if (viewOnly == true) {
    login();
  } else {
    logout();
  }

  const button = document.getElementById('admin');
  if (viewOnly) {
    // TODO: maybe add images
    button.innerHTML = '<img src="cant_addmarker.png" alt="Log in">';
  } else {
    button.innerHTML = '<img src="addmarker.png" alt="Log Out">';
  }
}
function login() {
  // Ask for password
  var enteredPassword = CryptoJS.MD5(prompt("Enter password to view the map:"));
  var strPass = enteredPassword.toString();
  var strHash = hash.toString();
  console.log(strPass);
  // Compare password
  if (strPass !== strHash) {
    viewOnly = true;
    alert("Incorrect password.");
  } else {
    viewOnly = false;
    alert("Welcome back.");
  }
}

function logout() {
  viewOnly = true;
  alert("Logged out. You cannot add new markers.");
}
document.getElementById('admin').addEventListener('click', admin);

document.addEventListener('DOMContentLoaded', function () {
  viewOnly = true;
  changeMode();
});

// dark mode
const btn = document.querySelector('#modeChange');
function changeMode() {
  if (btn.checked == true) {
    // Dark mode
    document.body.classList.remove('light');
    document.body.classList.add('dark');
    console.log("Dark mode");
  } else {
    // Light mode
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    console.log("Light mode");
  }
}
btn.addEventListener('change', function () {
  changeMode();
});

let currentSort = { column: '', order: 'asc' };

function sortRequests(sortBy, order = 'asc') {
  const compare = (a, b) => {
      if (sortBy === 'Time') {
          const timeA = new Date(a.Time);
          const timeB = new Date(b.Time);
          return order === 'asc' ? timeA - timeB : timeB - timeA;
      } else if (sortBy === 'PhoneNumber') {
          return order === 'asc' ? a.PhoneNumber - b.PhoneNumber : b.PhoneNumber - a.PhoneNumber;
      } else {
          const valA = a[sortBy].toString().toLowerCase();
          const valB = b[sortBy].toString().toLowerCase();
          if (valA < valB) return order === 'asc' ? -1 : 1;
          if (valA > valB) return order === 'asc' ? 1 : -1;
          return 0;
      }
  };

  return requests.sort(compare);
}

document.querySelectorAll('#requestsTable th').forEach(th => {
  th.addEventListener('click', () => {
      const column = th.getAttribute('data-sort');
      let order = 'asc';

      // Toggle sorting order
      if (currentSort.column === column && currentSort.order === 'asc') {
          order = 'desc';
      }

      // Update the current sorting state
      currentSort = { column, order };

      // Sort the requests based on the column and order
      const sortedRequests = sortRequests(column, order);

      // Render the sorted table
      renderTable(sortedRequests);
  });
});


function updateVisibleRows() {
  console.log("updateVisibleRows called due to map movement or zoom.");

  const bounds = map.getBounds(); // Get current map bounds
  console.log("Current map bounds:", bounds.toBBoxString());

  const tableRows = document.querySelectorAll('#requestsTable tbody tr');
  console.log("Number of table rows:", tableRows.length);

  // hide all table rows by default (AT THE START of each iteration)
  tableRows.forEach(row => {
      row.style.display = 'none';
  });

  // iterate through markers and show corresponding rows if marker is visible
  markers.forEach((marker, index) => {
      const markerLatLng = marker.getLatLng();
      const isVisible = bounds.contains(markerLatLng); // check if marker is within bounds
      console.log(`Marker ${index} (${markerLatLng}): visible? ${isVisible}`);

      const row = tableRows[index];
      if (row) {
          row.style.display = isVisible ? '' : 'none'; // Show or hide row
      } else {
          console.warn(`No corresponding row found for marker ${index}.`);
      }
  });
}


// Trigger initial update after map and markers are rendered
document.addEventListener('DOMContentLoaded', () => {
  renderLocalMarkers(); // Load markers from storage
  renderLocalTable();   // Populate table rows
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map and add listeners here
  map.whenReady(() => {
      console.log("Map is ready.");
      map.on('move', updateVisibleRows);
      map.on('moveend', updateVisibleRows);
      map.on('zoomend', updateVisibleRows);
  });
});
