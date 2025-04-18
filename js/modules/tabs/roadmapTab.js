/**
 * Roadmap Tab Module
 * Handles rendering and functionality for the Roadmap & Strategy tab
 */

import { getSurveyData } from '../dataService.js';
import { populateSelect } from '../uiHelpers.js';

/**
 * Render the Roadmap tab
 */
export function renderRoadmapTab() {
    const surveyData = getSurveyData();
    
    // Get companies with roadmap strategy
    const companiesWithRoadmap = surveyData.filter(item => item.RoadmapStrategy && item.RoadmapStrategy.trim() !== '');
    
    // Populate company select dropdown for filtering with case-insensitive sorting
    const uniqueCompanies = [...new Set(companiesWithRoadmap.map(item => item.Company))].filter(Boolean)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    populateSelect('roadmapCompanySelect', uniqueCompanies, true);
    
    // Display all roadmaps initially
    displayRoadmaps();
    
    // Add event listener for company filter
    const roadmapCompanySelect = document.getElementById('roadmapCompanySelect');
    if (roadmapCompanySelect) {
        roadmapCompanySelect.addEventListener('change', function() {
            displayRoadmaps(this.value);
        });
    } else {
        console.warn("Element with ID 'roadmapCompanySelect' not found. Cannot add event listener.");
    }
}

/**
 * Display roadmaps for all or filtered companies
 * @param {String} filterCompany - Optional company name to filter by
 */
function displayRoadmaps(filterCompany = '') {
    const surveyData = getSurveyData();
    const roadmapList = document.getElementById('roadmapList');
    
    if (!roadmapList) {
        console.warn("Element with ID 'roadmapList' not found. Cannot display roadmaps.");
        return;
    }
    
    roadmapList.innerHTML = '';
    
    // Filter companies based on selection
    let filteredData = surveyData.filter(item => item.RoadmapStrategy && item.RoadmapStrategy.trim() !== '');
    
    if (filterCompany) {
        filteredData = filteredData.filter(item => item.Company === filterCompany);
    }
    
    // Sort by company name (case-insensitive)
    filteredData.sort((a, b) => a.Company.toLowerCase().localeCompare(b.Company.toLowerCase()));
    
    if (filteredData.length === 0) {
        roadmapList.innerHTML = '<p class="text-muted">No roadmap & strategy information available.</p>';
        return;
    }
    
    // Create roadmap cards
    filteredData.forEach(item => {
        const roadmapCard = document.createElement('div');
        roadmapCard.className = 'card mb-4';
        roadmapCard.innerHTML = `
            <div class="card-header bg-light">
                <h5 class="mb-0">${item.Company}</h5>
                <span class="badge bg-secondary">${item.Status}</span>
            </div>
            <div class="card-body">
                <h6 class="mb-3">Roadmap & Strategy:</h6>
                <p>${item.RoadmapStrategy.replace(/\\n/g, '<br>')}</p>
                
                <h6 class="mb-3 mt-4">Proposition:</h6>
                <p>${item.Proposition ? item.Proposition.replace(/\\n/g, '<br>') : 'Not specified'}</p>
            </div>
        `;
        roadmapList.appendChild(roadmapCard);
    });
}
