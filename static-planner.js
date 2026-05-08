(() => {
  const DEFAULT_CONDITIONS = { traffic: "normal", weather: "clear", road: "open" };

  function plannerFor(graph) {
    const cities = Object.fromEntries(graph.nodes.map((city) => [city.id, city]));
    const vehicles = Object.fromEntries(graph.vehicles.map((vehicle) => [vehicle.id, vehicle]));
    const priorities = new Set(graph.priorities || ["balanced", "time", "cost", "distance", "scenic"]);
    const attractions = {};
    graph.nodes.forEach((city) => {
      city.attractions.forEach((attraction) => {
        attractions[attraction.id] = attraction;
      });
    });

    const adjacency = {};
    graph.nodes.forEach((city) => {
      adjacency[city.id] = [];
    });
    graph.edges.forEach((route) => {
      adjacency[route.source].push(route);
      adjacency[route.target].push({
        ...route,
        id: `${route.id}b`,
        source: route.target,
        target: route.source,
      });
    });

    function validateCity(cityId) {
      if (!cities[cityId]) throw new Error(`Unknown place: ${cityId}`);
    }

    function normalizeConditions(conditions = {}) {
      const traffic = ["normal", "moderate", "heavy"].includes(conditions.traffic) ? conditions.traffic : "normal";
      const weather = ["clear", "rain", "fog"].includes(conditions.weather) ? conditions.weather : "clear";
      const road = ["open", "rough", "closures"].includes(conditions.road) ? conditions.road : "open";
      return { traffic, weather, road };
    }

    function vehicleProfile(vehicleId) {
      return vehicles[vehicleId || "car"] || vehicles.car;
    }

    function vehicleResult(vehicleId) {
      const vehicle = vehicleProfile(vehicleId);
      return {
        id: vehicles[vehicleId] ? vehicleId : "car",
        name: vehicle.name,
        label: vehicle.label,
        range: vehicle.range,
        serviceTypes: vehicle.serviceTypes,
      };
    }

    function effectiveModes(vehicleId, requestedModes) {
      const vehicle = vehicleProfile(vehicleId);
      if (vehicleId === "train" || vehicleId === "flight" || vehicleId !== "public") {
        return new Set(vehicle.allowedModes);
      }
      const requested = new Set(requestedModes && requestedModes.length ? requestedModes : vehicle.allowedModes);
      return new Set([...requested].filter((mode) => ["flight", "road", "train"].includes(mode)));
    }

    function shouldSkipRoute(route, conditions) {
      return route.mode === "road" && conditions.road === "closures" && route.roadRisk >= 7;
    }

    function conditionMultipliers(route, conditions) {
      let trafficHours = { normal: 0, moderate: 0.14, heavy: 0.36 }[conditions.traffic];
      let trafficCost = { normal: 0, moderate: 0.03, heavy: 0.08 }[conditions.traffic];
      let weatherHours = { clear: 0, rain: 0.12, fog: 0.18 }[conditions.weather];
      let weatherCost = { clear: 0, rain: 0.04, fog: 0.05 }[conditions.weather];
      let roughHours = conditions.road === "rough" ? 0.18 : 0;
      let roughCost = conditions.road === "rough" ? 0.07 : 0;

      if (route.mode === "train") {
        trafficHours = 0;
        trafficCost = 0;
        roughHours = 0;
        roughCost = 0;
        weatherHours *= 0.45;
        weatherCost *= 0.35;
      } else if (route.mode === "flight") {
        trafficHours = 0;
        trafficCost = 0;
        roughHours = 0;
        roughCost = 0;
        weatherHours = { clear: 0, rain: 0.16, fog: 0.34 }[conditions.weather];
        weatherCost = { clear: 0, rain: 0.05, fog: 0.09 }[conditions.weather];
      }

      const riskBoost = route.mode === "road" && conditions.traffic === "heavy" ? route.trafficRisk / 70 : 0;
      return [1 + trafficHours + weatherHours + roughHours + riskBoost, 1 + trafficCost + weatherCost + roughCost];
    }

    function conditionNotes(route, conditions) {
      const notes = [];
      if (route.mode === "road" && conditions.traffic !== "normal") {
        notes.push(`${conditions.traffic[0].toUpperCase()}${conditions.traffic.slice(1)} traffic increases this road edge weight`);
      }
      if (conditions.weather !== "clear") {
        notes.push(`${conditions.weather[0].toUpperCase()}${conditions.weather.slice(1)} weather delay applied to ${route.mode}`);
      }
      if (route.mode === "road" && conditions.road === "rough") notes.push("Rough road penalty added");
      if (route.mode === "road" && conditions.road === "closures") notes.push("Closure-prone road edges are avoided");
      return notes;
    }

    function adjustedLegValues(route, vehicleId, conditions = DEFAULT_CONDITIONS) {
      const vehicle = vehicleProfile(vehicleId);
      let hours = route.hours;
      let cost = route.cost;
      if (route.mode === "road") {
        hours = route.hours / vehicle.speedFactor;
        cost = route.cost * vehicle.costFactor;
      }
      const [hourMultiplier, costMultiplier] = conditionMultipliers(route, conditions);
      return [Math.round(hours * hourMultiplier * 10) / 10, Math.trunc(cost * costMultiplier)];
    }

    function makeServiceStops(route, vehicleId) {
      const vehicle = vehicleProfile(vehicleId);
      if (route.mode !== "road" || !vehicle.serviceTypes.length) return [];

      const serviceRange = vehicle.range;
      const interval = Math.max(95, Math.trunc(serviceRange * 0.72));
      if (route.distance < Math.min(135, interval)) return [];

      const count = Math.max(1, Math.trunc(route.distance / interval));
      const source = cities[route.source];
      const target = cities[route.target];
      const names = {
        petrol: "Petrol Pump",
        diesel: "Diesel Pump",
        ev: "EV Fast Charger",
        gas: "CNG / Gas Station",
      };

      return Array.from({ length: count }, (_, index) => {
        const fraction = (index + 1) / (count + 1);
        const stopType = vehicle.serviceTypes[index % vehicle.serviceTypes.length];
        return {
          id: `${route.id}-s${index + 1}`,
          name: `${source.name} - ${target.name} ${names[stopType] || "Service Stop"}`,
          type: stopType,
          distanceFromStart: Math.trunc(route.distance * fraction),
          x: Math.round((source.x + (target.x - source.x) * fraction) * 100) / 100,
          y: Math.round((source.y + (target.y - source.y) * fraction) * 100) / 100,
          waitMinutes: vehicle.stopMinutes,
        };
      });
    }

    function edgeWeight(route, priority, vehicleId, conditions) {
      const [hours, cost] = adjustedLegValues(route, vehicleId, conditions);
      const servicePenalty = makeServiceStops(route, vehicleId).length * (vehicleProfile(vehicleId).stopMinutes / 12);
      if (priority === "time") return hours + servicePenalty;
      if (priority === "cost") return cost / 100;
      if (priority === "distance") return route.distance / 10;
      if (priority === "scenic") {
        return Math.max(1, route.distance / 16 + hours * 5 + cost / 180 - route.scenic * 9.5);
      }
      return Math.max(1, route.distance / 14 + hours * 6.2 + cost / 190 + servicePenalty - route.scenic * 2.8);
    }

    function hydrateLeg(route, vehicleId, conditions) {
      const [hours, cost] = adjustedLegValues(route, vehicleId, conditions);
      return {
        ...route,
        hours,
        cost,
        fromName: cities[route.source].name,
        toName: cities[route.target].name,
        serviceStops: makeServiceStops(route, vehicleId),
        conditionNotes: conditionNotes(route, conditions),
      };
    }

    function normalizeVisits(visits = []) {
      const selected = [];
      const seen = new Set();
      visits.forEach((visitId) => {
        if (attractions[visitId] && !seen.has(visitId)) {
          selected.push(visitId);
          seen.add(visitId);
        }
      });
      return selected;
    }

    function normalizeWaypoints(waypoints = [], start, end) {
      const selected = [];
      const seen = new Set([start, end]);
      waypoints.forEach((cityId) => {
        if (cities[cityId] && !seen.has(cityId)) {
          selected.push(cityId);
          seen.add(cityId);
        }
      });
      return selected;
    }

    function visitWaypoints(visits, start, end, existingWaypoints) {
      const selected = [];
      const seen = new Set([start, end, ...existingWaypoints]);
      visits.forEach((visitId) => {
        const cityId = attractions[visitId].cityId;
        if (!seen.has(cityId)) {
          selected.push(cityId);
          seen.add(cityId);
        }
      });
      return selected;
    }

    function buildVisitStops(path, visits, vehicleId, conditions) {
      const pathSet = new Set(path);
      const vehicle = vehicleProfile(vehicleId);
      const stops = [];
      normalizeVisits(visits).forEach((visitId) => {
        const attraction = attractions[visitId];
        const city = cities[attraction.cityId];
        if (!pathSet.has(attraction.cityId)) return;
        let baseCost = attraction.localDistance * 5;
        if (["bike", "ev", "diesel", "cng", "car"].includes(vehicleId)) baseCost *= vehicle.costFactor;
        if (vehicleId === "train") baseCost *= 0.75;
        if (vehicleId === "flight") baseCost *= 1.15;
        const [hourMultiplier, costMultiplier] = conditionMultipliers(
          { mode: "road", trafficRisk: 4, weatherRisk: 3, roadRisk: 2 },
          conditions
        );
        stops.push({
          id: visitId,
          cityId: attraction.cityId,
          cityName: city.name,
          name: attraction.name,
          note: attraction.note,
          addedDistance: Math.trunc(attraction.localDistance),
          addedHours: Math.round((attraction.localDistance / 28 + attraction.visitHours) * hourMultiplier * 10) / 10,
          addedCost: Math.trunc(baseCost * costMultiplier),
          suggestedMinutes: attraction.suggestedMinutes,
          x: Math.round((city.x + ((stops.length % 3) - 1) * 1.25) * 100) / 100,
          y: Math.round((city.y - 1.55 - (stops.length % 2) * 0.9) * 100) / 100,
        });
      });
      return stops;
    }

    function routeTotals(legs, visitStops = []) {
      const distance = legs.reduce((total, leg) => total + leg.distance, 0) + visitStops.reduce((total, stop) => total + stop.addedDistance, 0);
      const hours = legs.reduce((total, leg) => total + leg.hours, 0) + visitStops.reduce((total, stop) => total + stop.addedHours, 0);
      const cost = legs.reduce((total, leg) => total + leg.cost, 0) + visitStops.reduce((total, stop) => total + stop.addedCost, 0);
      const scenic = legs.length ? Math.round((legs.reduce((total, leg) => total + leg.scenic, 0) / legs.length) * 10) / 10 : 0;
      const serviceStops = legs.reduce((total, leg) => total + leg.serviceStops.length, 0);
      return {
        distance: Math.trunc(distance),
        hours: Math.round(hours * 10) / 10,
        cost: Math.trunc(cost),
        scenic,
        stops: Math.max(0, legs.length - 1),
        legs: legs.length,
        serviceStops,
        visitStops: visitStops.length,
      };
    }

    function collectAttractions(path, includeAttractions) {
      if (!includeAttractions) return [];
      return path.map((cityId) => ({
        cityId,
        cityName: cities[cityId].name,
        region: cities[cityId].region,
        tag: cities[cityId].tag,
        attractions: cities[cityId].attractions.slice(0, 4),
      }));
    }

    function emptyResult(start, end, priority, modes, vehicleId, includeAttractions, conditions, visits = []) {
      const visitStops = buildVisitStops([start], visits, vehicleId, conditions);
      return {
        path: [start],
        pathNames: [cities[start].name],
        legs: [],
        totals: routeTotals([], visitStops),
        visitedOrder: [start],
        visitedCount: 1,
        weight: 0,
        priority,
        modes: [...modes].sort(),
        vehicle: vehicleResult(vehicleId),
        source: start,
        destination: end,
        serviceStops: [],
        visitStops,
        conditions,
        nearbyAttractions: collectAttractions([start], includeAttractions),
      };
    }

    function dijkstra(start, end, priority = "balanced", modes = null, vehicleId = "car", includeAttractions = true, conditionsInput = {}) {
      validateCity(start);
      validateCity(end);
      const conditions = normalizeConditions(conditionsInput);
      const safePriority = priorities.has(priority) ? priority : "balanced";
      const allowedModes = effectiveModes(vehicleId, modes);
      if (!allowedModes.size) throw new Error("Choose at least one transport mode.");
      if (start === end) return emptyResult(start, end, safePriority, allowedModes, vehicleId, includeAttractions, conditions);

      const distances = { [start]: 0 };
      const previous = {};
      const queue = [{ cost: 0, cityId: start }];
      const settled = new Set();
      const visitedOrder = [];

      while (queue.length) {
        queue.sort((a, b) => a.cost - b.cost);
        const current = queue.shift();
        if (settled.has(current.cityId)) continue;
        settled.add(current.cityId);
        visitedOrder.push(current.cityId);
        if (current.cityId === end) break;

        adjacency[current.cityId].forEach((route) => {
          if (!allowedModes.has(route.mode) || shouldSkipRoute(route, conditions)) return;
          const nextCity = route.target;
          const newCost = current.cost + edgeWeight(route, safePriority, vehicleId, conditions);
          if (newCost < (distances[nextCity] ?? Infinity)) {
            distances[nextCity] = newCost;
            previous[nextCity] = { cityId: current.cityId, route };
            queue.push({ cost: newCost, cityId: nextCity });
          }
        });
      }

      if (distances[end] === undefined) {
        throw new Error("No route found with the selected transport modes and vehicle.");
      }

      const path = [];
      const legs = [];
      let cursor = end;
      while (cursor !== start) {
        path.push(cursor);
        const step = previous[cursor];
        legs.push(hydrateLeg(step.route, vehicleId, conditions));
        cursor = step.cityId;
      }
      path.push(start);
      path.reverse();
      legs.reverse();

      return {
        path,
        pathNames: path.map((cityId) => cities[cityId].name),
        legs,
        totals: routeTotals(legs),
        visitedOrder,
        visitedCount: visitedOrder.length,
        weight: Math.round(distances[end] * 100) / 100,
        priority: safePriority,
        modes: [...allowedModes].sort(),
        vehicle: vehicleResult(vehicleId),
        source: start,
        destination: end,
        serviceStops: legs.flatMap((leg) => leg.serviceStops),
        visitStops: [],
        conditions,
        nearbyAttractions: collectAttractions(path, includeAttractions),
      };
    }

    function composeTrip(start, end, priority, modes, vehicleId, includeAttractions, waypoints = [], visits = [], conditionsInput = {}) {
      const conditions = normalizeConditions(conditionsInput);
      const selectedVisits = normalizeVisits(visits);
      const selectedWaypoints = normalizeWaypoints(waypoints, start, end);
      selectedWaypoints.push(...visitWaypoints(selectedVisits, start, end, selectedWaypoints));
      const routePoints = [start, ...selectedWaypoints, end];
      const allowedModes = effectiveModes(vehicleId, modes);

      const path = [];
      const legs = [];
      const visitedOrder = [];
      let totalWeight = 0;

      for (let index = 0; index < routePoints.length - 1; index += 1) {
        const segment = dijkstra(routePoints[index], routePoints[index + 1], priority, modes, vehicleId, false, conditions);
        totalWeight += segment.weight;
        legs.push(...segment.legs);
        visitedOrder.push(...segment.visitedOrder);
        if (index === 0) path.push(...segment.path);
        else path.push(...segment.path.slice(1));
      }

      const visitStops = buildVisitStops(path, selectedVisits, vehicleId, conditions);
      return {
        path,
        pathNames: path.map((cityId) => cities[cityId].name),
        legs,
        totals: routeTotals(legs, visitStops),
        visitedOrder,
        visitedCount: new Set(visitedOrder).size,
        weight: Math.round(totalWeight * 100) / 100,
        priority: priorities.has(priority) ? priority : "balanced",
        modes: [...allowedModes].sort(),
        vehicle: vehicleResult(vehicleId),
        source: start,
        destination: end,
        waypoints: selectedWaypoints,
        serviceStops: legs.flatMap((leg) => leg.serviceStops),
        visitStops,
        selectedVisits,
        conditions,
        nearbyAttractions: collectAttractions(path, includeAttractions),
      };
    }

    function alternativeRoutes(start, end, selectedPriority, modes, vehicleId, conditions) {
      const alternatives = [];
      const signatures = new Set();
      ["time", "cost", "distance", "scenic"].forEach((priority) => {
        if (priority === selectedPriority) return;
        try {
          const result = dijkstra(start, end, priority, modes, vehicleId, false, conditions);
          const signature = result.path.join("|");
          if (!signatures.has(signature)) {
            signatures.add(signature);
            alternatives.push({
              priority,
              path: result.path,
              pathNames: result.pathNames,
              totals: result.totals,
              weight: result.weight,
              vehicle: result.vehicle,
            });
          }
        } catch (error) {
          // Some mode/vehicle combinations cannot produce every alternative.
        }
      });
      return alternatives.slice(0, 3);
    }

    function planRoute(payload) {
      const priority = priorities.has(payload.priority) ? payload.priority : "balanced";
      const result = composeTrip(
        payload.source,
        payload.destination,
        priority,
        payload.modes,
        payload.vehicle || "car",
        payload.includeAttractions !== false,
        payload.waypoints || [],
        payload.visits || [],
        payload.conditions || DEFAULT_CONDITIONS
      );
      result.alternatives = alternativeRoutes(
        payload.source,
        payload.destination,
        result.priority,
        result.modes,
        result.vehicle.id,
        result.conditions
      );
      return result;
    }

    return { planRoute };
  }

  const cache = new WeakMap();

  window.StaticTravelPlanner = {
    planRoute(graph, payload) {
      if (!cache.has(graph)) cache.set(graph, plannerFor(graph));
      return cache.get(graph).planRoute(payload);
    },
  };
})();
