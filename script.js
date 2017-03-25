var blockSize;
var context;
var worker;
var changes = [];
var showComparisons;
var speed;

// Knuth shuffle algorithm
function shuffle (array) {
    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    for (var i = 0; i < array.length - 1; i++) {
        var randomIndex = randomNumber(i, array.length);

        var temp = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = temp;
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
    if (changes.length == 0) {
        setTimeout(pulling, 100);

        return;
    }

    var data = changes.shift();
    var isComparison = data.action === 'compare';

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
            changes.push(args);
            killWorker();
            break;
        case 'swap':
            changes.push(args);
            break;
        case 'compare':
            changes.push(args);
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

window.onload = function () {
    var canvas = get('my-canvas');

    canvas.height = canvas.scrollHeight;
    canvas.width = canvas.scrollHeight;

    context = canvas.getContext('2d');

    context.height = canvas.height;
    context.width = canvas.width;

    speed = parseInt(get('inp-speed').value);
    showComparisons = get('inp-comparisons').checked;

    pulling();
}

get('show').onclick = function () {
    if (worker) {
        killWorker();
    }

    blockSize = parseInt(get('inp-size').value);

    if (blockSize < 3 || blockSize > 50 || !blockSize) {
        alert('Block size between 3 and 50');

        return;
    }

    var algorithm = get('opt-algorithm').value.replace(' sort', '').toLowerCase();

    changes = [];

    var blocks = createBlocks();

    shuffle(blocks);

    plot(blocks);

    startWorker(blocks, algorithm);
}

get('inp-comparisons').onclick = function () {
    showComparisons = get('inp-comparisons').checked;
}

get('inp-speed').oninput = function () {
    speed = parseInt(get('inp-speed').value);
}
