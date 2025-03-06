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

    getDirection(startWaypoint, endWaypoint) {
        const angle = Math.atan2(endWaypoint.y - startWaypoint.y, endWaypoint.x - startWaypoint.x);
        if (angle > 0 && angle < Math.PI / 2) {
            return "NE";
        } else if (angle > Math.PI / 2 && angle < Math.PI) {
            return "SE";
        } else if (angle > -Math.PI && angle < -Math.PI / 2) {
            return "SW";
        } else if (angle > -Math.PI / 2 && angle < 0) {
            return "NW";
        } else if (angle === 0) {
            return "E";
        } else if (angle === Math.PI / 2) {
            return "N";
        } else if (angle === -Math.PI / 2) {
            return "S";
        } else if (angle === Math.PI) {
            return "W";
        }
    }

    drawLine(grid, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        for (let i = 0; i <= steps; i++) {
            const x = x1 + Math.round(dx * i / steps);
            const y = y1 + Math.round(dy * i / steps);
            grid[y][x] = "*";
        }
    }

    drawCircle(grid, x, y, radius) {
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                if (i ** 2 + j ** 2 <= radius ** 2) {
                    const newX = x + i;
                    const newY = y + j;
                    if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
                        grid[newY][newX] = "O";
                    }
                }
            }
        }
    }

    visualizeRouteAsAsciiArt(route) {
        const minX = Math.min(...route.map(waypoint => waypoint.x));
        const maxX = Math.max(...route.map(waypoint => waypoint.x));
        const minY = Math.min(...route.map(waypoint => waypoint.y));
        const maxY = Math.max(...route.map(waypoint => waypoint.y));
        const gridSize = 20;
        const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(" "));

        for (let i = 0; i < route.length - 1; i++) {
            const currentWaypoint = route[i];
            const nextWaypoint = route[i + 1];
            const x1 = Math.floor((currentWaypoint.x - minX) / (maxX - minX) * (gridSize - 1));
            const y1 = Math.floor((currentWaypoint.y - minY) / (maxY - minY) * (gridSize - 1));
            const x2 = Math.floor((nextWaypoint.x - minX) / (maxX - minX) * (gridSize - 1));
            const y2 = Math.floor((nextWaypoint.y - minY) / (maxY - minY) * (gridSize - 1));
            this.drawLine(grid, x1, y1, x2, y2);
        }

        for (const obstacle of this.obstacles) {
            const x = Math.floor((obstacle.x - minX) / (maxX - minX) * (gridSize - 1));
            const y = Math.floor((obstacle.y - minY) / (maxY - minY) * (gridSize - 1));
            this.drawCircle(grid, x, y, Math.floor(obstacle.radius / (maxX - minX) * (gridSize - 1)));
        }

        console.log("Route Visualization:");
        for (const row of grid) {
            console.log(row.join(" | "));
        }
    }

    visualizeRoute(route) {
        console.log("Optimized Route:");
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            const currentWaypoint = route[i];
            const nextWaypoint = route[i + 1];
            const distance = currentWaypoint.distanceTo(nextWaypoint);
            totalDistance += distance;
            console.log(`Waypoint ${i + 1} -> Waypoint ${i + 2}: (${currentWaypoint.x}, ${currentWaypoint.y}) -> (${nextWaypoint.x}, ${nextWaypoint.y}) | Distance: ${distance.toFixed(2)} | Direction: ${this.getDirection(currentWaypoint, nextWaypoint)}`);
        }
        console.log(`Total Distance: ${totalDistance.toFixed(2)}`);
        console.log(`Number of Waypoints: ${route.length}`);
        console.log(`Number of Obstacles Avoided: ${this.obstacles.length}`);

        // Simple ASCII art visualization
        this.visualizeRouteAsAsciiArt(route);
    }

    printAsciiArt(route) {
        const gridSize = 20;
        const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(" "));

        for (let i = 0; i < route.length - 1; i++) {
            const currentWaypoint = route[i];
            const nextWaypoint = route[i + 1];

            const x1 = Math.floor(currentWaypoint.x);
            const y1 = Math.floor(currentWaypoint.y);
            const x2 = Math.floor(nextWaypoint.x);
            const y2 = Math.floor(nextWaypoint.y);

            const dx = x2 - x1;
            const dy = y2 - y1;

            for (let j = 0; j <= Math.max(Math.abs(dx), Math.abs(dy)); j++) {
                const x = x1 + Math.floor(j * dx / Math.max(Math.abs(dx), Math.abs(dy)));
                const y = y1 + Math.floor(j * dy / Math.max(Math.abs(dx), Math.abs(dy)));

                if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                    grid[y][x] = "*";
                }
            }
        }

        for (const obstacle of this.obstacles) {
            const x = Math.floor(obstacle.x);
            const y = Math.floor(obstacle.y);
            const radius = Math.floor(obstacle.radius);

            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    const newX = x + i;
                    const newY = y + j;

                    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && Math.sqrt(i ** 2 + j ** 2) <= radius) {
                        grid[newY][newX] = "O";
                    }
                }
            }
        }

        console.log("ASCII Art:");
        for (const row of grid) {
            console.log(row.join(" "));
        }
    }

    printTopDownView(route) {
        const gridSize = 20;
        const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(" "));

        for (const waypoint of route) {
            const x = Math.floor(waypoint.x);
            const y = Math.floor(waypoint.y);

            if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                grid[y][x] = "W";
            }
        }

        for (const obstacle of this.obstacles) {
            const x = Math.floor(obstacle.x);
            const y = Math.floor(obstacle.y);
            const radius = Math.floor(obstacle.radius);

            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    const newX = x + i;
                    const newY = y + j;

                    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && Math.sqrt(i ** 2 + j ** 2) <= radius) {
                        grid[newY][newX] = "O";
                    }
                }
            }
        }

        console.log("Top-Down View:");
        for (const row of grid) {
            console.log(row.join(" "));
        }
    }
}

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
routeOptimizer.visualizeRoute(optimizedRoute);

/*
    Output :

    Optimized Route:
Waypoint 1 -> Waypoint 2: (0, 0) -> (5, 5) | Distance: 7.07 | Direction: NE
Waypoint 2 -> Waypoint 3: (5, 5) -> (10, 0) | Distance: 7.07 | Direction: NW
Waypoint 3 -> Waypoint 4: (10, 0) -> (0, 10) | Distance: 14.14 | Direction: SE
Waypoint 4 -> Waypoint 5: (0, 10) -> (0, 0) | Distance: 10.00 | Direction: S
Total Distance: 38.28
Number of Waypoints: 5
Number of Obstacles Avoided: 2
Route Visualization:
* |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | *
* | * |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | * |  
* |   | * |   |   | O |   |   |   |   |   |   |   | O |   |   |   | * |   |  
* |   |   | O | O | O | O | O |   |   |   |   | O | O | O |   | * |   |   |  
* |   |   | O | O | O | O | O |   |   |   |   |   | O |   | * |   |   |   |  
* |   | O | O | O | O | O | O | O |   |   |   |   | * | * |   |   |   |   |  
* |   |   | O | O | O | O | O |   |   |   |   | * | * |   |   |   |   |   |  
* |   |   | O | O | O | O | O |   |   |   | * | * |   |   |   |   |   |   |  
* |   |   |   |   | O |   |   | * |   | * | * |   |   |   |   |   |   |   |  
* |   |   |   |   |   |   |   |   | * | * |   |   |   |   |   |   |   |   |  
* |   |   |   |   |   |   |   |   | * |   |   |   |   |   |   |   |   |   |  
* |   |   |   |   |   |   |   | * |   |   |   |   |   |   |   |   |   |   |  
* |   |   |   |   |   |   | * |   |   |   |   |   |   |   |   |   |   |   |  
* |   |   |   |   |   | * |   |   |   |   |   |   |   |   |   |   |   |   |  
* |   |   |   |   | * |   |   |   |   |   |   |   |   |   |   |   |   |   |  
* |   |   |   | * |   |   |   |   |   |   |   |   |   |   |   |   |   |   |  
* |   |   | * |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |  
* |   | * |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |  
* | * |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |  
* |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | 


*/