// Função para codificar ou decodificar com cifra de Vigenère
function encodeOrDecode() {
  var inputText = document.getElementById('inputText').value;
  var outputText = document.getElementById('outputText');
  var password = document.getElementById('password').value;

  // Verificar se o campo de senha está preenchido
  if (password) {
    // Se sim, codificar e decodificar com base na senha
    outputText.value = vigenere(inputText, password, true);
  } else {
    // Senão, apenas codificar de forma convencional
    outputText.value = vigenere(inputText, "", false);
  }
}

// Função para codificar ou decodificar com cifra de Vigenère
function vigenere(inputText, keyword, encode) {
  var result = "";
  var keywordIndex = 0;
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < inputText.length; i++) {
    var char = inputText.charAt(i);
    if (char.match(/[a-z]/i)) {
      var keywordChar = keyword.charAt(keywordIndex % keyword.length);
      var shift = alphabet.indexOf(keywordChar.toUpperCase());
      var alphabetIndex = alphabet.indexOf(char.toUpperCase());
      var newIndex = encode ? (alphabetIndex + shift) % alphabet.length : (alphabetIndex - shift + alphabet.length) % alphabet.length;
      var newChar = alphabet.charAt(newIndex);
      result += (char === char.toLowerCase()) ? newChar.toLowerCase() : newChar.toUpperCase();
      keywordIndex++;
    } else {
      result += char;
    }
  }

  return result;
}

// Função para limpar o campo de entrada
function clearInput() {
  document.getElementById('inputText').value = "";
  document.getElementById('password').value = "";
  document.getElementById('outputText').value = "";
}