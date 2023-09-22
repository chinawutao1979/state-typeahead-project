// Global variable to store JSON data
let globalData = null;

// Shared function for fetching and processing JSON files
async function fetchAndProcessJSON(url) {
  try {
    if (globalData === null) {
      // Fetch the JSON file from the specified URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch JSON file');
      }

      // Parse the JSON response and store it in the globalData variable
      globalData = await response.json();
    }   
    
    return globalData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Call the shared function to get JSON data, will only fetch once
const jsonUrl = 'states_with_coordinates.json'; // Replace with your JSON file path

// In the following code, you can access the globalData variable at any time without re-fetching
// For example, you can access globalData in other functions or event handlers
function initMap() {
   // First call to fetch JSON data
    fetchAndProcessJSON(jsonUrl)
        .then(data => {      
        })
        .catch(error => {
            // Handle errors
            console.error('Error fetching and processing JSON file:', error);
        });
        const mapDiv = document.getElementById('map');
        const map = new google.maps.Map(mapDiv, {
            //center: { lat: 37.0902, lng: -95.7129 }, // Center of the US
            center: { lat: 42.165726, lng: -74.948051 }, 
            zoom: 8,
        });

    const stateInput = document.getElementById('stateInput');        
    const stateSuggestions = document.getElementById('stateSuggestions');
    stateInput.addEventListener('input', async (event) => {
        
        const inputText = event.target.value;
        const response = await fetch(`/graphql?query={suggestions(query:"${inputText}")}`);
        const data = await response.json();

        stateSuggestions.innerHTML = '';
        data.data.suggestions.forEach((state) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = state;
            suggestionItem.addEventListener('click', () => {
                stateInput.value = state;
                stateSuggestions.innerHTML = '';
                updateMapByState(state)
            });
            stateSuggestions.appendChild(suggestionItem);
        });
    });

    // Add a change event listener
    stateInput.addEventListener('change', (event) => {
        // Get the value from the input box
        const selectedState = event.target.value;
        
        // Execute your desired event and handling logic here        
        updateMapByState(selectedState)
    });
}    

// Function to find state data by name
function findStateByName(stateName) {
    if (globalData !== null) {
      // Find the state in the global JSON data by its name
      const foundState = globalData.states.find(state => state.name === stateName);
      return foundState || null; // Return null if the state is not found
    }
    return null; // Return null if globalData is empty
}

// Function to update the map based on the selected state
function updateMapByState(stateName){
    const foundState = findStateByName(stateName);
    if (foundState !== null){
        const mapDiv = document.getElementById('map');        
        const map = new google.maps.Map(mapDiv, {
            center: { lat: foundState.lat, lng:  foundState.lng }, 
            zoom: 8,
        });
    }
}
