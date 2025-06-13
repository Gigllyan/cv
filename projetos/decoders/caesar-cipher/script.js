document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const shiftValue = document.getElementById('shiftValue');
    const encodeButton = document.getElementById('encodeButton');
    const decodeButton = document.getElementById('decodeButton');
    const outputText = document.getElementById('outputText');

    encodeButton.addEventListener('click', () => {
        const text = inputText.value;
        const shift = parseInt(shiftValue.value);
        if (isNaN(shift)) {
            alert("Shift value must be a number.");
            return;
        }
        outputText.value = caesarCipher(text, shift, 'encode');
    });

    decodeButton.addEventListener('click', () => {
        const text = inputText.value;
        const shift = parseInt(shiftValue.value);
        if (isNaN(shift)) {
            alert("Shift value must be a number.");
            return;
        }
        outputText.value = caesarCipher(text, shift, 'decode');
    });

    function caesarCipher(text, shift, mode) {
        if (mode === 'decode') {
            shift = (26 - shift) % 26; // For decoding, use the inverse shift
        }
        shift = shift % 26; // Ensure shift is within 0-25

        return text.split('').map(char => {
            if (char.match(/[a-z]/)) {
                let code = char.charCodeAt(0);
                code = ((code - 97 + shift) % 26) + 97; // 97 is 'a'
                return String.fromCharCode(code);
            } else if (char.match(/[A-Z]/)) {
                let code = char.charCodeAt(0);
                code = ((code - 65 + shift) % 26) + 65; // 65 is 'A'
                return String.fromCharCode(code);
            }
            return char; // Non-alphabetic characters remain unchanged
        }).join('');
    }
});
