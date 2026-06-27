# WanderLust

WanderLust is a full-stack travel accommodation web app inspired by marketplace-style stay booking platforms. Users can explore listings, filter and search destinations, view detailed listing pages, create and manage their own listings, upload listing images, leave reviews, and use an interactive map to locate stays and route from their current location.

Live app: https://wanderlust-zwvw.onrender.com

## Features

- Browse all stays with responsive listing cards.
- Search listings by title, description, location, or country.
- Filter listings by category, including Trending, Rooms, Mountains, Castles, Pools, Nature, Farms, Igloos, and Arctic.
- View detailed listing pages with image, description, price, owner actions, reviews, and map.
- User authentication with signup, login, logout, and persistent sessions.
- Protected listing creation, editing, deletion, and review actions.
- Profile page showing account details, listing count, review count, and the user's owned listings.
- Review system with star ratings, comments, review ownership checks, and delete support.
- Cloudinary image upload support for listing images.
- MapTiler-powered listing maps with geocoding.
- Route drawing from the visitor's current browser location to the listing destination.
- Friendly flash messages and polished error pages.
- Server-side validation with Joi.
- MongoDB session storage with `connect-mongo`.

## Tech Stack

**Backend**

- Node.js
- Express 5
- MongoDB
- Mongoose
- Passport.js
- passport-local
- passport-local-mongoose
- express-session
- connect-mongo
- method-override
- Joi

**Frontend**

- EJS
- ejs-mate layouts
- Bootstrap 5
- Font Awesome
- Custom CSS

**Media and Maps**

- Cloudinary
- Multer
- multer-storage-cloudinary
- MapTiler SDK
- OSRM public routing API

**Deployment**

- Render
- MongoDB Atlas

## Project Structure

```text
.
|-- app.js
|-- cloudConfig.js
|-- middleware.js
|-- schema.js
|-- controllers/
|   |-- listings.js
|   |-- reviews.js
|   `-- users.js
|-- models/
|   |-- listing.js
|   |-- review.js
|   `-- user.js
|-- public/
|   |-- css/
|   |   |-- rating.css
|   |   `-- style.css
|   `-- js/
|       |-- map.js
|       `-- script.js
|-- routes/
|   |-- listing.js
|   |-- review.js
|   `-- user.js
|-- utils/
|   |-- ExpressError.js
|   `-- wrapAsync.js
`-- views/
    |-- includes/
    |-- layouts/
    |-- listings/
    `-- users/
```

## Getting Started

### Prerequisites

- Node.js `20.18.0`
- npm
- MongoDB Atlas database or local MongoDB instance
- Cloudinary account
- MapTiler API token

### Installation

1. Clone the repository.

```bash
git clone <your-repository-url>
cd "Wonder Lust major project"
```

2. Install dependencies.

```bash
npm install
```

3. Create a `.env` file in the project root.

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAP_TOKEN=your_maptiler_token
```

You can also use `CLOUDINARY_URL` instead of the three separate Cloudinary variables if your Cloudinary setup provides one.

4. Start the server.

```bash
node app.js
```

5. Open the app locally.

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ATLASDB_URL` | Yes | MongoDB connection string used by Mongoose and session storage. |
| `SECRET` | Yes | Session secret used by `express-session` and `connect-mongo`. |
| `CLOUD_NAME` | Yes, unless using `CLOUDINARY_URL` | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes, unless using `CLOUDINARY_URL` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes, unless using `CLOUDINARY_URL` | Cloudinary API secret. |
| `CLOUDINARY_URL` | Optional | Alternative single Cloudinary connection variable. |
| `MAP_TOKEN` | Recommended | MapTiler API token used for maps and geocoding. |
| `MAP_API_KEY` | Optional | Fallback name supported by the app for the MapTiler token. |
| `PORT` | Optional | Server port. Defaults to `3000`. |
| `NODE_ENV` | Optional | Use `production` in deployed environments. |

## Main Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Home page. |
| `GET` | `/listings` | Browse, search, and filter listings. |
| `GET` | `/listings/new` | New listing form. Requires login. |
| `POST` | `/listings` | Create a listing with optional image upload. Requires login. |
| `GET` | `/listings/:id` | Show one listing with reviews and map. |
| `GET` | `/listings/:id/edit` | Edit listing form. Requires owner. |
| `PUT` | `/listings/:id` | Update listing. Requires owner. |
| `GET` | `/listings/:id/delete` | Delete confirmation page. Requires owner. |
| `DELETE` | `/listings/:id` | Delete listing. Requires owner. |
| `POST` | `/listings/:id/reviews` | Add a review. Requires login. |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete a review. Requires review author. |
| `GET` | `/register` | Signup form. |
| `POST` | `/register` | Create a user account. |
| `GET` | `/login` | Login form. |
| `POST` | `/login` | Authenticate user. |
| `GET` | `/profile` | Logged-in user's profile dashboard. |
| `GET` | `/logout` | Log out. |

## Authentication and Authorization

WonderLust uses Passport local authentication. Password hashing and username handling are provided by `passport-local-mongoose`.

Protected actions include:

- Creating listings.
- Editing listings.
- Deleting listings.
- Adding reviews.
- Deleting reviews.
- Viewing the profile page.

Owner-only actions are checked server-side. A user can only edit or delete their own listings, and a review can only be deleted by its author.

When a logged-out user tries to access a protected page, the app saves the intended page and redirects them back after successful login.

## Listings

Each listing contains:

- Title
- Description
- Image URL and Cloudinary filename
- Price
- Category
- Location
- Country
- GeoJSON-style map geometry
- Reviews
- Owner

Listings are validated with Joi before create and update operations. Categories are restricted to the supported category list in `schema.js` and `models/listing.js`.

## Reviews

Reviews contain:

- Rating from 1 to 5
- Comment
- Creation timestamp
- Author reference

Reviews are connected to listings through the listing's `reviews` array. When a listing is deleted, its review documents are also cleaned up through a Mongoose post-delete hook.

## Maps and Routing

The listing detail page includes a MapTiler map. The app supports:

- Server-side geocoding when listings are created or updated.
- Browser-side geocoding fallback if coordinates are missing.
- Destination marker on the listing location.
- Current-location routing after the user clicks the Go button.
- Route drawing through OSRM.
- Google Maps fallback link if route drawing fails.

Current-location routing requires:

- Browser location permission.
- `localhost` or HTTPS.
- A valid MapTiler token.
- A route available through OSRM.

## Image Uploads

Listing images are uploaded through Multer and stored in Cloudinary using `multer-storage-cloudinary`.

The configured Cloudinary folder is:

```text
wanderlust_DEV
```

Supported image formats:

- JPG
- JPEG
- PNG

## Error Handling

The app uses:

- `wrapAsync` to forward async errors to Express error middleware.
- `ExpressError` for intentional HTTP errors.
- Centralized 404 handling.
- Friendly error pages with icons and actions.
- Flash messages for common user-facing feedback.

Common Mongoose `CastError` cases are converted into user-friendly 404 responses.

## Deployment Notes

The live app is deployed at:

```text
https://wanderlust-zwvw.onrender.com
```

For Render deployment, configure environment variables in the Render dashboard. At minimum:

```env
ATLASDB_URL=...
SECRET=...
CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MAP_TOKEN=...
NODE_ENV=production
```

Recommended Render settings:

```text
Build Command: npm install
Start Command: node app.js
```

## Known Notes

- The current `package.json` does not define a `start` script, so use `node app.js` unless you add one.
- The test script is currently a placeholder.
- OSRM is a public routing service, so route availability and response speed can vary.
- Browser geolocation will not work on insecure non-localhost origins.

## Author

Created by Vikram Dhatarwal.
