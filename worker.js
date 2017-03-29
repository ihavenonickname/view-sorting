function swap (array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;

    postMessage({
        action: 'swap',
        array: array
    });
}

function compare (array, i, j) {
    postMessage({
        action: 'compare',
        array: array,
        indexes: [i, j]
    });

    return array[i] > array[j];
}

function bubbleSort (array) {
    for (var i = 0; i < array.length; i++) {
        var swapped = false;

        for (var j = 0; j < array.length - 1; j++) {
            if (compare(array, j, j + 1)) {
                swap(array, j, j + 1);
                swapped = true;
            }
        }

        if (!swapped) {
            return;
        }
    }
}

function selectionSort (array) {
    for (var i = 0; i < array.length - 1; i++) {
        var lowerBound = i;

        for (var j = i + 1; j < array.length; j++) {
            if (compare(array, lowerBound, j)) {
                lowerBound = j;
            }
        }

        if (lowerBound !== i) {
            swap(array, i, lowerBound);
        }
    }
}

function insertionSort (array) {
    for (var i = 1; i < array.length; i++) {
        var j = i;

        while (j > 0 && compare(array, j - 1, j)) {
            swap(array, j, j - 1);
            j--;
        }
    }
}

function cocktailSort (array) {
    var i = 0;

    while (true) {
        var swapped = false;
        var higherBound = array.length - i - 1;

        for (var j = i; j < higherBound; j++) {
            if (compare(array, j, j + 1)) {
                swapped = true;
                swap(array, j, j + 1);
            }
        }

        for (var j = higherBound; j >= i; j--) {
            if (compare(array, j, j + 1)) {
                swapped = true;
                swap(array, j, j + 1);
            }
        }

        if (!swapped) {
            return;
        }

        i++;
    }
}

function combSort (array) {
    var gap = array.length;
    var shrinkFactor = 1.3;
    var sorted = false;

    do {
        gap = Math.floor(gap / shrinkFactor);

        if (gap > 1) {
            sorted = false;
        } else {
            gap = 1;
            sorted = true;
        }

        for (var i = 0; i < array.length - gap; i++) {
            if (compare(array, i, i + gap)) {
                sorted = false;
                swap(array, i, i + gap);
            }
        }
    } while (!sorted);
}

function shellSort (array) {
    function half (n) {
        return Math.floor(n / 2);
    }

    for (var gap = half(array.length); gap > 0; gap = half(gap)) {
        for (var i = gap; i < array.length; i++) {
            var j = i;

            while (j >= gap && compare(array, j - gap, j)) {
                swap(array, j, j - gap);
                j -= gap;
            }
        }
    }
}

function gnomeSort (array) {
    var i = 0;

    while (i < array.length) {
        if (i === 0 || compare(array, i, i - 1)) {
            i++;
        } else {
            swap(array, i, i - 1);
            i--;
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
    case 'cocktail':
        cocktailSort(args.array);
        break;
    case 'comb':
        combSort(args.array);
        break;
    case 'shell':
        shellSort(args.array);
        break;
    case 'gnome':
        gnomeSort(args.array);
        break;
    }

    postMessage({
        action: 'done',
        array: args.array
    });
}
