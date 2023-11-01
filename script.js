let playerPos = { x: 0, y: 0 };

let score = 0;
const scoreDisplay = document.getElementById("score");

// ------------------------------------------------------------------------------------------ //

function updateVisibility() {
    const maxDistance = 3; // The radius of visibility around the player

    // Reset visibility
    document.querySelectorAll(".cell.visible").forEach(cell => {
        cell.classList.remove("visible");
    });

    // Update visibility based on player's position
    for (let y = playerPos.y - maxDistance; y <= playerPos.y + maxDistance; y++) {
        for (let x = playerPos.x - maxDistance; x <= playerPos.x + maxDistance; x++) {
            if (Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y) <= maxDistance) {
                const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
                if (cell) cell.classList.add("visible");
            }
        }
    }
}
function manhattanDistance(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

function findNearestItem(playerPos) {
    const items = document.querySelectorAll(".cell .item");
    let nearestItem = null;
    let shortestDistance = Infinity;

    items.forEach(item => {
        const cell = item.parentElement;
        const cellPos = { x: parseInt(cell.dataset.x, 10), y: parseInt(cell.dataset.y, 10) };
        const distance = manhattanDistance(playerPos, cellPos);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestItem = cell;
        }
    });

    return nearestItem;
}

function highlightPathToItem(playerPos, itemCell) {
    const itemPos = { x: parseInt(itemCell.dataset.x, 10), y: parseInt(itemCell.dataset.y, 10) };
    
    // Clear previous highlights
    document.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));

    // Horizontal path
    const startX = Math.min(playerPos.x, itemPos.x);
    const endX = Math.max(playerPos.x, itemPos.x);
    for (let x = startX; x <= endX; x++) {
        const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${playerPos.y}']`);
        if (cell) cell.classList.add('highlight');
    }

    // Vertical path
    const startY = Math.min(playerPos.y, itemPos.y);
    const endY = Math.max(playerPos.y, itemPos.y);
    for (let y = startY; y <= endY; y++) {
        const cell = document.querySelector(`.cell[data-x='${itemPos.x}'][data-y='${y}']`);
        if (cell) cell.classList.add('highlight');
    }
}

// ------------------------------------------------------------------------------------------ //

const grid = document.getElementById("grid");
const gridSize = 10;

// Initialize grid and player
for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;

        // Add two barriers in the middle row
        if (y === Math.floor(gridSize / 2) && (x !== 3 && x !== 6)) {
            cell.classList.add("barrier");
        }

        grid.appendChild(cell);
        
        if (x === playerPos.x && y === playerPos.y) {
            const player = document.createElement("div");
            player.classList.add("player");
            cell.appendChild(player);
        }
    }
}
// Initialize an isovist
updateVisibility();

// ------------------------------------------------------------------------------------------ //

document.addEventListener("keydown", function(event) {
    const key = event.key;

    // Calculate new position
    let newX = playerPos.x;
    let newY = playerPos.y;
    switch(key) {
        case "ArrowUp": newY--; break;
        case "ArrowDown": newY++; break;
        case "ArrowLeft": newX--; break;
        case "ArrowRight": newX++; break;
    }

    
    // Check boundaries
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {

         // Check if the new position is a barrier
        const targetCell = document.querySelector(`.cell[data-x='${newX}'][data-y='${newY}']`);
        if (targetCell.classList.contains("barrier")) {
            return; // Do not move if it's a barrier
        }

        // Move player
        const oldCell = document.querySelector(`.cell[data-x='${playerPos.x}'][data-y='${playerPos.y}'] .player`);
        oldCell.remove();
        
        const newCell = document.querySelector(`.cell[data-x='${newX}'][data-y='${newY}']`);
        const player = document.createElement("div");
        player.classList.add("player");
        newCell.appendChild(player);
        
        playerPos.x = newX;
        playerPos.y = newY;

        // Check for item collision
        const item = newCell.querySelector(".item");
        if (item) {
            item.remove();
            score += 10;
            scoreDisplay.textContent = "Score: " + score;
        }
    }

    // Update visibility based on new player position
    updateVisibility();

    const nearestItem = findNearestItem(playerPos);
    if (nearestItem) {
        highlightPathToItem(playerPos, nearestItem);
    }

});

// Spawn items at random intervals
setInterval(function() {
    let x, y, cell;

    // Keep searching for a cell without an item or barrier
    do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
        cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
    } while (cell.querySelector('.item') || cell.classList.contains('barrier'));

    const item = document.createElement("div");
    item.classList.add("item");
    cell.appendChild(item);
    
    // Remove item after a random time
    setTimeout(function() {
        item.remove();
    }, Math.random() * 5000 + 1000);  // Remove between 1-6 seconds

}, Math.random() * 3000 + 1000);  // Spawn between 1-4 seconds

