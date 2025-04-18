/**
 * Overview Tab Module
 * Handles rendering and functionality for the Overview tab
 */

import { getSurveyData, countArrayItems } from '../dataService.js';
import { createPieChart, createBarChart } from '../chartService.js';

/**
 * Render the Overview tab
 */
export function renderOverviewTab() {
    const surveyData = getSurveyData();
    
    // Count companies
    const uniqueCompanies = [...new Set(surveyData.map(item => item.Company))].filter(Boolean);
    
    // Display companies list
    const companiesList = document.getElementById('companiesList');
    if (companiesList) {
        companiesList.innerHTML = '';
        uniqueCompanies.forEach(company => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary m-1';
            badge.textContent = company;
            companiesList.appendChild(badge);
        });
    }
    
    // Create participation chart showing companies vs respondents
    const participationData = [uniqueCompanies.length, surveyData.length];
    const participationLabels = ['Companies', 'Responses'];
    
    createPieChart(
        'participationChart',
        participationLabels,
        participationData,
        'Survey Participation',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
        }
    );
    
    // We don't need to create a dimensions chart in the overview tab
    // as it already exists in its own tab
    
    // Count status types
    const statusCounts = {};
    surveyData.forEach(item => {
        if (item.Status) {
            statusCounts[item.Status] = (statusCounts[item.Status] || 0) + 1;
        }
    });
    
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    
    createPieChart(
        'statusChart',
        statusLabels,
        statusData,
        'Observability Status',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} companies`;
        }
    );
}
