(() => {
    const mapElement = document.getElementById("map");

    // The map script is loaded globally, so exit quietly on pages without a map.
    if (!mapElement) {
        return;
    }

    const mapFallback = document.getElementById("mapFallback");
    const goToListingBtn = document.getElementById("goToListingBtn");
    const routeStatus = document.getElementById("routeStatus");
    const mapData = window.listingMapData || {};
    const fallbackCenter = [78.9629, 20.5937];
    const routeSourceId = "current-location-route";
    const routeLayerId = "current-location-route-line";

    let map;
    let destinationCoordinates = null;
    let isMapReady = false;
    let userMarker = null;

    const hasValidAddress = Boolean(mapData.listingAddress && mapData.listingAddress.trim());

    const showMapFallback = (message) => {
        if (!mapFallback) {
            return;
        }

        mapFallback.textContent = message;
        mapFallback.classList.remove("d-none");
    };

    const hideMapFallback = () => {
        if (!mapFallback) {
            return;
        }

        mapFallback.textContent = "";
        mapFallback.classList.add("d-none");
    };

    const setRouteStatus = (message) => {
        if (routeStatus) {
            routeStatus.textContent = message;
        }
    };

    const enableRouteButtonIfReady = () => {
        if (goToListingBtn) {
            goToListingBtn.disabled = !(destinationCoordinates && isMapReady);
        }
    };

    const createKittenMarkerElement = () => {
        const markerElement = document.createElement("div");
        markerElement.className = "kitten-map-marker";
        markerElement.setAttribute("aria-label", "Listing location");
        markerElement.textContent = "\u{1F431}";
        return markerElement;
    };

    const getCurrentPosition = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        });
    });

    // OSRM sometimes starts the route a little away from the raw browser location.
    // Adding the exact start point makes the visible line feel connected to the user marker.
    const buildRouteFromCurrentLocation = (startCoordinates, routeCoordinates) => {
        const routeStart = routeCoordinates[0];

        if (!routeStart || (routeStart[0] === startCoordinates[0] && routeStart[1] === startCoordinates[1])) {
            return routeCoordinates;
        }

        return [startCoordinates, ...routeCoordinates];
    };

    const drawRoute = (startCoordinates, routeCoordinates) => {
        if (!map || !map.isStyleLoaded()) {
            throw new Error("Map style is still loading.");
        }

        const routeData = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: routeCoordinates
            }
        };

        if (map.getSource(routeSourceId)) {
            map.getSource(routeSourceId).setData(routeData);
        } else {
            map.addSource(routeSourceId, {
                type: "geojson",
                data: routeData
            });

            map.addLayer({
                id: routeLayerId,
                type: "line",
                source: routeSourceId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: {
                    "line-color": "#fe424d",
                    "line-width": 5,
                    "line-opacity": 0.85
                }
            });
        }

        if (userMarker) {
            userMarker.setLngLat(startCoordinates);
        } else {
            userMarker = new maptilersdk.Marker({ color: "#222222" })
                .setLngLat(startCoordinates)
                .setPopup(new maptilersdk.Popup({ offset: 24 }).setText("Your current location"))
                .addTo(map);
        }

        const bounds = routeCoordinates.reduce((routeBounds, coordinate) => {
            return routeBounds.extend(coordinate);
        }, new maptilersdk.LngLatBounds(routeCoordinates[0], routeCoordinates[0]));

        map.fitBounds(bounds, {
            padding: 70,
            maxZoom: 14,
            duration: 900
        });
    };

    const handleGoToListing = async () => {
        if (!goToListingBtn || !destinationCoordinates) {
            setRouteStatus("Destination is still loading.");
            return;
        }

        goToListingBtn.disabled = true;
        setRouteStatus("Getting your current location...");

        try {
            const position = await getCurrentPosition();
            const startCoordinates = [position.coords.longitude, position.coords.latitude];

            if (!Number.isFinite(startCoordinates[0]) || !Number.isFinite(startCoordinates[1])) {
                throw new Error("Invalid current location.");
            }

            setRouteStatus("Drawing route...");

            const routeParams = new URLSearchParams({
                overview: "full",
                geometries: "geojson"
            });
            const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startCoordinates.join(",")};${destinationCoordinates.join(",")}?${routeParams.toString()}`;
            const routeResponse = await fetch(routeUrl);

            if (!routeResponse.ok) {
                throw new Error("Unable to load route.");
            }

            const routeData = await routeResponse.json();
            const route = routeData.routes && routeData.routes[0];

            if (!route || !route.geometry || !route.geometry.coordinates) {
                throw new Error("No route found.");
            }

            const routeCoordinates = buildRouteFromCurrentLocation(startCoordinates, route.geometry.coordinates);
            drawRoute(startCoordinates, routeCoordinates);
            hideMapFallback();

            const distanceKm = route.distance ? (route.distance / 1000).toFixed(1) : null;
            const durationMin = route.duration ? Math.round(route.duration / 60) : null;

            if (distanceKm && durationMin) {
                setRouteStatus(`${distanceKm} km - about ${durationMin} min by car`);
            } else {
                setRouteStatus("Route ready");
            }
        } catch (error) {
            const permissionDenied = error && error.code === error.PERMISSION_DENIED;
            setRouteStatus(permissionDenied ? "Location permission was blocked." : "Route unavailable right now.");
            showMapFallback(permissionDenied
                ? "Please allow location access in your browser and press Go again."
                : "Could not draw a route from your current location. Please try again in a moment."
            );
        } finally {
            enableRouteButtonIfReady();
        }
    };

    if (!mapData.mapToken) {
        showMapFallback("Map is unavailable because the MapTiler token is missing.");
        setRouteStatus("Route unavailable");
        return;
    }

    if (!hasValidAddress) {
        showMapFallback("Map is unavailable because this listing does not have a complete address.");
        setRouteStatus("Destination unavailable");
        return;
    }

    if (!window.maptilersdk) {
        showMapFallback("Map is unavailable right now. Please try again later.");
        setRouteStatus("Route unavailable");
        return;
    }

    maptilersdk.config.apiKey = mapData.mapToken;

    map = new maptilersdk.Map({
        container: "map",
        style: maptilersdk.MapStyle.STREETS,
        center: fallbackCenter,
        zoom: 4
    });

    map.on("load", () => {
        isMapReady = true;
        enableRouteButtonIfReady();
    });

    // Convert the listing's written address into coordinates before routing.
    const geocodingParams = new URLSearchParams({
        key: mapData.mapToken,
        limit: "1"
    });

    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(mapData.listingAddress)}.json?${geocodingParams.toString()}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load listing coordinates.");
            }

            return response.json();
        })
        .then((data) => {
            const coordinates = data.features && data.features[0] && data.features[0].center;

            if (!coordinates) {
                showMapFallback(`Could not find a map location for ${mapData.listingAddress}.`);
                setRouteStatus("Destination unavailable");
                return;
            }

            destinationCoordinates = coordinates;
            enableRouteButtonIfReady();
            setRouteStatus("Press Go to route from your location");
            map.flyTo({ center: coordinates, zoom: 12 });

            const popupContent = document.createElement("div");
            const popupTitle = document.createElement("strong");
            const popupAddress = document.createElement("p");

            popupTitle.textContent = mapData.listingTitle;
            popupAddress.textContent = mapData.listingAddress;
            popupAddress.className = "mb-0";
            popupContent.append(popupTitle, popupAddress);

            new maptilersdk.Marker({
                element: createKittenMarkerElement(),
                anchor: "bottom"
            })
                .setLngLat(coordinates)
                .setPopup(new maptilersdk.Popup({ offset: 24 }).setDOMContent(popupContent))
                .addTo(map);
        })
        .catch(() => {
            showMapFallback("Could not load the map location for this listing.");
            setRouteStatus("Destination unavailable");
        });

    if (goToListingBtn) {
        goToListingBtn.addEventListener("click", handleGoToListing);
    }
})();
