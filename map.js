// Template object
const emergencyTemplate = {
    personInfo: "",
    emergencyInfo: "",
    location: null,
    pictureLink: null,
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
      additionalContext = emergencyTemplate.additionalContext
    } = template;
    
    // Set the properties of the new object
    newObject.personInfo = personInfo;
    newObject.emergencyInfo = emergencyInfo;
    newObject.location = location;
    newObject.pictureLink = pictureLink;
    newObject.additionalContext = additionalContext;
    
    return newObject;
}


document.addEventListener('DOMContentLoaded', () => {
    var map = L.map('map').setView([49.2827, -123.1], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    
    const toggleButton = document.getElementById('dark-mode-toggle');
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
