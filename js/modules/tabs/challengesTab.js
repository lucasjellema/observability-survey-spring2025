/**
 * Challenges Tab Module
 * Handles rendering and functionality for the Challenges & Aspirations tab
 */

import { getSurveyData } from '../dataService.js';
import { createBarChart } from '../chartService.js';
import { populateSelect, displayCompanies } from '../uiHelpers.js';

/**
 * Render the Challenges tab
 */
export function renderChallengesTab() {
    const surveyData = getSurveyData();
    
    // Get companies with challenges/aspirations
    const companiesWithChallenges = surveyData.filter(item => 
        item.challengesConcernsAspirations && 
        item.challengesConcernsAspirations.length > 0 && 
        item.challengesConcernsAspirations[0] !== ''
    );
    
    // Display count of companies with challenges if the elements exist
    const challengesCountElement = document.getElementById('challengesCount');
    const totalCompaniesCountElement = document.getElementById('totalCompaniesCount');
    
    if (challengesCountElement) {
        challengesCountElement.textContent = companiesWithChallenges.length;
    }
    
    if (totalCompaniesCountElement) {
        totalCompaniesCountElement.textContent = 
            [...new Set(surveyData.map(item => item.Company))].filter(Boolean).length;
    }
    
    // Note: The HTML doesn't have a company select dropdown for challenges,
    // so we'll just display all challenges directly
    
    // Display all challenges initially if the element exists
    const challengesList = document.getElementById('challengesList');
    if (!challengesList) {
        console.warn("Element with ID 'challengesList' not found. Cannot display challenges list.");
        return;
    }
    
    challengesList.innerHTML = '';
    
    if (companiesWithChallenges.length === 0) {
        challengesList.innerHTML = '<p class="text-muted">No challenges or aspirations found.</p>';
        return;
    }
    
    // Create cards for each company's challenges
    companiesWithChallenges.forEach(item => {
        if (item.challengesConcernsAspirations && item.challengesConcernsAspirations.length > 0) {
            const card = document.createElement('div');
            card.className = 'card mb-3';
            card.innerHTML = `
                <div class="card-header">
                    <h5>${item.Company}</h5>
                </div>
                <div class="card-body">
                    <p>${item.challengesConcernsAspirations[0].replace(/\\n/g, '<br>')}</p>
                </div>
            `;
            challengesList.appendChild(card);
        }
    });
}
