# DataExporter (Commercetools Connector)

**DataExporter** is a **Commercetools Connect application** designed to automate the extraction of training data from Commercetools and export it to Amazon S3. The data is used for real-time analytical purposes, including Market Basket Analysis (MBA), Content-Based Filtering (CBF), and Customer Segmentation (CS), and is integrated with an external machine learning service for advanced insights.

## Overview

DataExporter is a **job-type connector** that runs on a fixed schedule to:

* Extract **orders** and **products** data from Commercetools.
* Process this data for the following analytical tasks:
  * **Market Basket Analysis (MBA)**: Identifies patterns in product co-occurrence within customer orders.
  * **Content-Based Filtering (CBF)**: Analyzes product attributes and customer orders for personalized recommendations.
  * **Customer Segmentation (CS)**: Structures data to enable customer segmentation based on purchase behavior.
* Uploads the processed training data to **AWS S3** in JSON format, enabling real-time, live analytics powered by an external machine learning service.
