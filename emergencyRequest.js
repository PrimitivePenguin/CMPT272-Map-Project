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


function renderTable() {
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

function addRequest() {
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;
    const type = document.getElementById('typeInput').value;
    const location = document.getElementById('locationInput').value;
    const picture = document.getElementById('pictureInput').value;
    const comments = document.getElementById('commentsInput').value;

    const time = new Date().toLocaleString(); // Formats the date and time as a string
    const status = 'Open'; // Default status is 'Open'

    // Add the new request to the array
    requests.push({
        Name: name,
        PhoneNumber: phone,
        Type: type,
        Location: location,
        Picture: picture,
        Comments: comments,
        Time: time,
        Status: status
    });

    // Hide the popup and re-render the table
    hidePopup();
    renderTable();
}

// Initial render
renderTable();