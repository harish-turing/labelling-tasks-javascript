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
        const dx = lineSegment.end.x - lineSegment.start.x;
        const dy = lineSegment.end.y - lineSegment.start.y;
        const lengthSquared = dx ** 2 + dy ** 2;

        if (lengthSquared === 0) {
            return this.distanceTo(lineSegment.start);
        }

        const t = ((this.x - lineSegment.start.x) * dx + (this.y - lineSegment.start.y) * dy) / lengthSquared;
        const tClamped = Math.max(0, Math.min(1, t));

        const nearestX = lineSegment.start.x + tClamped * dx;
        const nearestY = lineSegment.start.y + tClamped * dy;

        return Math.sqrt((this.x - nearestX) ** 2 + (this.y - nearestY) ** 2);
    }

    distanceTo(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }
}

class LineSegment {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

class RouteOptimizer {
    constructor(waypoints, obstacles, safeDistance) {
        this.waypoints = waypoints;
        this.obstacles = obstacles;
        this.safeDistance = safeDistance;
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

            const lineSegment = new LineSegment(currentWaypoint, closestWaypoint);
            const safeRoute = this.findSafeRoute(lineSegment);

            route.push(...safeRoute.slice(1));
            unvisitedWaypoints.splice(unvisitedWaypoints.indexOf(closestWaypoint), 1);
        }

        // Optional: Return to start
        if (route.length > 1) {
            const lineSegment = new LineSegment(route[route.length - 1], route[0]);
            const safeRoute = this.findSafeRoute(lineSegment);
            route.push(...safeRoute.slice(1));
        }

        return route;
    }

    findSafeRoute(lineSegment) {
        const safeRoute = [lineSegment.start];

        let currentWaypoint = lineSegment.start;
        let nextWaypoint = lineSegment.end;

        while (currentWaypoint.distanceTo(nextWaypoint) > this.safeDistance) {
            const intermediateWaypoint = this.findIntermediateWaypoint(currentWaypoint, nextWaypoint);
            safeRoute.push(intermediateWaypoint);

            currentWaypoint = intermediateWaypoint;
        }

        safeRoute.push(nextWaypoint);
        return safeRoute;
    }

    findIntermediateWaypoint(start, end) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const distance = this.safeDistance;

        const intermediateX = start.x + distance * Math.cos(angle);
        const intermediateY = start.y + distance * Math.sin(angle);

        return new Waypoint(intermediateX, intermediateY);
    }

    isSafeRoute(lineSegment) {
        for (const obstacle of this.obstacles) {
            if (obstacle.intersectsWithLineSegment(lineSegment)) {
                return false;
            }
        }
        return true;
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
    new Obstacle(3, 3, 1),
    new Obstacle(7, 2, 1.5),
];

const safeDistance = 1.5;
const routeOptimizer = new RouteOptimizer(waypoints, obstacles, safeDistance);
const optimizedRoute = routeOptimizer.optimizeRoute();

console.log("Optimized Route:");
optimizedRoute.forEach((waypoint, index) => {
    console.log(`Waypoint ${index + 1}: (${waypoint.x}, ${waypoint.y})`);
});

/*
    Output:
    Optimized Route:
Waypoint 1: (0, 0)
Waypoint 2: (1.0606601717798214, 1.0606601717798212)
Waypoint 3: (2.121320343559643, 2.121320343559643)
Waypoint 4: (3.1819805153394642, 3.181980515339464)
Waypoint 5: (4.242640687119286, 4.242640687119286)
Waypoint 6: (5, 5)
Waypoint 7: (6.060660171779821, 3.939339828220179)
Waypoint 8: (7.121320343559642, 2.878679656440358)
Waypoint 9: (8.181980515339463, 1.8180194846605369)
Waypoint 10: (9.242640687119284, 0.7573593128807157)
Waypoint 11: (10, 0)
Waypoint 12: (8.939339828220179, 1.0606601717798214)
Waypoint 13: (7.878679656440358, 2.121320343559643)
Waypoint 14: (6.818019484660537, 3.1819805153394642)
Waypoint 15: (5.757359312880716, 4.242640687119286)
Waypoint 16: (4.696699141100895, 5.303300858899107)
Waypoint 17: (3.636038969321074, 6.363961030678928)
Waypoint 18: (2.5753787975412523, 7.424621202458749)
Waypoint 19: (1.5147186257614311, 8.48528137423857)
Waypoint 20: (0.4540584539816095, 9.54594154601839)
Waypoint 21: (0, 10)
Waypoint 22: (9.184850993605148e-17, 8.5)
Waypoint 23: (-1.4936988751544402e-16, 7)
Waypoint 24: (-5.752137757939253e-17, 5.5)
Waypoint 25: (3.432713235665895e-17, 4)
Waypoint 26: (-2.0689126509483655e-16, 2.5)
Waypoint 27: (-1.1504275515878507e-16, 1)
Waypoint 28: (0, 0)

*/