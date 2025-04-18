# Observability Survey Dashboard - Spring 2025

An interactive web dashboard visualizing the results of the Spring 2025 Observability Survey. This dashboard provides insights into how different companies approach observability, what tools they use, and their future plans.

## Features

- **Overview**: General statistics about survey participants and responses
- **Telemetry Types**: Analysis of different telemetry types used by companies
- **Observability Dimensions**: Visualization of various observability dimensions
- **Sources of Telemetry**: Where companies collect their telemetry data from
- **Automatic Processing**: How companies process observability data
- **Facets & Elements**: Observability elements present in companies
- **Challenges & Aspirations**: Companies' challenges and future plans
- **Roadmap & Strategy**: Companies' strategic approaches to observability
- **Products**: Analysis of observability tool usage (past, present, future)
- **Company Details**: Detailed profiles for each participating company

## Architecture

The dashboard follows a modular JavaScript architecture:

- **Core Modules**:
  - `dataService.js`: Handles data loading and processing
  - `chartService.js`: Creates and configures all chart visualizations
  - `uiHelpers.js`: Provides UI manipulation utilities

- **Tab-Specific Modules**:
  - Each dashboard tab has its own module in `js/modules/tabs/`
  - Separation of concerns for better maintainability

- **Main Entry Point**:
  - `main.js`: Initializes the application and coordinates module interactions

## Data Handling

- **Default Data Source**: `data/observability_survey.json`
- **Dynamic Data Loading**: Support for loading data from external URLs via the `parDataFile` query parameter
- **Data Obfuscation**: Use `obfuscate_data.py` to anonymize company names, person names, and product names

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+ Modules)
- **Visualization**: Chart.js for interactive charts
- **Styling**: Bootstrap 5 for responsive design
- **Data Processing**: Python for data conversion and obfuscation

## Setup

1. Clone the repository
2. Run a local web server in the project directory:
   ```
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

### Using Obfuscated Data

To use the obfuscated version of the survey data:

1. Run the obfuscation script:
   ```
   python obfuscate_data.py
   ```
2. Access the dashboard with the obfuscated data:
   ```
   http://localhost:8000/index.html?parDataFile=data/observability_survey_obfuscated.json
   ```

## Interactive Features

- **Tooltips**: Hover over chart elements to see detailed company information
- **Filtering**: Select specific dimensions or categories to filter the data
- **Company Profiles**: View detailed information about each participating company
- **Responsive Design**: Optimized for both desktop and mobile viewing

## License

This project is available for use under the MIT license.
