# WanderLust

A full-stack travel accommodation platform inspired by Airbnb, built with **Node.js, Express, MongoDB, Passport.js, Cloudinary, and MapTiler**.

**Live Demo:** https://wanderlust-zwvw.onrender.com

**Automated Testing:** 57 Playwright End-to-End Tests Passing

WanderLust is a full-stack travel accommodation app inspired by stay marketplace platforms. Users can browse, search, and filter stays, create and manage listings, upload images, leave reviews, and view listing locations on a map.



## Features

- Browse listings with search, category filters, and GST/tax toggle.
- View listing details with image, price, description, reviews, and map.
- Signup, login, logout, sessions, and flash messages.
- Profile page with account info, owned listings, listing count, and review count.
- Create, edit, and delete listings with owner-only authorization.
- Add and delete reviews with author-only authorization.
- Cloudinary image uploads.
- MapTiler maps, geocoding, and route support from visitor location.
- Joi validation and friendly error pages.
- Playwright end-to-end tests.

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB, Mongoose, Passport, express-session, connect-mongo, Joi
- **Frontend:** EJS, ejs-mate, Bootstrap, Font Awesome, custom CSS/JS
- **Uploads/Maps:** Cloudinary, Multer, multer-storage-cloudinary, MapTiler, OSRM
- **Testing:** Playwright
- **Deployment:** Render, MongoDB Atlas

## Project Structure

```text
.
|-- app.js
|-- cloudConfig.js
|-- middleware.js
|-- schema.js
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
- Cloudinary account
- MapTiler token

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

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ATLASDB_URL` | Yes | MongoDB and session store connection. |
| `SECRET` | Yes | Session and store encryption secret. |
| `CLOUD_NAME` | Yes, unless using `CLOUDINARY_URL` | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes, unless using `CLOUDINARY_URL` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes, unless using `CLOUDINARY_URL` | Cloudinary API secret. |
| `CLOUDINARY_URL` | Optional | Single Cloudinary config variable. |
| `MAP_TOKEN` | Recommended | MapTiler maps and geocoding token. |
| `MAP_API_KEY` | Optional | Alternate supported MapTiler env name. |
| `PORT` | Optional | Defaults to `3000`. |
| `NODE_ENV` | Optional | Use `production` on Render. |

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

Images are uploaded to Cloudinary folder:

```text
wanderlust_DEV
```

Allowed formats: JPG, JPEG, PNG.

Listing pages use MapTiler for maps/geocoding and OSRM for route drawing. Browser location routing requires HTTPS or `localhost`, location permission, and a valid map token.

## Testing

Create `.env.test`:

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

The suite covers auth, signup, protected redirects, profile, listing CRUD, search/filtering, tax toggle, reviews, validation, navigation, and 404 handling. Tests run with one worker because they share the deployed database and test account.

## Deployment

Recommended Render settings:

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

- There is no `start` script yet; use `node app.js`.
- Render free instances may be slow on first load.
- OSRM is public, so routing speed and availability may vary.
- Tests that create users or listings write to the configured target database.

## Author

Created by Vikram Dhatarwal.
