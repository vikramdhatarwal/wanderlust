# WanderLust

A full-stack travel accommodation platform inspired by Airbnb, built with **Node.js, Express, MongoDB, Passport.js, and MapTiler**, with optional Cloudinary image storage, containerized with **Docker**, and deployed on **AWS (ECS Fargate)**.

**Live Demo (AWS):** https://wanderlust.vikramdhatarwal.dev
**Backup Demo (Render):** https://wanderlust-zwvw.onrender.com

**Automated Testing:** 19 Playwright scenarios run across Chromium, Firefox, and WebKit (57 browser test runs).

WanderLust lets users browse, search, and filter stays, create and manage listings, upload images, leave reviews, and view listing locations on a map.

## Features

- Browse listings with search, category filters, and GST/tax toggle.
- View listing details with image, price, description, reviews, and map.
- Signup, login, logout, sessions, and flash messages.
- Profile page with account info, owned listings, listing count, and review count.
- Create, edit, and delete listings with owner-only authorization.
- Add and delete reviews with author-only authorization.
- Image uploads through Cloudinary or local disk storage.
- MapTiler maps, geocoding, and route support from visitor location.
- Joi validation and friendly error pages.
- Playwright end-to-end tests.

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB, Mongoose, Passport, passport-local-mongoose, express-session, connect-mongo, Joi
- **Frontend:** EJS, ejs-mate, Bootstrap, Font Awesome, custom CSS/JS
- **Uploads/Maps:** Multer with optional Cloudinary storage, MapTiler, OSRM
- **Testing:** Playwright, GitHub Actions
- **DevOps/Deployment:** Docker, AWS (ECR, ECS Fargate, Application Load Balancer, ACM), Render (backup), MongoDB Atlas

## Architecture (AWS)

```text
Browser
  -> DNS (CNAME: wanderlust.vikramdhatarwal.dev)
  -> Application Load Balancer
       HTTP :80  -> redirect (301) to HTTPS
       HTTPS :443 (ACM certificate) -> target group
  -> Amazon ECS service on AWS Fargate (Docker image from Amazon ECR)
  -> MongoDB Atlas / Cloudinary / MapTiler
```

- The Docker image is built locally and pushed to Amazon ECR (`ap-southeast-2`).
- The container runs as an Amazon ECS service on AWS Fargate, behind an Application Load Balancer.
- HTTPS is terminated at the load balancer with a free AWS Certificate Manager certificate.
- HTTP requests are redirected to HTTPS.
- The custom domain points to the load balancer through a DNS CNAME record.
- Configuration is passed to the container as environment variables at runtime and is not committed to the repository.
- The AWS deployment runs on a time-limited free plan, so the Render deployment is kept as a backup.

## Project Structure

```text
.
|-- app.js
|-- cloudConfig.js
|-- middleware.js
|-- schema.js
|-- Dockerfile
|-- controllers/
|-- models/
|-- public/
|-- routes/
|-- tests/
|-- utils/
`-- views/
```

## Setup

Requirements:

- Node.js `20.18.0`
- npm
- MongoDB connection string
- Cloudinary account (optional; without credentials, uploads use local disk storage)
- MapTiler token (optional; maps and geocoding need a valid token)
- Docker (optional, for the container run)

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAP_TOKEN=your_maptiler_token
PORT=3000
```

You can use `CLOUDINARY_URL` instead of the three separate Cloudinary variables.

Start the app:

```bash
node app.js
```

Local URL:

```text
http://localhost:3000
```

## Run with Docker

```bash
docker build -t wanderlust .
docker run -p 3000:3000 --env-file .env wanderlust
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ATLASDB_URL` | Yes | MongoDB and session store connection. |
| `SECRET` | Yes | Session and store encryption secret. |
| `CLOUD_NAME` | Optional | Cloudinary cloud name; use with the API key and secret to enable Cloudinary uploads. |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret. |
| `CLOUDINARY_URL` | Optional | Single Cloudinary config variable. |
| `MAP_TOKEN` | Recommended | MapTiler maps and geocoding token. |
| `MAP_API_KEY` | Optional | Alternate supported MapTiler env name. |
| `PORT` | Optional | Defaults to `3000`. |
| `NODE_ENV` | Optional | Use `production` when deployed. |

## Scripts

| Command | Description |
| --- | --- |
| `node app.js` | Start the server. |
| `npm test` | Run Playwright tests. |
| `npm run test:headed` | Run tests in headed browsers. |
| `npm run test:report` | Open Playwright report. |

On Windows PowerShell, use `npx.cmd` if `npx` is blocked:

```bash
npx.cmd playwright test --project=chromium
```

## Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Home page. |
| `GET` | `/listings` | Browse, search, and filter listings. |
| `GET` | `/listings/new` | New listing form. Login required. |
| `POST` | `/listings` | Create listing. Login required. |
| `GET` | `/listings/:id` | Show listing details. |
| `GET` | `/listings/:id/edit` | Edit listing form. Owner required. |
| `PUT` | `/listings/:id` | Update listing. Owner required. |
| `GET` | `/listings/:id/delete` | Delete confirmation. Owner required. |
| `DELETE` | `/listings/:id` | Delete listing. Owner required. |
| `POST` | `/listings/:id/reviews` | Add review. Login required. |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete review. Author required. |
| `GET` | `/register` | Signup form. |
| `POST` | `/register` | Create account. |
| `GET` | `/login` | Login form. |
| `POST` | `/login` | Authenticate user. |
| `GET` | `/profile` | User profile. Login required. |
| `GET` | `/logout` | Log out. |

## Data and Validation

Listings include title, description, image, price, category, location, country, geometry, owner, and reviews.

Supported categories: `Trending`, `Rooms`, `Mountains`, `Castles`, `Pools`, `Nature`, `Farms`, `Igloos`, `Arctic`, `Other`.

Reviews include rating, comment, author, and timestamp. Ratings must be from `1` to `5`. Listing fields and review fields are validated with Joi before database writes.

## Uploads and Maps

When Cloudinary is configured, images are uploaded to this folder:

```text
wanderlust_DEV
```

Allowed formats: JPG, JPEG, PNG.

Listing pages use MapTiler for maps/geocoding and OSRM for route drawing. Browser location routing requires HTTPS or `localhost`, location permission, and a valid map token.

## Testing

Set these environment variables for tests that log in to the configured test database. Playwright does not load `.env.test` automatically, so provide them in your shell or CI environment:

```env
TEST_USERNAME=demo
TEST_PASSWORD=1234
```

These credentials must exist in the test target database. The current Playwright config targets the deployed Render app:

```text
https://wanderlust-zwvw.onrender.com
```

Run tests:

```bash
npm test
```

Run Chromium only:

```bash
npx.cmd playwright test --project=chromium
```

GitHub Actions runs the Playwright suite against a local app instance backed by a disposable MongoDB service, so CI does not depend on a live deployment.

The suite covers auth, signup, protected redirects, profile, listing CRUD, search/filtering, tax toggle, reviews, validation, navigation, and 404 handling. Tests run with one worker because they share the deployed database and test account.

## Deployment

### AWS (Docker, ECS Fargate)

1. Build the image: `docker build -t wanderlust .`
2. Push it to Amazon ECR (use "View push commands" in the ECR console).
3. Run the image as an Amazon ECS service on AWS Fargate behind an Application Load Balancer, with a target group on the app port.
4. Attach an ACM certificate to an HTTPS:443 listener and redirect HTTP:80 to HTTPS.
5. Point your domain's CNAME record at the load balancer.
6. Provide the environment variables below to the task definition.

### Render (backup)

```text
Build Command: npm install
Start Command: node app.js
```

Required production env vars:

```env
ATLASDB_URL=...
SECRET=...
CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MAP_TOKEN=...
NODE_ENV=production
```

## Notes

- The AWS deployment runs on a time-limited free plan; the Render deployment stays up as a backup.
- Render free instances may be slow on first load.
- OSRM is public, so routing speed and availability may vary.
- Tests that create users or listings write to the configured target database.

## Author

Created by Vikram Dhatarwal.
