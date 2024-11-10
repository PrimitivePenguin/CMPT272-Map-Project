// Template object
const emergencyTemplate = {
    personInfo: "",
    emergencyInfo: "",
    location: null,
    pictureLink: null,
    emergencyType: "",
    additionalContext: ""
  };
  
// Function to create new objects based on the template
function createEmergencyObject(template = {}) {
    const newObject = Object.create(emergencyTemplate);
    
    // Destructure the template object
    const { 
      personInfo = emergencyTemplate.personInfo,
      emergencyInfo = emergencyTemplate.emergencyInfo,
      location = emergencyTemplate.location,
      pictureLink = emergencyTemplate.pictureLink,
      emergencyType = emergencyTemplate.emergencyType,
      additionalContext = emergencyTemplate.additionalContext
    } = template;
    
    // Set the properties of the new object
    newObject.personInfo = personInfo;
    newObject.emergencyInfo = emergencyInfo;
    newObject.emergencyType = emergencyType;
    newObject.location = location;
    newObject.pictureLink = pictureLink;
    newObject.additionalContext = additionalContext;
    
    return newObject;
}


var mapPopup = " \
        <button id='popup-button'>Click me!</button>";

// Based on Canadian Triage and Acuity Scale (CTAS)
function popupForm(e) { return `<form id="popup-form" class="form-container"> \
                <h2>Event:</h2>\
                Location: ${e.latlng.toString()} <br>\
                <label for='emergencyInfo'><b>Emergency Info:</b></label> \
                <input type="text" placeholder="eg. Car accident" id="emergencyInfo" required> \
                <label = for='personInfo'><b>Person Info:</b></label> \
                <input type="text" placeholder="eg. John Doe" id="personInfo" required> \

                <label for='type'><b>Emergency Type:</b></label><br>\
                <input type='radio' name='emergencyType' value='1' id='sev_ill'>Severly Ill \
                <input type='radio' name='emergencyType' value='2' id='emergency'>Emergency \
                <input type='radio' name='emergencyType' value='3' id='urgent'>Urgent <br>\
                <input type='radio' name='emergencyType' value='4' id='less_urgent'>Less Urgent \
                <input type='radio' name='emergencyType' value='5' id='non_urgent'>Non Urgent \

                Picture: <input type='text' placeholder='Picture link' id='pictureLink'> <br>\
                <label for='additionalContext'><b>Additional Context:</b></label> <br>\
                <input class='textbox' type='text' placeholder='Additional Context' id='additionalContext'> \
                <br><br><button type='submit' class='btn'>Save</button> \
            </form>`; }



document.addEventListener('DOMContentLoaded', () => {
    // ask for password alert
    // var password = prompt("Please enter the password (password right now is 'password'", "password");
    // if (password != "password") {
    //     alert("Incorrect password");
    //     window.location.href = "index.html";
    // }
    
    
    var map = L.map('map').setView([49.2827, -123.1], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

 
    // on click, show the popup
    function onMapClick(e) {
        var popup = L.popup({
            closeButton: true})
            .setLatLng(e.latlng)
            .setContent(popupForm(e))
            .openOn(map);

        marker.setLatLng(e.latlng);
        // popup with button to say 'clicked'
        /// var popupContent = "<p>Location: " + e.latlng.toString() + "</p> \
        // <button id='popup-button'>Click me!</button>";
    }
    function onInputClick(e) {
    }
    map.on('click', onMapClick);
    
    const toggleButton = document.getElementById('dark-mode-toggle');
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
