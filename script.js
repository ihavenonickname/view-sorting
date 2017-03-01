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

function startWorker (blocks) {
    worker = new Worker('worker.js');

    worker.onmessage = function (event) {
        var data = event.data;

        if (data === 'done') {
            worker.terminate();
            worker = null;
        } else {
            plot(data);
        }
    }

    worker.postMessage(blocks);
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
        return;
    }

    blockSize = parseInt(get('inp-size').value);

    if (blockSize < 1 || blockSize > 15 || !blockSize) {
        alert('between 1 and 15');
        
        return;
    }

    var blocks = createBlocks();

    shuffle(blocks);

    plot(blocks);

    startWorker(blocks);
}