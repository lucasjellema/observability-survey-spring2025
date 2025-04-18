/**
 * Data Service Module
 * Handles loading and processing of survey data
 */

// Survey data storage
let surveyData = [];

/**
 * Get URL parameters
 * @returns {Object} Object containing URL parameters
 */
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    
    return params;
}

/**
 * Load survey data from JSON file
 * @returns {Promise} Promise that resolves when data is loaded
 */
export function loadSurveyData() {
    // Check if parDataFile parameter is present in the URL
    const params = getUrlParams();
    const dataUrl = params.parDataFile || 'data/observability_survey.json';
    
    console.log(`Loading data from: ${dataUrl}`);
    
    return fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            surveyData = data;
            return data;
        })
        .catch(error => {
            console.error('Error loading survey data:', error);
            // If loading from URL fails, try loading from the default file as fallback
            if (dataUrl !== 'data/observability_survey.json') {
                console.log('Falling back to default data file');
                return fetch('data/observability_survey.json')
                    .then(response => response.json())
                    .then(data => {
                        surveyData = data;
                        return data;
                    });
            }
            throw error;
        });
}

/**
 * Get the loaded survey data
 * @returns {Array} The survey data array
 */
export function getSurveyData() {
    return surveyData;
}

/**
 * Count occurrences of items in arrays across all survey responses
 * @param {Array} data - Survey data array
 * @param {String} propertyName - Name of the property containing the array
 * @returns {Object} Object with counts for each item
 */
export function countArrayItems(data, propertyName) {
    const counts = {};
    
    data.forEach(item => {
        if (item[propertyName] && Array.isArray(item[propertyName])) {
            item[propertyName].forEach(value => {
                if (value) {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });
        }
    });
    
    return counts;
}

/**
 * Get companies that have a specific item in their array property
 * @param {Array} data - Survey data array
 * @param {String} propertyName - Name of the property containing the array
 * @param {String} itemValue - The value to search for
 * @returns {Array} Array of company names
 */
export function getCompaniesWithItem(data, propertyName, itemValue) {
    return data
        .filter(item => 
            item[propertyName] && 
            Array.isArray(item[propertyName]) && 
            item[propertyName].includes(itemValue)
        )
        .map(item => item.Company)
        .filter(Boolean);
}
