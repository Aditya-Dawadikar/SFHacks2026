
# EV Charging Usage & Availability Analysis



## Project Overview

This project analyzes electric vehicle (EV) charging session data to understand daily charging behavior and identify peak usage periods. The primary objective is to determine at what times of the day charging stations are most utilized and when availability is likely to be high or low.

The analysis is based on historical charging session records, focusing on connection times, disconnection times, and energy delivered. By transforming raw session data into time-based occupancy insights, the project builds a foundation for future availability modeling and predictive analysis.

## Objective

The broader goal of this project is to provide a data-driven understanding of EV charging behavior. By accurately measuring hourly utilization patterns, the analysis supports smarter infrastructure planning, better availability forecasting, and future machine learning applications.



## Data Description


### ACN Dataset 

ACN-Data exists to help researchers access real data around electric vehicle charging. The dataset is made possible by a close collaboration with PowerFlex Systems which operates Adaptive Charging Networks around the United States.

Each entry in the dataset contains information about a single charging session. For more details on the data collected see the Fields and Sites tabs above.

https://ev.caltech.edu/dataset

### Electric Vehicle Charging Dataset by Mendeley Data


This electric vehicle (EV) charging dataset  includes the EV connection time, charging duration, energy consumption, and day number each corresponding respectively to connectionTime_decimal, chargingDuration, kWhDelivered, dayIndicator columns in the dataset for an EV charging parking lot. The data is generated using conditional tabular generative adversarial networks (CTGAN) and kernel density estimation (KDE) from the Caltech dataset to maintain a realistic load profile, accurately model EV owner behaviors, and preserve the relationship between the columns of the dataset. This dataset includes EV data for 29,600 days while the original Caltech dataset includes data for only 185 days. This data can be useful in training machine learning algorithms, specifically, reinforcement learning algorithms. The connection time range is 0-24. The unit for charging duration is hour and energy consumption is in kWh.

Published: 24 March 2024
Version 1

https://data.mendeley.com/datasets/5zrtmp7gwd/1

Gholizadeh, Nastaran (2024), “Electric Vehicle Charging Dataset”, Mendeley Data, V1, doi: 10.17632/5zrtmp7gwd.1


### Electric Vehicle Charging Patterns - Kaggle

by VALA KHORASANI

This dataset provides a comprehensive analysis of electric vehicle (EV) charging patterns and user behavior. It contains 1,320 samples of charging session data, including metrics such as energy consumption, charging duration, and vehicle details. Each entry captures various aspects of EV usage, allowing for insightful analysis and predictive modeling.

This dataset is ideal for researchers, data scientists, and analysts interested in understanding electric vehicle charging behaviors and developing predictive models related to energy consumption and user patterns.


https://www.kaggle.com/datasets/valakhorasani/electric-vehicle-charging-patterns



---

The dataset consists of EV charging session records. Each record includes:
- The timestamp when a vehicle connected to the charger
- The timestamp when the vehicle disconnected
- The total energy delivered during the session (in kWh)

The timestamps are originally provided in GMT format and represent real-world session activity.



## Data Preparation and Processing

The analysis follows several structured steps:

### 1. Data Storage and Extraction
- Raw JSON data is stored in Snowflake.
- The semi-structured data is flattened into a structured format for analysis.
- The structured table is loaded into a Snowflake Notebook environment.
- The dataset is converted into a Pandas DataFrame for further manipulation.

### 2. Timestamp Standardization
- Connection and disconnection times are converted into timezone-aware UTC datetime format.
- This ensures consistency for time-based aggregation and avoids timezone-related inconsistencies.

### 3. Usage Calculation

A key methodological decision in this project is to measure actual charger occupancy, not just arrival patterns.

Instead of counting sessions by connection hour only, the analysis:
- Accounts for the full duration of each charging session.
- Determines which hourly intervals each session spans.
- Expands sessions across the hours they were active.
- Counts how many charging sessions were active during each hour of the day.

This approach ensures that usage reflects real occupancy rather than just connection events.



## Usage Distribution Analysis

After expanding session durations into hourly intervals:
- The number of active charging sessions is aggregated by hour of day (0–23).
- A 24-hour distribution is created to visualize charger utilization patterns.
- This distribution highlights:
- Peak charging hours
- Low-demand periods
- Daily behavioral trends

The result provides a realistic picture of when charging infrastructure is most heavily used.



## Insights

This methodology allows us to identify high congestion hours, detect periods of low utilization and understand whether charging demand is concentrated in morning, midday, or evening. AS  duration is considered, the analysis reflects real infrastructure load rather than just session starts. By comparing usage intensity across different days this analysis can lay groundwork for estimating availability levels.

![alt text](https://file%2B.vscode-resource.vscode-cdn.net/Users/ha5hkat/Code/sf-hacks/SFHacks2026/DataAnalysis/STREAMLIT_MEDIA_FILE_B54C9EEAF96F4EE4A9418D525D7F03E1.png?version%3D1771182635661)

The comparison shows clear and distinct daily charging behavior patterns across the three locations. All locations exhibit very low usage during early morning hours (roughly 3:00–10:00 UTC), followed by a sharp increase beginning in the early afternoon. 

This project can be extended to analyze charging behavior across a broader range of locations with different usage contexts, such as offices, schools, residential areas, retail centers, and highway corridors. By incorporating location type metadata, the analysis can differentiate behavioral patterns driven by user lifestyle and mobility needs.


## Technology Stack
- Snowflake for data storage and transformation
- Snowflake Notebooks for integrated SQL and Python workflows
- Python (Pandas) for data manipulation
- Visualization tools for usage distribution analysis
- Github Copilot as a pair programmer


## Future Extensions

The current analysis establishes a strong foundation for more advanced work, including:
- Calculating utilization rates if station capacity is known.
- Classifying hours into high, medium, and low availability.
- Building predictive models to forecast congestion.
- Incorporating additional features such as day-of-week or charger type.
- Supporting infrastructure planning and load optimization strategies.






