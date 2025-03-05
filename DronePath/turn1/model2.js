class DroneRouteOptimizer {
    constructor(start, destination, obstacles) {
        this.start = start;
        this.destination = destination;
        this.obstacles = obstacles;
        this.route = [start];
    }

    // Calculate the distance between two points
    calculateDistance(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    // Check if a point is obstructed
    isObstructed(point) {
        for (let obstacle of this.obstacles) {
            if (this.calculateDistance(point, obstacle) < 10) {
                return true;
            }
        }
        return false;
    }

    // Find the next point in the route
    findNextPoint() {
        let nextPoint = null;
        let minDistance = Infinity;

        for (let x = this.route[this.route.length - 1].x - 10; x <= this.route[this.route.length - 1].x + 10; x++) {
            for (let y = this.route[this.route.length - 1].y - 10; y <= this.route[this.route.length - 1].y + 10; y++) {
                let point = { x, y };

                // Skip the current point and obstructed points
                if (this.route.some(p => p.x === point.x && p.y === point.y) || this.isObstructed(point)) {
                    continue;
                }

                // Calculate the distance to the destination
                let distance = this.calculateDistance(point, this.destination);

                // Update the next point if the distance is smaller
                if (distance < minDistance) {
                    minDistance = distance;
                    nextPoint = point;
                }
            }
        }

        return nextPoint;
    }

    // Optimize the route
    optimizeRoute() {
        while (this.calculateDistance(this.route[this.route.length - 1], this.destination) > 10) {
            let nextPoint = this.findNextPoint();
            this.route.push(nextPoint);
        }
    }

    // Get the optimized route
    getRoute() {
        return this.route;
    }
}

// Example usage
let start = { x: 0, y: 0 };
let destination = { x: 100, y: 100 };
let obstacles = [{ x: 50, y: 50 }, { x: 30, y: 30 }];

let optimizer = new DroneRouteOptimizer(start, destination, obstacles);
optimizer.optimizeRoute();
console.log(optimizer.getRoute());

/*
    output : 
    [
  { x: 0, y: 0 },
  { x: 10, y: 10 },
  { x: 20, y: 20 },
  { x: 20, y: 30 },
  { x: 30, y: 40 },
  { x: 40, y: 50 },
  { x: 50, y: 60 },
  { x: 60, y: 70 },
  { x: 70, y: 80 },
  { x: 80, y: 90 },
  { x: 90, y: 100 }
]
*/