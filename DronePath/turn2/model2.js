class Waypoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(otherWaypoint) {
        return Math.sqrt((this.x - otherWaypoint.x) ** 2 + (this.y - otherWaypoint.y) ** 2);
    }
}

class Obstacle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    intersectsWithLineSegment(lineSegment) {
        const distance = this.distanceToLineSegment(lineSegment);
        return distance <= this.radius;
    }

    distanceToLineSegment(lineSegment) {
        const { x1, y1, x2, y2 } = lineSegment;
        const { x, y } = this;

        const lineSegmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        if (lineSegmentLength === 0) {
            return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        }

        const t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineSegmentLength ** 2);
        const tClamped = Math.max(0, Math.min(1, t));

        const nearestX = x1 + tClamped * (x2 - x1);
        const nearestY = y1 + tClamped * (y2 - y1);

        return Math.sqrt((x - nearestX) ** 2 + (y - nearestY) ** 2);
    }
}

class RouteOptimizer {
    constructor(waypoints, obstacles) {
        this.waypoints = waypoints;
        this.obstacles = obstacles;
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

            const safeRoute = this.findSafeRoute(currentWaypoint, closestWaypoint);
            route.push(...safeRoute.slice(1));

            unvisitedWaypoints.splice(unvisitedWaypoints.indexOf(closestWaypoint), 1);
        }

        // Optional: Return to start
        if (route.length > 1) {
            const safeRoute = this.findSafeRoute(route[route.length - 1], route[0]);
            route.push(...safeRoute.slice(1));
        }

        return route;
    }

    findSafeRoute(startWaypoint, endWaypoint) {
        const lineSegment = { x1: startWaypoint.x, y1: startWaypoint.y, x2: endWaypoint.x, y2: endWaypoint.y };

        if (this.obstacles.some(obstacle => obstacle.intersectsWithLineSegment(lineSegment))) {
            // Find an alternative safe path
            return this.findAlternativeSafePath(startWaypoint, endWaypoint);
        }

        return [startWaypoint, endWaypoint];
    }

    findAlternativeSafePath(startWaypoint, endWaypoint) {
        // Simple implementation: try to go around the obstacle in a clockwise direction
        const obstacle = this.obstacles.find(obstacle => {
            const lineSegment = { x1: startWaypoint.x, y1: startWaypoint.y, x2: endWaypoint.x, y2: endWaypoint.y };
            return obstacle.intersectsWithLineSegment(lineSegment);
        });

        if (!obstacle) {
            throw new Error("No obstacle found");
        }

        const angle = Math.atan2(endWaypoint.y - startWaypoint.y, endWaypoint.x - startWaypoint.x);
        const radius = obstacle.radius + 1; // Add some extra distance
        const intermediateWaypoint1 = {
            x: startWaypoint.x + radius * Math.cos(angle + Math.PI / 4),
            y: startWaypoint.y + radius * Math.sin(angle + Math.PI / 4),
        };
        const intermediateWaypoint2 = {
            x: endWaypoint.x - radius * Math.cos(angle - Math.PI / 4),
            y: endWaypoint.y - radius * Math.sin(angle - Math.PI / 4),
        };

        return [startWaypoint, intermediateWaypoint1, intermediateWaypoint2, endWaypoint];
    }
}

// Example usage:
const waypoints = [
    new Waypoint(0, 0),
    new Waypoint(10, 0),
    new Waypoint(5, 5),
    new Waypoint(0, 10),
];

const obstacles = [
    new Obstacle(3, 3, 2),
    new Obstacle(7, 2, 1),
];

const routeOptimizer = new RouteOptimizer(waypoints, obstacles);
const optimizedRoute = routeOptimizer.optimizeRoute();

console.log("Optimized Route:");
optimizedRoute.forEach((waypoint, index) => {
    console.log(`Waypoint ${index + 1}: (${waypoint.x}, ${waypoint.y})`);
});

/*
    Optimized Route:
    Waypoint 1: (0, 0)
    Waypoint 2: (1.8369701987210297e-16, 3)
    Waypoint 3: (2, 5)
    Waypoint 4: (5, 5)
    Waypoint 5: (7, 5)
    Waypoint 6: (10, 2)
    Waypoint 7: (10, 0)
    Waypoint 8: (8, 2.4492935982947064e-16)
    Waypoint 9: (-1.2246467991473532e-16, 8)
    Waypoint 10: (0, 10)
    Waypoint 11: (0, 0)
*/