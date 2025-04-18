/**
 * UI Helpers Module
 * Provides helper functions for UI manipulation
 */

/**
 * Populate a select dropdown with options
 * @param {String} selectId - ID of the select element
 * @param {Array} options - Array of option values
 * @param {Boolean} keepFirstOption - Whether to keep the first option (e.g., "All Companies")
 * @returns {Boolean} Whether the operation was successful
 */
export function populateSelect(selectId, options, keepFirstOption = false) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`Select element with ID '${selectId}' not found. Cannot populate options.`);
        return false;
    }
    
    if (!keepFirstOption) {
        select.innerHTML = '<option value="">Select...</option>';
    } else {
        // Keep existing first option (like 'All Companies')
        const firstOption = select.querySelector('option:first-child');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    return true;
}

/**
 * Display company badges in a container
 * @param {String} containerId - ID of the container element
 * @param {Array} companies - Array of company names
 * @param {Object} colorMap - Optional mapping of companies to colors
 * @returns {Boolean} Whether the operation was successful
 */
export function displayCompanies(containerId, companies, colorMap = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container element with ID '${containerId}' not found. Cannot display companies.`);
        return false;
    }
    
    container.innerHTML = '';
    
    if (companies.length === 0) {
        container.innerHTML = '<p class="text-muted">No companies found.</p>';
        return;
    }
    
    companies.forEach(company => {
        const badge = document.createElement('span');
        badge.className = 'badge company-badge m-1';
        
        // Apply color if provided in the color map
        if (colorMap && colorMap[company]) {
            badge.style.backgroundColor = colorMap[company];
            badge.style.color = '#fff';
        } else {
            badge.classList.add('bg-primary');
        }
        
        badge.textContent = company;
        badge.setAttribute('data-company', company);
        
        // Make badges clickable to show company details
        badge.addEventListener('click', () => {
            // Switch to company tab
            document.getElementById('company-tab').click();
            
            // Select the company in the dropdown
            const companySelect = document.getElementById('companySelect');
            companySelect.value = company;
            
            // Trigger change event to display company details
            companySelect.dispatchEvent(new Event('change'));
        });
        
        container.appendChild(badge);
    });
    
    return true;
}
