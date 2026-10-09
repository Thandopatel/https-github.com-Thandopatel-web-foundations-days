SnapShare Scaling Plan

Day 7 Assignment — Scaling a Photo-Sharing App

ASSUMPTIONS

- 10,000,000 registered users
- 10% of them use the app on a given day, so there are 1,000,000 daily active users (DAU)
- Each active user uploads 1 photo per day
- Each active user views 50 feed pages per day
- An average photo is 2 MB
- Each photo also gets a 50 KB thumbnail
- Seconds in a day ≈ 86,400 (rounded to 100,000 for easy maths)
- Peak traffic is approximately 5× the average

Daily Active Users:
10,000,000 registered users × 10% = 1,000,000 daily active users (DAU)



ESTIMATES


Uploads per second (average):
1,000,000 users × 1 photo = 1,000,000 uploads per day
1,000,000 ÷ 100,000 ≈ 10 uploads per second

Uploads per second (peak):
10 uploads/s × 5 = 50 uploads per second at peak

Feed views per second (average):
1,000,000 users × 50 feed pages = 50,000,000 feed views per day
50,000,000 ÷ 100,000 ≈ 500 feed views per second

Feed views per second (peak):
500 feed views/s × 5 = 2,500 feed views per second at peak

Storage per year:
Photos:     1,000,000 photos/day × 2 MB   = 2,000,000 MB/day = 2,000 GB/day
Thumbnails: 1,000,000 photos/day × 50 KB  = 50,000,000 KB/day = 50 GB/day

Total per day  = 2,050 GB
Total per year = 2,050 GB × 365 ≈ 748,250 GB ≈ 750 TB per year



READ-HEAVY OR WRITE-HEAVY?


SnapShare is extremely read-heavy:

Activity                     Average          Peak
Uploads (writes)             10/s             50/s
Feed views (reads)           500/s            2,500/s

There are 50× more reads than writes on average. This means:

- Caching is critical. Feed pages should be cached aggressively (Redis) so the database is not hit for every scroll.
- Read replicas are essential. The primary database handles writes; multiple read replicas serve feed queries.
- The database should be optimised for reads. Good indexes on user IDs and timestamps, and possibly denormalised feed tables.
- Object storage and CDN handle the heavy media load. The database only stores metadata (photo ID, user ID, URL, timestamp), not the actual image bytes.




WHY PHOTOS SHOULD NOT BE STORED INSIDE THE DATABASE


Storing 2 MB photos as BLOBs inside a relational database is a bad idea because:

1. Databases are expensive storage. Database storage costs far more per GB than object storage.
2. Backups become huge and slow. A 750 TB/year database backup is impractical.
3. Queries slow down. Large binary blobs bloat tables and indexes, making even simple metadata queries slower.
4. Scaling is harder. You cannot easily shard or replicate a database full of multi-megabyte blobs.
5. Databases are not designed for serving static files. They lack the HTTP caching, range requests, and edge distribution that a CDN provides.

Instead, photos go to object storage (e.g. Amazon S3, Google Cloud Storage, Cloudflare R2). Object storage is cheap, durable, infinitely scalable, and designed for large binary files. The database stores only the metadata (photo ID, user ID, object storage URL, timestamp, caption) and the CDN serves the actual image bytes to users.



ARCHITECTURE DIAGRAM (TEXT)
## ARCHITECTURE DIAGRAM (TEXT)

```
                              ┌─────────┐
                   ┌─────────>│   DNS   │ (snapshare.com → IP addresses)
                   │          └─────────┘
                   │
          ┌────────┴────────┐   static files   ┌──────────────────────────┐
          │  Browser /      │ ───────────────> │  CDN                     │
          │  mobile client  │                  │  (HTML, CSS, JS, photos, │
          └────────┬────────┘                  │   thumbnails)            │
                   │                           └────────────┬─────────────┘
                   │ API calls (HTTPS, JSON)                │
                   v                                        │ (cache miss)
          ┌─────────────────┐                               │
          │  Load balancer  │                               v
          └────────┬────────┘                    ┌──────────────────────┐
                   │                             │  Object storage      │
        ┌──────────┼──────────┐                  │  (S3 / GCS / R2)     │
        v          v          v                  │  original photos +   │
   ┌─────────┐┌─────────┐┌─────────┐             │  thumbnails          │
   │ App 1   ││ App 2   ││ App 3   │             └──────────────────────┘
   └────┬────┘└────┬────┘└────┬────┘
        │          │          │
        │ writes   │ reads    │ jobs
        v          v          v
   ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
   │ Primary │>│  Read    │ │  Queue  │─>│  Worker  │
   │   DB    │ │ replicas │ │(RabbitMQ│ │(thumbnail│
   │(metadata│ │(metadata │ │ / SQS)  │ │ creator) │
   │  only)  │ │  only)   │ └─────────┘ └──────────┘
   └─────────┘ └──────────┘
        ^
        │
   ┌────┴────┐
   │  Cache  │
   │ (Redis) │
   └─────────┘
```

## COMPONENT EXPLANATIONS (ONE SENTENCE EACH)




COMPONENT EXPLANATIONS (ONE SENTENCE EACH)

- DNS: Translates the human-readable domain name into the IP address of the load balancer.

- CDN: Serves static files (HTML, CSS, JS) and photo/thumbnail files from edge servers close to the user, reducing latency and offloading traffic from our origin.

- Load balancer: Distributes incoming API requests across multiple app servers so no single server is overwhelmed and failed servers are bypassed.

- App servers (1–3): Run the application logic — authenticating users, handling feed requests, processing uploads, and talking to the cache, database, and queue.

- Cache (Redis): Stores frequently accessed data (e.g. feed pages, user sessions) in memory so repeated reads are served in ~1 ms instead of querying the database.

- Primary database: Holds the authoritative copy of all metadata (users, follows, photo records) and handles all writes.

- Read replicas: Copy the primary database and serve read queries (feed lookups), reducing load on the primary and allowing it to focus on writes.

- Object storage: Stores the actual photo files (2 MB) and thumbnails (50 KB) cheaply, durably, and at virtually unlimited scale.

- Queue: Buffers slow background jobs (thumbnail creation) so the app server can respond to the user immediately without waiting.

- Worker: Takes thumbnail jobs from the queue, downloads the original photo from object storage, creates a 50 KB thumbnail, and uploads it back to object storage.




 FLOW: STEP BY STEP

1. User selects a photo in the SnapShare app and taps "Upload".

2. App server receives the request (via the load balancer) and validates the user's authentication token.

3. App server requests a pre-signed upload URL from object storage (or streams the file directly through the app server to object storage).

4. The photo file (2 MB) is uploaded to object storage (S3/GCS/R2). The app server does not store the image bytes in the database.

5. App server writes a metadata record to the primary database: photo_id, user_id, object_storage_url, timestamp, caption. This is a small, fast write (~5–10 ms).

6. App server adds a "create thumbnail" job to the queue (e.g. { photo_id: 42, original_url: "..." }).

7. App server responds immediately with 201 Created and the photo's metadata. The user sees the photo in their feed right away (using the original image, which the CDN can serve).

8. Worker picks up the job from the queue, downloads the original 2 MB photo from object storage, resizes it to a 50 KB thumbnail, and uploads the thumbnail back to object storage.

9. Worker updates the database (or object storage metadata) with the thumbnail URL.

10. Future feed views serve the 50 KB thumbnail from the CDN instead of the 2 MB original, saving bandwidth and speeding up page loads.


TRADE-OFFS


1. SPEED VS. FRESHNESS (CACHING FEED PAGES)

Gain: Caching feed pages in Redis means most feed views are served in ~1 ms instead of querying the database (~20 ms). With 2,500 peak feed views per second, this is essential.

Cost: A user who posts a new photo might not see it in their own feed for a few seconds if their feed page is cached with a TTL. We accept this because a few seconds of staleness is fine for a social feed, but it would not be acceptable for a banking app.

Decision: Use a short TTL (e.g. 30–60 seconds) on feed caches and invalidate the user's own feed cache immediately when they upload a new photo.

---

2. CONSISTENCY VS. AVAILABILITY (READ REPLICAS)

Gain: Read replicas let us scale reads horizontally and survive the primary database failing (a replica can be promoted). With 50× more reads than writes, this is critical.

Cost: Replication lag means a read replica may briefly show slightly old data (eventual consistency). A user might upload a photo and then not see it in their feed for a few milliseconds if the read hits a replica that hasn't caught up yet.

Decision: For SnapShare, eventual consistency is acceptable. We route the user's own recent writes to the primary (or cache them locally) so they always see their own updates immediately, while other users' feeds can tolerate a tiny delay.

3. SIMPLICITY VS. SCALABILITY (MICROSERVICES VS. MONOLITH)

Gain: A monolith (one app server running all code) is simple to build, test, and deploy. For a new product, this is the right choice.

Cost: As the team grows, a monolith becomes harder to scale and deploy independently. Splitting into microservices (feed service, upload service, notification service) adds network failures, harder debugging, and more infrastructure.

Decision: Start with a well-organised monolith. Split out the thumbnail worker first (it is already a separate process via the queue) and consider splitting the feed service later only if needed.

---

4. COST VS. RELIABILITY (MULTI-REGION OBJECT STORAGE)

Gain: Replicating object storage across multiple regions ensures photos are available even if one region fails, and reduces latency for users worldwide.

Cost: Multi-region storage and CDN egress costs are significantly higher than single-region storage.

Decision: For SnapShare at 1 million DAU, start with a single region plus a global CDN. Add multi-region replication only when the user base and budget justify it.

SUMMARY

Metric                              Value
Daily active users                  1,000,000
Uploads per second (average)        10
Uploads per second (peak)           50
Feed views per second (average)     500
Feed views per second (peak)        2,500
Photo storage per year              ~750 TB
System type                         Read-heavy (50× more reads than writes)
Photos stored in                    Object storage (S3/GCS/R2), not the database
Database stores                     Metadata only (photo ID, user ID, URL, timestamp)
Key scaling strategies              CDN, cache (Redis), read replicas, queue + worker for thumbnails