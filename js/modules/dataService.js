/**
 * Data Service Module
 * Handles loading and processing of survey data
 */

// Survey data storage
let surveyData = [];

/**
 * Load survey data from JSON file
 * @returns {Promise} Promise that resolves when data is loaded
 */
export function loadSurveyData() {
    return fetch('data/observability_survey.json')
        .then(response => response.json())
        .then(data => {
            surveyData = data;
            return data;
        })
        .catch(error => console.error('Error loading survey data:', error));
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
