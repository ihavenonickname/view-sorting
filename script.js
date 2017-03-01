var blockSize;
var context;
var worker;

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


function plot (array) {
    context.clearRect(0, 0, context.width, context.height);

    for (var i = 0; i < array.length; i++) {
        var x = array[array.length - i - 1] * blockSize;
        var y = i * blockSize;

        context.fillRect(x, y, blockSize, blockSize);
    }
}

function get (id) {
    return document.getElementById(id);
}

function killWorker () {
    worker.terminate();
    worker = null;
}

function startWorker (blocks, algorithm) {
    worker = new Worker('worker.js');

    worker.onmessage = function (event) {
        var data = event.data;

        if (data === 'done') {
            killWorker();
        } else {
            plot(data);
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

window.onload = function () {
    var canvas = get('my-canvas');
    
    canvas.height = canvas.scrollHeight;
    canvas.width = canvas.scrollHeight;

    context = canvas.getContext('2d');

    context.height = canvas.height;
    context.width = canvas.width;
}

get('show').onclick = function () {
    if (worker) {
        killWorker();
    }

    blockSize = parseInt(get('inp-size').value);
    var algorithm = get('opt-algorithm').value.split(' ')[0].toLowerCase();

    if (blockSize < 1 || blockSize > 15 || !blockSize) {
        alert('between 1 and 15');
        
        return;
    }

    var blocks = createBlocks();

    shuffle(blocks);

    plot(blocks);

    startWorker(blocks, algorithm);
}
