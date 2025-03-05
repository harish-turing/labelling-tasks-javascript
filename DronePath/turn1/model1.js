class Waypoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(otherWaypoint) {
        return Math.sqrt((this.x - otherWaypoint.x) ** 2 + (this.y - otherWaypoint.y) ** 2);
    }
}

class RouteOptimizer {
    constructor(waypoints) {
        this.waypoints = waypoints;
    }

    optimizeRoute() {
        const route = [this.waypoints[0]];
        const unvisitedWaypoints = this.waypoints.slice(1);

        while (unvisitedWaypoints.length > 0) {
            const currentWaypoint = route[route.length - 1];
            const closestWaypoint = unvisitedWaypoints.reduce((minWaypoint, waypoint) => {
                if (waypoint.distanceTo(currentWaypoint) < minWaypoint.distanceTo(currentWaypoint)) {
                    return waypoint;
                }
                return minWaypoint;
            }, unvisitedWaypoints[0]);

            route.push(closestWaypoint);
            unvisitedWaypoints.splice(unvisitedWaypoints.indexOf(closestWaypoint), 1);
        }

        // Optional: Return to start
        if (route.length > 1) {
            route.push(route[0]);
        }

        return route;
    }
}

// Example usage:
const waypoints = [
    new Waypoint(0, 0),
    new Waypoint(10, 0),
    new Waypoint(5, 5),
    new Waypoint(0, 10),
];

const routeOptimizer = new RouteOptimizer(waypoints);
const optimizedRoute = routeOptimizer.optimizeRoute();

console.log("Optimized Route:");
optimizedRoute.forEach((waypoint, index) => {
    console.log(`Waypoint ${index + 1}: (${waypoint.x}, ${waypoint.y})`);
});