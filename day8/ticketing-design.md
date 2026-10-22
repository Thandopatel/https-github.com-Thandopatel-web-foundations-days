# TicketHub: System Design Document

## 1. Requirements

**Functional Requirements:**
*   Users can browse a list of events.
*   Users can view available seats for a specific event.
*   Users can temporarily hold a seat while checking out.
*   Users can pay for their held seats.
*   Users can view their purchased tickets.

**Non-Functional Requirements:**
*   **Speed:** Seat maps must load in under 500ms. The checkout process must be highly responsive.
*   **Correctness:** The system must *never* double-book a seat. Every payment must exactly match a held seat.
*   **Fairness:** The system must be fair to all users. Bots should not be able to buy all the tickets instantly, and users should not be able to hold seats indefinitely without paying.

## 2. Estimates

**Normal Traffic:**
*   **Users:** 50,000 daily visitors.
*   **Page Views:** Each user views 10 pages = **500,000 page views per day**.
*   **Sales:** 5,000 tickets sold per day. Read-to-write ratio is very high (mostly browsing, few buying).

**Big Sale Peak:**
*   **Users:** 200,000 people trying to buy 20,000 seats in the first 10 minutes.
*   **Traffic Spikes:** 200,000 users in 600 seconds = **~333 requests per second (RPS) just for the purchase page**, not including page loads. 
*   **Comparison:** The big sale creates a traffic spike over 100x the normal rate, with a highly intense burst of write requests (holding seats).

## 3. API Design

*   `GET /events` : Browse available events.
*   `GET /events/{event_id}/seats` : View the seat map and availability.
*   `POST /events/{event_id}/seats/{seat_id}/hold` : Temporarily lock a seat for 5 minutes.
*   `POST /orders` : Submit payment and finalize the ticket purchase.
*   `GET /users/me/tickets` : View purchased tickets.

## 4. Data Model

*   **Users:** `id` (PK), `name`, `email`
*   **Events:** `id` (PK), `name`, `date`, `venue`
*   **Seats:** `id` (PK), `event_id` (FK), `seat_number`, `status` (AVAILABLE, HELD, SOLD), `held_until` (timestamp)
*   **Orders:** `id` (PK), `user_id` (FK), `seat_id` (FK - **Unique Constraint**), `amount`, `status` (PENDING, PAID)

**Relationships:** 
*   One Event has many Seats (1:N).
*   One User has many Orders (1:N).
*   One Seat can have only one Order (1:1 unique constraint).

## 5. Preventing Double-Booking

Double-booking is prevented using **database transactions** and **unique constraints**.
When a user tries to buy a seat, the system executes an atomic conditional update:
`UPDATE seats SET status = 'SOLD' WHERE id = 123 AND status = 'HELD' AND held_until > NOW();`
Because this happens inside a transaction, the database locks the row. If two users try to buy the exact same seat at the exact same millisecond, the first transaction succeeds and locks the row; the second transaction fails because the condition (`status = 'HELD'`) is no longer met. Furthermore, a **Unique Constraint** on `Orders.seat_id` ensures no two orders can ever be created for the same seat, acting as a final safety net.

## 6. Architecture

![TicketHub Architecture Diagram](./architecture.png)

*   **CDN:** Serves static assets (images, CSS, JS) so the app servers don't waste CPU on them.
*   **Load Balancer:** Distributes the 200,000 users across multiple app servers (Horizontal Scaling).
*   **Virtual Waiting Room:** During the "Big Sale", new users are placed in a queue before they even hit the app servers. This smooths out the traffic spike.
*   **Redis Cache:** Serves the seat map data for reading. Instead of hitting the database 200,000 times, the app reads from Redis.
*   **Database (PostgreSQL):** The source of truth. It is protected from the massive read load by the cache, and protected from double-booking by transactions.

**How it survives the big sale:** The Waiting Room prevents the servers from crashing by controlling the flow of users. The Redis cache absorbs the massive read traffic. The database only handles the exact number of write transactions allowed through the waiting room.

## 7. Trade-offs

1.  **Cache Consistency vs. Speed:** We use Redis to cache the seat map for fast loading (Speed). However, this means the cache might be a few milliseconds out of date. We trade absolute real-time accuracy for massive speed improvements.
2.  **Fairness vs. User Experience:** Using a virtual waiting room is fair, but it means some users have to wait in a digital line, which can be frustrating. We trade instant access for system stability and fairness.