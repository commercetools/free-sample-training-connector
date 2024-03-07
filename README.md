<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a></br>
  <b>A demo application to get started and learn about commercetools Connect</b>
</p>
A connector app to be used in self-learning training module. It contains a service app that allows distributing a sample product with limited configurable quanyity and an event app that will add a new product to a category supplied in the configurations. It also contains a job that removes products from the category after 30 days.

## Deployment instructions

Deploy this demo Connector into any project to learn and experience how commercetools Connect makes integrations quick and easy. This Connector contains three applications each of a different type.

### free-sample-product-service

It allows you to configure a sample product that you want to add to a cart that has the minimum total value. You can provide the SKU and the total quantity to be offered free. 

Configurations:

1. Sample product's SKU 
2. Offered free quantity
3. Minimum cart value
4. API credentials

### new-product-event-app

This event type app runs whenever a product is published and adds it to a category if the product was created less than a month ago.

Configurations:

1. Category key for new arrivals
2. API credentials

### new-category-cleanup-job-app

This job runs every day and removes the products from the new arrivals category if older than a month. 

Configurations:

1. Category key for new arrivals
2. API credentials
