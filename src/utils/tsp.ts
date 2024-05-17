interface TSPResult {
    distance: number;
    path: number[];
}

export const tsp = (dist: number[][]): TSPResult => {
    const n = dist.length;
    const VISITED_ALL = (1 << n) - 1;

    // memoization table
    const dp: number[][] = Array.from({ length: n }, () => Array(1 << n).fill(-1));

    const tspHelper = (mask: number, pos: number): number => {
        // Base case: all cities visited
        if (mask === VISITED_ALL) {
            return dist[pos][0];
        }

        // Check memo table
        if (dp[pos][mask] !== -1) {
            return dp[pos][mask];
        }

        let ans = Number.MAX_VALUE;

        // Try to go to an unvisited city
        for (let city = 0; city < n; city++) {
            if ((mask & (1 << city)) === 0) {
                const newDist = dist[pos][city] + tspHelper(mask | (1 << city), city);
                ans = Math.min(ans, newDist);
            }
        }

        // Save result in memo table
        dp[pos][mask] = ans;
        return ans;
    };

    // To reconstruct the path
    const findPath = (): number[] => {
        let mask = 1;
        let pos = 0;
        const path = [0];

        while (mask !== VISITED_ALL) {
            let bestCity = -1;
            for (let city = 0; city < n; city++) {
                if ((mask & (1 << city)) === 0) {
                    if (bestCity === -1 || 
                        dp[pos][mask | (1 << city)] + dist[pos][city] < dp[pos][mask | (1 << bestCity)] + dist[pos][bestCity]) {
                        bestCity = city;
                    }
                }
            }
            path.push(bestCity);
            mask |= (1 << bestCity);
            pos = bestCity;
        }
        path.push(0); // return to start point
        return path;
    };

    const shortestDistance = tspHelper(1, 0);
    const shortestPath = findPath();

    return { distance: shortestDistance, path: shortestPath };
};
