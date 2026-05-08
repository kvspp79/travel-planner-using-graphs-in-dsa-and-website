const state = {
  graph: null,
  attractionsById: {},
  priority: "balanced",
  vehicle: "car",
  route: null,
  visits: [],
  waypoints: [],
  suggestionPage: 0,
  suggestionPageSize: 6,
  staticPlanner: false,
};

const priorityNames = {
  balanced: "Balanced",
  time: "Fastest",
  cost: "Cheapest",
  distance: "Shortest",
  scenic: "Scenic",
};

const modeColors = {
  road: "#f7bf54",
  train: "#65b8ff",
  flight: "#b7a8ff",
};

const serviceNames = {
  petrol: "Petrol",
  diesel: "Diesel",
  ev: "EV charge",
  gas: "CNG / gas",
};

const tripSuggestions = [
  {
    season: "Summer",
    budget: "Rs 4,000 - 8,000",
    days: "3 days",
    style: "Friends road trip",
    title: "Hyderabad to Goa coastal break",
    source: "hyderabad",
    destination: "goa",
    vehicle: "car",
    priority: "balanced",
    highlights: ["Charminar", "Tank Bund", "Baga Beach", "Fort Aguada"],
    visits: ["hyderabad__charminar", "hyderabad__tank_bund", "goa__baga_beach", "goa__fort_aguada"],
    reason: "Good for friends who want beaches, food stops, and manageable road service breaks.",
  },
  {
    season: "Summer",
    budget: "Rs 7,000 - 13,000",
    days: "4 days",
    style: "Cool hills",
    title: "Delhi to Manali hill escape",
    source: "delhi",
    destination: "manali",
    vehicle: "diesel",
    priority: "scenic",
    highlights: ["India Gate", "Red Fort", "Solang Valley", "Atal Tunnel"],
    visits: ["delhi__india_gate", "delhi__red_fort", "manali__solang_valley", "manali__atal_tunnel"],
    reason: "Best for cool weather, mountain roads, and scenic halts.",
  },
  {
    season: "Monsoon",
    budget: "Rs 3,000 - 6,000",
    days: "2 days",
    style: "Weekend ride",
    title: "Bengaluru to Coorg coffee route",
    source: "bengaluru",
    destination: "coorg",
    vehicle: "bike",
    priority: "scenic",
    highlights: ["Cubbon Park", "Lalbagh", "Abbey Falls", "Raja's Seat"],
    visits: ["bengaluru__cubbon_park", "bengaluru__lalbagh", "coorg__abbey_falls", "coorg__raja_s_seat"],
    reason: "Short, green, low-budget and good for a weekend ride.",
  },
  {
    season: "Monsoon",
    budget: "Rs 5,000 - 10,000",
    days: "3 days",
    style: "Tea valley",
    title: "Kochi to Munnar tea valley",
    source: "kochi",
    destination: "munnar",
    vehicle: "car",
    priority: "scenic",
    highlights: ["Fort Kochi", "Chinese Fishing Nets", "Tea Museum", "Mattupetty Dam"],
    visits: ["kochi__fort_kochi", "kochi__chinese_fishing_nets", "munnar__tea_museum", "munnar__mattupetty_dam"],
    reason: "A compact route with hill views and famous viewpoints.",
  },
  {
    season: "Winter",
    budget: "Rs 6,000 - 12,000",
    days: "3 days",
    style: "Heritage drive",
    title: "Jaipur to Udaipur royal route",
    source: "jaipur",
    destination: "udaipur",
    vehicle: "car",
    priority: "scenic",
    highlights: ["Hawa Mahal", "Amber Fort", "City Palace", "Lake Pichola"],
    visits: ["jaipur__hawa_mahal", "jaipur__amber_fort", "udaipur__city_palace", "udaipur__lake_pichola"],
    reason: "Comfortable winter weather, forts, lakes and heritage stops.",
  },
  {
    season: "Winter",
    budget: "Rs 8,000 - 18,000",
    days: "2 days",
    style: "Fast city hop",
    title: "Hyderabad Airport to Mumbai flight hop",
    source: "hyderabad_airport",
    destination: "mumbai",
    vehicle: "flight",
    priority: "time",
    highlights: ["Airport gateway", "Gateway of India", "Marine Drive", "Elephanta Caves"],
    visits: [
      "hyderabad_airport__rajiv_gandhi_international_airport",
      "mumbai__gateway_of_india",
      "mumbai__marine_drive",
      "mumbai__elephanta_caves",
    ],
    reason: "Fast city-to-city trip with airport routing and Mumbai attraction choices.",
  },
  {
    season: "Budget",
    budget: "Rs 2,000 - 5,000",
    days: "2 days",
    style: "Student friendly",
    title: "Chennai to Pondicherry short plan",
    source: "chennai",
    destination: "pondicherry",
    vehicle: "train",
    priority: "cost",
    highlights: ["Marina Beach", "Kapaleeshwarar Temple", "Promenade Beach", "Auroville"],
    visits: ["chennai__marina_beach", "chennai__kapaleeshwarar_temple", "pondicherry__promenade_beach", "pondicherry__auroville"],
    reason: "Budget-friendly, simple, and good for a class demo route.",
  },
  {
    season: "Premium",
    budget: "Rs 15,000 - 30,000",
    days: "3 days",
    style: "Comfort mix",
    title: "Mumbai to Goa comfort trip",
    source: "mumbai",
    destination: "goa",
    vehicle: "public",
    priority: "time",
    highlights: ["Marine Drive", "Gateway of India", "Basilica of Bom Jesus", "Dudhsagar Falls"],
    visits: ["mumbai__marine_drive", "mumbai__gateway_of_india", "goa__basilica_of_bom_jesus", "goa__dudhsagar_falls"],
    reason: "Lets the graph compare mixed public travel with road, train, and flight edges.",
  },
  {
    season: "Budget",
    budget: "Rs 1,800 - 4,500",
    days: "1 day",
    style: "Heritage express",
    title: "Delhi to Agra monument route",
    source: "delhi",
    destination: "agra",
    vehicle: "car",
    priority: "cost",
    highlights: ["India Gate", "Qutub Minar", "Taj Mahal", "Agra Fort"],
    visits: ["delhi__india_gate", "delhi__qutub_minar", "agra__taj_mahal", "agra__agra_fort"],
    reason: "A realistic low-cost route for showing shortest path plus famous monument visits.",
  },
  {
    season: "Monsoon",
    budget: "Rs 2,500 - 6,500",
    days: "2 days",
    style: "Ghat ride",
    title: "Mumbai to Lonavala rain drive",
    source: "mumbai",
    destination: "lonavala",
    vehicle: "bike",
    priority: "scenic",
    highlights: ["Marine Drive", "Bandra Worli Sea Link", "Tiger's Leap", "Bhushi Dam"],
    visits: ["mumbai__marine_drive", "mumbai__bandra_worli_sea_link", "lonavala__tiger_s_leap", "lonavala__bhushi_dam"],
    reason: "Short distance, realistic fuel breaks, and strong scenic score for a bike plan.",
  },
  {
    season: "Winter",
    budget: "Rs 4,000 - 9,000",
    days: "3 days",
    style: "Rail temple trail",
    title: "Kolkata to Puri train temple trip",
    source: "kolkata",
    destination: "puri",
    vehicle: "train",
    priority: "cost",
    highlights: ["Victoria Memorial", "Howrah Bridge", "Jagannath Temple", "Puri Beach"],
    visits: ["kolkata__victoria_memorial", "kolkata__howrah_bridge", "puri__jagannath_temple", "puri__puri_beach"],
    reason: "A believable budget train journey with cultural and beach stops.",
  },
  {
    season: "Winter",
    budget: "Rs 5,000 - 10,500",
    days: "3 days",
    style: "Gujarat coast",
    title: "Ahmedabad to Somnath culture route",
    source: "ahmedabad",
    destination: "somnath",
    vehicle: "diesel",
    priority: "balanced",
    highlights: ["Sabarmati Ashram", "Adalaj Stepwell", "Somnath Temple", "Somnath Beach"],
    visits: ["ahmedabad__sabarmati_ashram", "ahmedabad__adalaj_stepwell", "somnath__somnath_temple", "somnath__somnath_beach"],
    reason: "Good for a family road plan with long-range diesel stops and heritage places.",
  },
  {
    season: "Summer",
    budget: "Rs 4,500 - 9,500",
    days: "3 days",
    style: "Nilgiri break",
    title: "Bengaluru to Ooty hill plan",
    source: "bengaluru",
    destination: "ooty",
    vehicle: "car",
    priority: "scenic",
    highlights: ["Lalbagh", "Bangalore Palace", "Botanical Garden", "Nilgiri Mountain Railway"],
    visits: ["bengaluru__lalbagh", "bengaluru__bangalore_palace", "ooty__botanical_garden", "ooty__nilgiri_mountain_railway"],
    reason: "Classic hill route where scenic optimization looks impressive on the map.",
  },
  {
    season: "Budget",
    budget: "Rs 3,000 - 7,000",
    days: "3 days",
    style: "Island rail",
    title: "Chennai to Rameswaram rail route",
    source: "chennai",
    destination: "rameswaram",
    vehicle: "train",
    priority: "cost",
    highlights: ["Marina Beach", "Fort St George", "Pamban Bridge", "Dhanushkodi"],
    visits: ["chennai__marina_beach", "chennai__fort_st_george", "rameswaram__pamban_bridge", "rameswaram__dhanushkodi"],
    reason: "A strong train example with a famous bridge and clear budget logic.",
  },
  {
    season: "Monsoon",
    budget: "Rs 3,500 - 7,500",
    days: "2 days",
    style: "North East clouds",
    title: "Guwahati to Shillong cloud route",
    source: "guwahati",
    destination: "shillong",
    vehicle: "car",
    priority: "scenic",
    highlights: ["Kamakhya Temple", "Brahmaputra Riverfront", "Umiam Lake", "Elephant Falls"],
    visits: ["guwahati__kamakhya_temple", "guwahati__brahmaputra_riverfront", "shillong__umiam_lake", "shillong__elephant_falls"],
    reason: "Compact, beautiful and realistic for a two-day route with famous local stops.",
  },
  {
    season: "Summer",
    budget: "Rs 9,000 - 18,000",
    days: "5 days",
    style: "High altitude",
    title: "Srinagar to Leh mountain expedition",
    source: "srinagar",
    destination: "leh",
    vehicle: "diesel",
    priority: "scenic",
    highlights: ["Dal Lake", "Mughal Gardens", "Shanti Stupa", "Pangong Lake"],
    visits: ["srinagar__dal_lake", "srinagar__mughal_gardens", "leh__shanti_stupa", "leh__pangong_lake"],
    reason: "A premium scenic plan that shows long-distance planning and careful service breaks.",
  },
  {
    season: "Winter",
    budget: "Rs 6,000 - 13,000",
    days: "4 days",
    style: "Desert circuit",
    title: "Jaipur to Jaisalmer desert plan",
    source: "jaipur",
    destination: "jaisalmer",
    vehicle: "diesel",
    priority: "scenic",
    highlights: ["Hawa Mahal", "City Palace", "Jaisalmer Fort", "Sam Sand Dunes"],
    visits: ["jaipur__hawa_mahal", "jaipur__city_palace", "jaisalmer__jaisalmer_fort", "jaisalmer__sam_sand_dunes"],
    reason: "Good for winter because the desert route becomes comfortable and visually strong.",
  },
  {
    season: "EV",
    budget: "Rs 3,500 - 8,000",
    days: "3 days",
    style: "Charging friendly",
    title: "Pune to Goa EV coastal plan",
    source: "pune",
    destination: "goa",
    vehicle: "ev",
    priority: "balanced",
    highlights: ["Shaniwar Wada", "Sinhagad Fort", "Baga Beach", "Dudhsagar Falls"],
    visits: ["pune__shaniwar_wada", "pune__sinhagad_fort", "goa__baga_beach", "goa__dudhsagar_falls"],
    reason: "Shows EV charging stops, cost savings, and a practical highway-to-coast journey.",
  },
  {
    season: "Monsoon",
    budget: "Rs 2,500 - 6,000",
    days: "2 days",
    style: "Backwater calm",
    title: "Kochi to Alleppey backwater plan",
    source: "kochi",
    destination: "alleppey",
    vehicle: "car",
    priority: "scenic",
    highlights: ["Fort Kochi", "Marine Drive", "Alleppey Backwaters", "Marari Beach"],
    visits: ["kochi__fort_kochi", "kochi__marine_drive", "alleppey__alleppey_backwaters", "alleppey__marari_beach"],
    reason: "A short realistic plan with lower cost, riverfront stops, and relaxed timing.",
  },
  {
    season: "Winter",
    budget: "Rs 3,500 - 8,500",
    days: "2 days",
    style: "Golden route",
    title: "Delhi to Amritsar train plan",
    source: "delhi",
    destination: "amritsar",
    vehicle: "train",
    priority: "time",
    highlights: ["Red Fort", "Lotus Temple", "Golden Temple", "Wagah Border"],
    visits: ["delhi__red_fort", "delhi__lotus_temple", "amritsar__golden_temple", "amritsar__wagah_border"],
    reason: "A realistic fast train option with strong sightseeing value at both ends.",
  },
  {
    season: "Spiritual",
    budget: "Rs 4,000 - 9,500",
    days: "3 days",
    style: "Ghat journey",
    title: "Delhi to Varanasi train route",
    source: "delhi",
    destination: "varanasi",
    vehicle: "train",
    priority: "cost",
    highlights: ["India Gate", "Red Fort", "Dashashwamedh Ghat", "Kashi Vishwanath Temple"],
    visits: ["delhi__india_gate", "delhi__red_fort", "varanasi__dashashwamedh_ghat", "varanasi__kashi_vishwanath_temple"],
    reason: "A strong budget rail example with clear cultural stops and simple planner logic.",
  },
  {
    season: "Adventure",
    budget: "Rs 3,500 - 8,000",
    days: "2 days",
    style: "River and hills",
    title: "Delhi to Rishikesh road plan",
    source: "delhi",
    destination: "rishikesh",
    vehicle: "cng",
    priority: "balanced",
    highlights: ["Qutub Minar", "Lotus Temple", "Laxman Jhula", "Triveni Ghat"],
    visits: ["delhi__qutub_minar", "delhi__lotus_temple", "rishikesh__laxman_jhula", "rishikesh__triveni_ghat"],
    reason: "A practical mid-budget route with CNG/gas planning and famous river stops.",
  },
];

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatHours(hours) {
  if (!hours) return "0 hrs";
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole} hrs`;
  return `${whole}h ${minutes}m`;
}

function cityName(id) {
  const city = state.graph.nodes.find((item) => item.id === id);
  return city ? city.name : id;
}

function vehicleProfile() {
  return state.graph.vehicles.find((vehicle) => vehicle.id === state.vehicle);
}

function selectedModes() {
  return [...document.querySelectorAll("#modeControls input:checked:not(:disabled)")].map((item) => item.value);
}

async function loadGraphPayload() {
  try {
    const response = await fetch("/api/graph", { cache: "no-store" });
    if (response.ok) {
      state.staticPlanner = false;
      return response.json();
    }
  } catch (error) {
    // Netlify drag-and-drop hosting cannot run the Python API, so we load static data below.
  }

  const response = await fetch("/graph.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load graph data.");
  state.staticPlanner = true;
  return response.json();
}

function showScreen(screen) {
  $("#opening").classList.toggle("screen-hidden", screen !== "opening");
  $("#suggestions").classList.toggle("screen-hidden", screen !== "suggestions");
  $("#planner").classList.toggle("screen-hidden", screen !== "planner");
  $("#thanks").classList.toggle("screen-hidden", screen !== "thanks");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function populatePlaces() {
  const options = state.graph.nodes
    .map((city) => `<option value="${city.id}">${escapeHtml(city.name)} - ${escapeHtml(city.region)}</option>`)
    .join("");
  $("#sourceSelect").innerHTML = options;
  $("#destinationSelect").innerHTML = options;
  $("#waypointSelect").innerHTML = options;
  $("#sourceSelect").value = "hyderabad";
  $("#destinationSelect").value = "goa";
  $("#waypointSelect").value = "hyderabad";
  $("#edgeCount").textContent = state.graph.edges.length;

  state.attractionsById = {};
  state.graph.nodes.forEach((city) => {
    city.attractions.forEach((attraction) => {
      state.attractionsById[attraction.id] = { ...attraction, cityName: city.name, region: city.region };
    });
  });
}

function edgeKey(source, target) {
  return [source, target].sort().join(":");
}

function drawMap() {
  const svg = $("#networkMap");
  const routeEdges = new Set();
  const visited = new Set(state.route ? state.route.visitedOrder : []);
  const activePath = new Set(state.route ? state.route.path : []);
  const cityById = Object.fromEntries(state.graph.nodes.map((city) => [city.id, city]));

  if (state.route) {
    state.route.legs.forEach((leg) => routeEdges.add(edgeKey(leg.source, leg.target)));
  }

  const edgesMarkup = state.graph.edges
    .map((edge) => {
      const source = cityById[edge.source];
      const target = cityById[edge.target];
      const classes = ["edge", edge.mode];
      if (visited.has(edge.source) && visited.has(edge.target)) classes.push("visited");
      if (routeEdges.has(edgeKey(edge.source, edge.target))) classes.push("route");
      return `
        <line class="${classes.join(" ")}" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}">
          <title>${escapeHtml(source.name)} to ${escapeHtml(target.name)} by ${edge.mode}</title>
        </line>
      `;
    })
    .join("");

  const nodesMarkup = state.graph.nodes
    .map((city) => {
      const classes = ["node"];
      if (city.major || city.tag.includes("airport")) classes.push("major");
      if (visited.has(city.id)) classes.push("visited");
      if (activePath.has(city.id)) classes.push("active");
      const labelX = Math.min(92, city.x + 1.4);
      const labelY = Math.max(5, city.y - 1.2);
      const label = city.major || activePath.has(city.id) || city.tag.includes("airport")
        ? `<text class="node-label" x="${labelX}" y="${labelY}">${escapeHtml(city.name)}</text>`
        : "";
      return `
        <g>
          <circle class="${classes.join(" ")}" cx="${city.x}" cy="${city.y}" r="${activePath.has(city.id) ? 1.32 : city.major ? 0.92 : 0.58}">
            <title>${escapeHtml(city.name)}, ${escapeHtml(city.region)}</title>
          </circle>
          ${label}
        </g>
      `;
    })
    .join("");

  const serviceMarkup = state.route
    ? state.route.serviceStops
        .map(
          (stop) => `
            <circle class="service-marker ${stop.type}" cx="${stop.x}" cy="${stop.y}" r="1.05">
              <title>${escapeHtml(stop.name)} at ${stop.distanceFromStart} km</title>
            </circle>
          `
        )
        .join("")
    : "";

  const visitMarkup = state.route
    ? state.route.visitStops
        .map(
          (stop) => `
            <rect class="visit-marker" x="${stop.x - 0.85}" y="${stop.y - 0.85}" width="1.7" height="1.7" rx="0.25">
              <title>${escapeHtml(stop.name)} near ${escapeHtml(stop.cityName)}</title>
            </rect>
          `
        )
        .join("")
    : "";

  svg.innerHTML = `${edgesMarkup}${nodesMarkup}${serviceMarkup}${visitMarkup}`;
}

function updateMetrics(route) {
  $("#distanceMetric").textContent = `${route.totals.distance.toLocaleString()} km`;
  $("#timeMetric").textContent = formatHours(route.totals.hours);
  $("#costMetric").textContent = `Rs ${route.totals.cost.toLocaleString()}`;
  $("#stopsMetric").textContent = `${route.totals.stops + route.totals.visitStops}`;
  $("#serviceMetric").textContent = `${route.totals.serviceStops}`;
  $("#scenicMetric").textContent = `${route.totals.scenic}/10`;
  $("#weightLabel").textContent = priorityNames[route.priority] || route.priority;
  $("#visitedLabel").textContent = `${route.visitedCount} nodes`;
  $("#pathTitle").textContent = `${cityName(route.source)} to ${cityName(route.destination)}`;
  $("#routeSummary").textContent = route.pathNames.join(" -> ");
  $("#vehicleLabel").textContent = `${route.vehicle.name} | ${route.vehicle.range} km range`;
  $("#vehicleStat").textContent = route.vehicle.label;
  $("#vehiclePreview").className = `vehicle-preview ${route.vehicle.id}`;
}

function visitsForCity(route) {
  const groups = {};
  route.visitStops.forEach((visit) => {
    if (!groups[visit.cityId]) groups[visit.cityId] = [];
    groups[visit.cityId].push(visit);
  });
  return groups;
}

function renderVisitCards(visits) {
  if (!visits || !visits.length) return "";
  return visits
    .map(
      (visit) => `
        <li class="visit-card">
          <div class="leg-index">V</div>
          <div>
            <h3>Visit ${escapeHtml(visit.name)}</h3>
            <p>${escapeHtml(visit.note)}</p>
            <div class="leg-services">Adds ${visit.addedDistance} km | ${formatHours(visit.addedHours)} | Rs ${visit.addedCost.toLocaleString()}</div>
          </div>
          <button class="remove-visit" type="button" data-visit-id="${visit.id}">Remove</button>
        </li>
      `
    )
    .join("");
}

function renderItinerary(route) {
  const list = $("#itineraryList");
  const visitGroups = visitsForCity(route);
  if (!route.legs.length && !route.visitStops.length) {
    list.innerHTML = `<li class="empty-state">Source and destination are the same place.</li>`;
    return;
  }

  let markup = renderVisitCards(visitGroups[route.path[0]]);
  markup += route.legs
    .map((leg, index) => {
      const services = leg.serviceStops.length
        ? `<div class="leg-services">${leg.serviceStops.length} planned stoppage: ${leg.serviceStops
            .map((stop) => serviceNames[stop.type] || stop.type)
            .join(", ")}</div>`
        : `<div class="leg-services">No fuel or charging stop needed on this leg.</div>`;
      const conditionNotes = leg.conditionNotes.length
        ? `<div class="condition-note">${leg.conditionNotes.map(escapeHtml).join(" | ")}</div>`
        : "";
      return `
        <li class="leg-card">
          <div class="leg-index">${index + 1}</div>
          <div>
            <h3>${escapeHtml(leg.fromName)} -> ${escapeHtml(leg.toName)}</h3>
            <p>${leg.distance} km | ${formatHours(leg.hours)} | Rs ${leg.cost.toLocaleString()} | scenic ${leg.scenic}/10</p>
            ${services}
            ${conditionNotes}
          </div>
          <span class="mode-pill" style="background:${modeColors[leg.mode] || "#f7bf54"}">${escapeHtml(leg.mode)}</span>
        </li>
        ${renderVisitCards(visitGroups[leg.target])}
      `;
    })
    .join("");

  list.innerHTML = markup;
}

function renderServiceStops(route) {
  const target = $("#serviceList");
  if (!route.serviceStops.length) {
    target.innerHTML = `<div class="empty-state">No fuel, diesel, gas, or EV charging stop is required for this route.</div>`;
    return;
  }

  target.innerHTML = route.serviceStops
    .map(
      (stop) => `
        <article class="service-card">
          <div>
            <h3>${escapeHtml(stop.name)}</h3>
            <p>${stop.distanceFromStart} km after leg start | suggested wait ${stop.waitMinutes} min</p>
          </div>
          <span class="type-pill ${stop.type}">${serviceNames[stop.type] || stop.type}</span>
        </article>
      `
    )
    .join("");
}

function renderSelectedVisits() {
  $("#visitCount").textContent = `${state.visits.length} added`;
  if (!state.visits.length) {
    $("#selectedVisitList").innerHTML = `<div class="empty-state">No famous place added yet.</div>`;
    return;
  }
  $("#selectedVisitList").innerHTML = state.visits
    .map((visitId) => {
      const visit = state.attractionsById[visitId];
      if (!visit) return "";
      return `
        <div class="selected-visit-chip">
          <span>${escapeHtml(visit.name)} <small>${escapeHtml(visit.cityName)}</small></span>
          <button type="button" data-visit-id="${visit.id}" class="remove-visit">Remove</button>
        </div>
      `;
    })
    .join("");
}

function renderSelectedWaypoints() {
  if (!state.waypoints.length) {
    $("#selectedWaypointList").innerHTML = `<div class="empty-state">Direct route. Add a via place only if you want to force the path.</div>`;
    return;
  }

  $("#selectedWaypointList").innerHTML = state.waypoints
    .map(
      (cityId) => `
        <div class="selected-visit-chip">
          <span>${escapeHtml(cityName(cityId))} <small>forced via place</small></span>
          <button type="button" data-waypoint-id="${cityId}">Remove</button>
        </div>
      `
    )
    .join("");
}

function cleanWaypoints() {
  const source = $("#sourceSelect").value;
  const destination = $("#destinationSelect").value;
  state.waypoints = state.waypoints.filter((cityId) => cityId !== source && cityId !== destination);
  renderSelectedWaypoints();
}

function addWaypoint(cityId) {
  const source = $("#sourceSelect").value;
  const destination = $("#destinationSelect").value;
  if (!cityId || cityId === source || cityId === destination || state.waypoints.includes(cityId)) return;
  state.waypoints.push(cityId);
  renderSelectedWaypoints();
  planRoute();
}

function removeWaypoint(cityId) {
  state.waypoints = state.waypoints.filter((item) => item !== cityId);
  renderSelectedWaypoints();
  planRoute();
}

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceToLine(point, source, target) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (dx === 0 && dy === 0) return pointDistance(point, source);
  const progress = Math.max(0, Math.min(1, ((point.x - source.x) * dx + (point.y - source.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (source.x + progress * dx), point.y - (source.y + progress * dy));
}

function addAutomaticWaypoint() {
  const sourceId = $("#sourceSelect").value;
  const destinationId = $("#destinationSelect").value;
  const source = state.graph.nodes.find((city) => city.id === sourceId);
  const destination = state.graph.nodes.find((city) => city.id === destinationId);
  if (!source || !destination || sourceId === destinationId) return;

  const blocked = new Set([sourceId, destinationId, ...state.waypoints]);
  const candidates = state.graph.nodes.filter((city) => !blocked.has(city.id) && !city.parentId && (city.major || city.tag.includes("gateway") || city.tag.includes("hub")));
  const best = candidates
    .map((city) => ({
      city,
      score: distanceToLine(city, source, destination) * 2.2 + (pointDistance(city, source) + pointDistance(city, destination)) * 0.18,
    }))
    .sort((a, b) => a.score - b.score)[0];

  if (best) addWaypoint(best.city.id);
}

function renderAttractions(route) {
  const target = $("#attractionList");
  if (!$("#visitToggle").checked) {
    target.innerHTML = `<div class="empty-state">Famous-place suggestions are turned off. Already selected visits still stay in your trip.</div>`;
    return;
  }
  if (!route.nearbyAttractions.length) {
    target.innerHTML = `<div class="empty-state">No attraction suggestions for this route.</div>`;
    return;
  }

  target.innerHTML = route.nearbyAttractions
    .map(
      (item) => `
        <article class="attraction-card">
          <h3>${escapeHtml(item.cityName)}</h3>
          <p>${escapeHtml(item.region)} | ${escapeHtml(item.tag)}</p>
          <div class="attraction-buttons">
            ${item.attractions
              .map((place) => {
                const added = state.visits.includes(place.id);
                return `
                  <button type="button" class="${added ? "is-added" : ""}" data-visit-id="${place.id}">
                    <strong>${escapeHtml(place.name)}</strong>
                    <span>${escapeHtml(place.note)}</span>
                    <em>${added ? "Added" : "Add to journey"}</em>
                  </button>
                `;
              })
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderAlternatives(route) {
  const target = $("#alternativesList");
  if (!route.alternatives.length) {
    target.innerHTML = `<div class="empty-state">No different route appears under the other weights.</div>`;
    return;
  }

  target.innerHTML = route.alternatives
    .map(
      (item) => `
        <article class="alternative-card">
          <h3>${priorityNames[item.priority] || item.priority}</h3>
          <p>${item.pathNames.map(escapeHtml).join(" -> ")}</p>
          <p><strong>${item.totals.distance.toLocaleString()} km</strong> | ${formatHours(item.totals.hours)} | Rs ${item.totals.cost.toLocaleString()} | ${item.totals.serviceStops} stops</p>
        </article>
      `
    )
    .join("");
}

function suggestionPageCount() {
  return Math.max(1, Math.ceil(tripSuggestions.length / state.suggestionPageSize));
}

function renderSuggestions() {
  const pageCount = suggestionPageCount();
  state.suggestionPage = Math.min(state.suggestionPage, pageCount - 1);
  const start = state.suggestionPage * state.suggestionPageSize;
  const visibleSuggestions = tripSuggestions.slice(start, start + state.suggestionPageSize);
  const end = Math.min(start + visibleSuggestions.length, tripSuggestions.length);

  $("#suggestionGrid").innerHTML = visibleSuggestions
    .map((item, index) => {
      const suggestionIndex = start + index;
      const highlights = (item.highlights || [])
        .map((place) => `<span>${escapeHtml(place)}</span>`)
        .join("");
      return `
        <article class="suggestion-card">
          <div class="suggestion-topline">
            <span>${escapeHtml(item.season)}</span>
            <strong>${escapeHtml(item.budget)}</strong>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.reason)}</p>
          <div class="suggestion-meta">
            <span>${escapeHtml(cityName(item.source))}</span>
            <span>${escapeHtml(cityName(item.destination))}</span>
            <span>${escapeHtml(item.days)}</span>
            <span>${escapeHtml(item.vehicle)}</span>
            <span>${escapeHtml(priorityNames[item.priority] || item.priority)}</span>
          </div>
          <div class="suggestion-places">
            <strong>${escapeHtml(item.style)}</strong>
            <div>${highlights}</div>
          </div>
          <button type="button" data-suggestion-index="${suggestionIndex}">Use this trip</button>
        </article>
      `;
    })
    .join("");

  $("#suggestionPageLabel").textContent = `${state.suggestionPage + 1} / ${pageCount}`;
  $("#suggestionRangeLabel").textContent = `Showing ${start + 1}-${end} of ${tripSuggestions.length} ready trips`;
}

function moveSuggestionPage(direction) {
  const pageCount = suggestionPageCount();
  state.suggestionPage = (state.suggestionPage + direction + pageCount) % pageCount;
  renderSuggestions();
  $("#suggestions").scrollIntoView({ behavior: "smooth", block: "start" });
}

function useSuggestion(index) {
  const item = tripSuggestions[index];
  if (!item) return;
  $("#sourceSelect").value = item.source;
  $("#destinationSelect").value = item.destination;
  state.vehicle = item.vehicle;
  state.priority = item.priority;
  state.waypoints = [];
  state.visits = (item.visits || []).filter((visitId) => state.attractionsById[visitId]);
  const vehicleInput = document.querySelector(`#vehicleControls input[value="${item.vehicle}"]`);
  if (vehicleInput) vehicleInput.checked = true;
  document.querySelectorAll("#priorityControls button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.priority === item.priority);
  });
  $("#tripName").value = item.title;
  applyVehicleRules();
  const preferredModes = new Set(item.modes || vehicleProfile().allowedModes);
  document.querySelectorAll("#modeControls input").forEach((input) => {
    input.checked = preferredModes.has(input.value) && !input.disabled;
  });
  renderSelectedWaypoints();
  showScreen("planner");
  planRoute();
}

function showError(message) {
  $("#itineraryList").innerHTML = `<li class="error-state">${escapeHtml(message)}</li>`;
  $("#serviceList").innerHTML = "";
  $("#attractionList").innerHTML = "";
  $("#alternativesList").innerHTML = "";
  $("#distanceMetric").textContent = "--";
  $("#timeMetric").textContent = "--";
  $("#costMetric").textContent = "--";
  $("#stopsMetric").textContent = "--";
  $("#serviceMetric").textContent = "--";
  $("#scenicMetric").textContent = "--";
  $("#visitedLabel").textContent = "0 nodes";
}

function applyVehicleRules() {
  const profile = vehicleProfile();
  const allowed = new Set(profile.allowedModes);
  const modeInputs = [...document.querySelectorAll("#modeControls input")];
  modeInputs.forEach((input) => {
    input.disabled = !allowed.has(input.value);
    if (state.vehicle !== "public") {
      input.checked = allowed.has(input.value);
    }
  });
  if (state.vehicle === "public" && !modeInputs.some((item) => item.checked && !item.disabled)) {
    modeInputs.forEach((input) => {
      input.checked = allowed.has(input.value);
    });
  }
  $("#vehiclePreview").className = `vehicle-preview ${state.vehicle}`;
}

async function planRoute() {
  const modes = selectedModes();
  if (!modes.length) {
    showError("Choose at least one transport mode.");
    return;
  }

  const requestPayload = {
    source: $("#sourceSelect").value,
    destination: $("#destinationSelect").value,
    priority: state.priority,
    vehicle: state.vehicle,
    modes,
    waypoints: state.waypoints,
    visits: state.visits,
    includeAttractions: $("#visitToggle").checked,
  };

  let payload;
  try {
    payload = await requestRoutePlan(requestPayload);
  } catch (error) {
    showError(error.message || "Route planning failed.");
    return;
  }

  state.route = payload;
  renderSelectedVisits();
  updateMetrics(payload);
  renderItinerary(payload);
  renderServiceStops(payload);
  renderAttractions(payload);
  renderAlternatives(payload);
  drawMap();
}

async function requestRoutePlan(requestPayload) {
  if (state.staticPlanner) {
    return window.StaticTravelPlanner.planRoute(state.graph, requestPayload);
  }

  let response;
  try {
    response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });
  } catch (error) {
    if (window.StaticTravelPlanner) {
      state.staticPlanner = true;
      return window.StaticTravelPlanner.planRoute(state.graph, requestPayload);
    }
    throw error;
  }

  if (response.ok) return response.json();

  if (response.status === 404 && window.StaticTravelPlanner) {
    state.staticPlanner = true;
    return window.StaticTravelPlanner.planRoute(state.graph, requestPayload);
  }

  const payload = await response.json().catch(() => ({}));
  throw new Error(payload.error || "Route planning failed.");
}

function toggleVisit(visitId) {
  if (!state.attractionsById[visitId]) return;
  if (state.visits.includes(visitId)) {
    state.visits = state.visits.filter((id) => id !== visitId);
  } else {
    state.visits.push(visitId);
  }
  renderSelectedVisits();
  planRoute();
}

function completeTrip() {
  if (!state.route) return;
  const tripName = $("#tripName").value.trim() || "Your trip";
  $("#thanksSummary").textContent = `${tripName}: ${state.route.pathNames.join(" -> ")}. Total ${state.route.totals.distance.toLocaleString()} km, ${formatHours(state.route.totals.hours)}, Rs ${state.route.totals.cost.toLocaleString()}, with ${state.route.totals.serviceStops} service stops and ${state.route.totals.visitStops} famous-place visits.`;
  showScreen("thanks");
}

function bindEvents() {
  $("#enterPlanner").addEventListener("click", () => {
    showScreen("planner");
  });

  $("#quickPlanner").addEventListener("click", () => {
    showScreen("planner");
  });

  $("#openSuggestions").addEventListener("click", () => {
    showScreen("suggestions");
  });

  $("#backToOpening").addEventListener("click", () => {
    showScreen("opening");
  });

  $("#suggestionToPlanner").addEventListener("click", () => {
    showScreen("planner");
  });

  $("#suggestionPrev").addEventListener("click", () => {
    moveSuggestionPage(-1);
  });

  $("#suggestionNext").addEventListener("click", () => {
    moveSuggestionPage(1);
  });

  $("#suggestionGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-suggestion-index]");
    if (!button) return;
    useSuggestion(Number(button.dataset.suggestionIndex));
  });

  $("#planAgain").addEventListener("click", () => {
    showScreen("planner");
  });

  $("#completeTrip").addEventListener("click", completeTrip);

  $("#plannerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    planRoute();
  });

  $("#priorityControls").addEventListener("click", (event) => {
    const button = event.target.closest("[data-priority]");
    if (!button) return;
    state.priority = button.dataset.priority;
    document.querySelectorAll("#priorityControls button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    planRoute();
  });

  $("#vehicleControls").addEventListener("change", (event) => {
    const input = event.target.closest("input[name='vehicle']");
    if (!input) return;
    state.vehicle = input.value;
    applyVehicleRules();
    planRoute();
  });

  $("#modeControls").addEventListener("change", planRoute);
  $("#sourceSelect").addEventListener("change", () => {
    cleanWaypoints();
    planRoute();
  });
  $("#destinationSelect").addEventListener("change", () => {
    cleanWaypoints();
    planRoute();
  });
  $("#visitToggle").addEventListener("change", planRoute);

  $("#swapButton").addEventListener("click", () => {
    const source = $("#sourceSelect").value;
    $("#sourceSelect").value = $("#destinationSelect").value;
    $("#destinationSelect").value = source;
    cleanWaypoints();
    planRoute();
  });

  $("#addWaypoint").addEventListener("click", () => {
    addWaypoint($("#waypointSelect").value);
  });

  $("#autoWaypoint").addEventListener("click", addAutomaticWaypoint);

  $("#selectedWaypointList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-waypoint-id]");
    if (!button) return;
    removeWaypoint(button.dataset.waypointId);
  });

  $("#attractionList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-visit-id]");
    if (!button) return;
    toggleVisit(button.dataset.visitId);
  });

  $("#selectedVisitList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-visit-id]");
    if (!button) return;
    toggleVisit(button.dataset.visitId);
  });

  $("#itineraryList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-visit-id]");
    if (!button) return;
    toggleVisit(button.dataset.visitId);
  });
}

async function init() {
  state.graph = await loadGraphPayload();
  populatePlaces();
  bindEvents();
  applyVehicleRules();
  renderSuggestions();
  renderSelectedVisits();
  renderSelectedWaypoints();
  drawMap();
  await planRoute();
  showScreen("opening");
}

init().catch((error) => {
  showError(error.message);
});
