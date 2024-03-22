function encodeOrDecode() {
    var inputText = document.getElementById('inputText').value;
    var outputText = document.getElementById('outputText');

    if (isHex(inputText)) {
        outputText.value = hexToAscii(inputText);
    } else {
        outputText.value = asciiToHex(inputText);
    }
}

function isHex(str) {
    return /^[0-9A-Fa-f]+$/.test(str);
}

function asciiToHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        hex += ('0' + charCode.toString(16)).slice(-2);
    }
    return hex.toUpperCase();
}

function hexToAscii(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var charCode = parseInt(hex.substr(i, 2), 16);
        str += String.fromCharCode(charCode);
    }
    return str;
}

function copyResult() {
    var outputText = document.getElementById('outputText');
    outputText.select();
    document.execCommand("copy");
    alert("Result copied to clipboard!");
}




function clearInput() {
    document.getElementById('inputText').value = "";
}