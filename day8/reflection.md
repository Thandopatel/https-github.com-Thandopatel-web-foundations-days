# Reflection

**What was the most difficult concept in the course, and how did you overcome it?**
The most difficult concept for me was understanding database transactions and how they prevent race conditions (like double-booking). At first, I thought a simple check in the code (e.g., "if seat is available, buy it") was enough. I overcame this by learning about atomic conditional updates and unique constraints. I realized that the database itself must be the single source of truth to guarantee correctness under heavy traffic.

**Which part of your capstone would you improve, based on the feedback you received?**
Based on the feedback, I would improve the scaling strategy for the "Big Sale" peak. While my current design uses a cache and a waiting room, I would add a message queue (like RabbitMQ) to handle the payment processing asynchronously. This would prevent the database from locking up if thousands of users hit the "Pay" button at the exact same second.

**What will you learn next?**
Next, I want to learn more about infrastructure as code (Terraform) and how to set up automated CI/CD pipelines so deployments are seamless.