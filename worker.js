function retardedDelay (duration) {
    var endDate = new Date(Date.now() + duration);

    while(Date.now() < endDate) { }
}

function swap (array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;

    postMessage(array);

    retardedDelay(10);
}

function bubbleSort (array) {
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array.length; j++) {
            if (array[j] > array[i]) {
                swap(array, i, j);
            }
        }
    }
}

function selectionSort(array) {
    for (var i = 0; i < array.length - 1; i++) {
        var indexLowest = i;

        for (var j = i + 1; j < array.length; j++) {
            if (array[indexLowest] > array[j]) {
                indexLowest = j;
            }
        }

        if (indexLowest !== i) {
            swap(array, i, indexLowest);
        }
    }
}

function insertionSort (array) {
    for (var i = 1; i < array.length; i++) {
        var j = i;

        while (j > 0 && array[j - 1] > array[j]) {
            swap(array, j, j - 1);
            j--;
        }
    }
}

onmessage = function (event) {
    var args = event.data;

    switch (args.algorithm) {
    case 'bubble': 
        bubbleSort(args.array);
        break;
    case 'selection': 
        selectionSort(args.array);
        break;
    case 'insertion': 
        insertionSort(args.array);
        break;
    }

    postMessage('done');
}
