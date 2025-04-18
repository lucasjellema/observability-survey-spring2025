/**
 * Chart Service Module
 * Handles creation and configuration of charts
 */

/**
 * Create a pie/doughnut chart
 * @param {String} canvasId - ID of the canvas element
 * @param {Array} labels - Labels for the chart
 * @param {Array} data - Data values for the chart
 * @param {String} title - Chart title
 * @param {Function} tooltipCallback - Optional custom tooltip callback
 * @returns {Object|null} Chart instance or null if canvas not found
 */
export function createPieChart(canvasId, labels, data, title, tooltipCallback = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element with ID '${canvasId}' not found. Chart cannot be created.`);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Default colors for chart segments
    const backgroundColors = [
        '#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545',
        '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'
    ];
    
    // Extend colors array if needed
    while (backgroundColors.length < data.length) {
        backgroundColors.push(...backgroundColors);
    }
    
    // Configure tooltip callback
    const tooltipOptions = tooltipCallback ? {
        callbacks: {
            label: tooltipCallback
        }
    } : {};
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                tooltip: tooltipOptions
            }
        }
    });
}

/**
 * Create a bar chart
 * @param {String} canvasId - ID of the canvas element
 * @param {Array} labels - Labels for the chart
 * @param {Array} data - Data values for the chart
 * @param {String} title - Chart title
 * @param {Function} tooltipCallback - Optional custom tooltip callback
 * @returns {Object|null} Chart instance or null if canvas not found
 */
export function createBarChart(canvasId, labels, data, title, tooltipCallback = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element with ID '${canvasId}' not found. Chart cannot be created.`);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Configure tooltip callback
    const tooltipOptions = tooltipCallback ? {
        callbacks: {
            label: tooltipCallback
        }
    } : {};
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Companies',
                data: data,
                backgroundColor: '#0d6efd',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                tooltip: tooltipOptions
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Create a stacked bar chart
 * @param {String} canvasId - ID of the canvas element
 * @param {Array} labels - Labels for the chart
 * @param {Array} datasets - Datasets for the chart
 * @param {String} title - Chart title
 * @returns {Object|null} Chart instance or null if canvas not found
 */
export function createStackedBarChart(canvasId, labels, datasets, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element with ID '${canvasId}' not found. Chart cannot be created.`);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        footer: (tooltipItems) => {
                            const item = tooltipItems[0];
                            const dataset = item.dataset;
                            const productName = labels[item.dataIndex];
                            const companies = dataset.companies[item.dataIndex];
                            
                            if (companies && companies.length > 0) {
                                return [
                                    'Companies:',
                                    ...companies.map(company => `- ${company}`)
                                ];
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}
