/**
 * Telemetry Tab Module
 * Handles rendering and functionality for the Telemetry Types tab
 */

import { getSurveyData, countArrayItems, getCompaniesWithItem } from '../dataService.js';
import { createBarChart } from '../chartService.js';
import { populateSelect, displayCompanies } from '../uiHelpers.js';

/**
 * Render the Telemetry Types tab
 */
export function renderTelemetryTab() {
    const surveyData = getSurveyData();
    
    // Count telemetry types
    const telemetryCounts = countArrayItems(surveyData, 'typesOfTelemetry');
    
    // Sort by count (descending)
    const sortedTelemetry = Object.entries(telemetryCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    
    const telemetryLabels = Object.keys(sortedTelemetry);
    const telemetryData = Object.values(sortedTelemetry);
    
    // Create bar chart
    createBarChart(
        'telemetryChart',
        telemetryLabels,
        telemetryData,
        'Telemetry Types Usage',
        context => {
            const label = context.label || '';
            const value = context.raw || 0;
            const companies = getCompaniesWithItem(surveyData, 'typesOfTelemetry', label);
            return `${label}: ${value} companies (${Math.round(value / surveyData.length * 100)}%)`;
        }
    );
    
    // Populate telemetry select dropdown
    populateSelect('telemetrySelect', telemetryLabels);
    
    // Add event listener for telemetry select
    document.getElementById('telemetrySelect').addEventListener('change', function() {
        const selectedTelemetry = this.value;
        if (selectedTelemetry) {
            const companies = getCompaniesWithItem(surveyData, 'typesOfTelemetry', selectedTelemetry);
            displayCompanies('telemetryCompanies', companies);
        } else {
            document.getElementById('telemetryCompanies').innerHTML = '';
        }
    });
}
