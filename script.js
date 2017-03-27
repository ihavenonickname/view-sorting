var blockSize;
var context;
var worker;
var futureUpdates = [];
var showComparisons;
var speed;
var nComparisons = 0;
var nSwaps = 0;

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Knuth shuffle algorithm
function shuffle (array) {
    for (var i = 0; i < array.length - 1; i++) {
        var randomIndex = randomNumber(i, array.length);

        var temp = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = temp;
    }
}

function shuffleJustABit(array) {
    var nIterations = Math.sqrt(array.length);

    for (var i = 0; i < nIterations; i++) {
        var a = randomNumber(i, array.length);
        var b = randomNumber(i, array.length);

        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }
}

function plot (array, specials) {
    context.clearRect(0, 0, context.width, context.height);

    if (typeof(specials) === 'undefined') {
        specials = [];
    }

    for (var i = 0; i < array.length; i++) {
        var x = array[array.length - i - 1] * blockSize;
        var y = i * blockSize;

        if (specials.indexOf(i) === -1) {
            context.fillStyle = '#000';
        } else {
            context.fillStyle = '#FF0000';
        }

        context.fillRect(x, y, blockSize, blockSize);
    }
}

function killWorker () {
    worker.terminate();
    worker = null;
}

function pulling () {
    if (futureUpdates.length == 0) {
        setTimeout(pulling, 100);

        return;
    }

    var data = futureUpdates.shift();
    var isComparison = data.action === 'compare';

    if (isComparison) {
        nComparisons++;
    } else {
        nSwaps++;
    }

    updateStats();

    if (isComparison && !showComparisons) {
        setTimeout(pulling, 1);
    } else {
        plot(data.array, data.indexes);
        setTimeout(pulling, isComparison ? (speed * 10) : speed);
    }
}

function startWorker (blocks, algorithm) {
    worker = new Worker('worker.js');

    worker.onmessage = function (event) {
        var args = event.data;

        switch (args.action) {
        case 'done':
            futureUpdates.push(args);
            killWorker();
            break;
        case 'swap':
            futureUpdates.push(args);
            break;
        case 'compare':
            futureUpdates.push(args);
            break;
        default:
            console.log(JSON.stringify(args));
        }
    }

    worker.postMessage({
        array: blocks,
        algorithm: algorithm
    });
}

function createBlocks () {
    var blocks = [];

    var blocksCount = Math.floor(get('my-canvas').height * 0.95 / blockSize);

    for (var i = 0; i < blocksCount; i++) {
        blocks[i] = i;
    }

    return blocks;
}

function get (id) {
    return document.getElementById(id);
}

function updateStats () {
    get('comparisons').innerHTML = nComparisons;
    get('swaps').innerHTML = nSwaps;
}

window.onload = function () {
    var canvas = get('my-canvas');

    canvas.height = canvas.scrollHeight;
    canvas.width = canvas.scrollHeight;

    context = canvas.getContext('2d');

    context.height = canvas.height;
    context.width = canvas.width;

    speed = parseInt(get('speed').value);
    showComparisons = get('show-comparisons').checked;

    updateStats();

    pulling();
}

get('start').onclick = function () {
    if (worker) {
        killWorker();
    }

    blockSize = parseInt(get('size').value);

    if (blockSize < 3 || blockSize > 50 || !blockSize) {
        alert('Block size between 3 and 50');

        return;
    }

    var algorithm = get('algorithm').value.replace(' sort', '').toLowerCase();

    nComparisons = 0;
    nSwaps = 0;

    futureUpdates = [];

    var blocks = createBlocks();

    get('elements-count').innerHTML = blocks.length;

    switch (get('initial-state').value.toLowerCase()) {
    case 'random':
        shuffle(blocks);
        break;
    case 'reversed':
        blocks.reverse();
        break;
    case 'nearly sorted':
        shuffleJustABit(blocks);
        break;
    }

    plot(blocks);

    startWorker(blocks, algorithm);
}

get('show-comparisons').onclick = function () {
    showComparisons = get('show-comparisons').checked;
}

get('speed').oninput = function () {
    speed = parseInt(get('speed').value);
}
