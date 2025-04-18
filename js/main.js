/**
 * Main Application Entry Point
 * Initializes the dashboard and loads data
 */

import { loadSurveyData } from './modules/dataService.js';
import { renderOverviewTab } from './modules/tabs/overviewTab.js';
import { renderTelemetryTab } from './modules/tabs/telemetryTab.js';
import { renderDimensionsTab } from './modules/tabs/dimensionsTab.js';
import { renderSourcesTab } from './modules/tabs/sourcesTab.js';
import { renderProcessingTab } from './modules/tabs/processingTab.js';
import { renderFacetsTab } from './modules/tabs/facetsTab.js';
import { renderChallengesTab } from './modules/tabs/challengesTab.js';
import { renderRoadmapTab } from './modules/tabs/roadmapTab.js';
import { renderProductsTab } from './modules/tabs/productsTab.js';
import { renderCompanyTab } from './modules/tabs/companyTab.js';

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
 * Update the UI to show the data source
 */
function updateDataSourceInfo() {
    const params = getUrlParams();
    const dataSource = params.parDataFile || 'data/observability_survey.json';
    
    // Create or update the data source info element
    let dataSourceInfo = document.getElementById('dataSourceInfo');
    
    if (!dataSourceInfo) {
        // Create the element if it doesn't exist
        dataSourceInfo = document.createElement('div');
        dataSourceInfo.id = 'dataSourceInfo';
        dataSourceInfo.className = 'alert alert-info mt-2 mb-4';
        
        // Insert it after the header
        const header = document.querySelector('header');
        if (header && header.nextElementSibling) {
            header.parentNode.insertBefore(dataSourceInfo, header.nextElementSibling);
        }
    }
    
    // Update the content
    dataSourceInfo.innerHTML = `
        <div class="container">
            <strong>Data Source:</strong> ${dataSource}
        </div>
    `;
}

// Initialize the dashboard
function initializeDashboard() {
    // Update data source info in the UI
   // updateDataSourceInfo();
    
    // Load survey data
    loadSurveyData()
        .then(() => {
            try {
                // Render tabs based on which elements exist in the HTML
                // This makes our code more resilient to HTML structure changes
                
                // Overview tab
                if (document.getElementById('overview')) {
                    renderOverviewTab();
                }
                
                // Telemetry tab
                if (document.getElementById('telemetry')) {
                    renderTelemetryTab();
                }
                
                // Dimensions tab
                if (document.getElementById('dimensions')) {
                    renderDimensionsTab();
                }
                
                // Sources tab
                if (document.getElementById('sources')) {
                    renderSourcesTab();
                }
                
                // Processing tab
                if (document.getElementById('processing')) {
                    renderProcessingTab();
                }
                
                // Facets tab
                if (document.getElementById('facets')) {
                    renderFacetsTab();
                }
                
                // Challenges tab
                if (document.getElementById('challenges')) {
                    renderChallengesTab();
                }
                
                // Roadmap tab
                if (document.getElementById('roadmap')) {
                    renderRoadmapTab();
                }
                
                // Products tab
                if (document.getElementById('products')) {
                    renderProductsTab();
                }
                
                // Company tab
                if (document.getElementById('company')) {
                    renderCompanyTab();
                }
                
                // Initialize event listeners
                initializeEventListeners();
                
                console.log('Dashboard initialized successfully');
            } catch (error) {
                console.error('Error rendering dashboard:', error);
            }
        })
        .catch(error => console.error('Error loading survey data:', error));
}

// Initialize event listeners
function initializeEventListeners() {
    // Add event listeners for tab switching
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            // Resize charts when tab is shown
            window.dispatchEvent(new Event('resize'));
            
            // Get the active tab ID
            const activeTabId = event.target.getAttribute('data-bs-target').substring(1);
            console.log(`Tab switched to: ${activeTabId}`);
        });
    });
    
    // Add event listeners for company badges in the overview tab
    const companiesList = document.getElementById('companiesList');
    if (companiesList) {
        companiesList.addEventListener('click', function(event) {
            if (event.target.classList.contains('badge')) {
                const company = event.target.textContent;
                // Switch to company tab
                document.getElementById('company-tab').click();
                
                // Select the company in the dropdown
                const companySelect = document.getElementById('companySelect');
                if (companySelect) {
                    companySelect.value = company;
                    companySelect.dispatchEvent(new Event('change'));
                }
            }
        });
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeDashboard);
