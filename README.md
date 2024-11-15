# DataExporter (Commercetools Connector)

**DataExporter** is a **Commercetools Connect application** designed to automate the extraction of training data from Commercetools and export it to **Amazon S3**. This data powers real-time analytical tasks such as Market Basket Analysis (MBA), Content-Based Filtering (CBF), and Customer Segmentation (CS) and integrates seamlessly with an external machine learning service for advanced insights.

## Overview

DataExporter operates as a **job-type connector** that automates data extraction and processing on a fixed schedule. Specifically, it:

1. **Extracts Orders and Products Data**
   Retrieves key data related to orders and products from Commercetools for analytical purposes.
2. **Processes Data for Analytical Tasks**
   Formats and structures data for:
   * **Market Basket Analysis (MBA)**: Uncovering patterns in product co-occurrence within customer orders.
   * **Content-Based Filtering (CBF)**: Analyzing product attributes and customer preferences to deliver personalized recommendations.
   * **Customer Segmentation (CS)**: Structuring customer purchase data for segmentation based on behavior and preferences.
3. **Uploads Data to Amazon S3**
   Saves the processed training data in JSON format to an AWS S3 bucket, providing accessible, real-time data for live analytics.

## Key Features

1. **Automatic Data Export to Amazon S3**
   * Training data is automatically generated and uploaded to S3 in JSON format, ensuring easy access and integration for analytics.
2. **Commercetools Cron Job Log**
   * Logs for each cron job execution are stored as **custom objects** in Commercetools at `/custom-objects/cron-job-log`, capturing key job information and execution details.
3. **Merchant Center Customization**
   * A custom view in the Commercetools Merchant Center allows users to review the cron job logs and monitor the data export status.
   * [View Merchant Center Customization Repository](https://github.com/philipantony1007/poc-ct-merchant-center.git)
