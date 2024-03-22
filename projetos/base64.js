
function encodeOrDecode() {
  var inputText = document.getElementById('inputText').value;
  var outputText = document.getElementById('outputText');

  if (isBase64(inputText)) {
    // Remover a sentença "eval(atob("Resultado"));" se estiver decodificando
    outputText.value = removeEval(inputText);
  } else {
    // Adicionar o resultado dentro da sentença "eval(atob("Resultado"));" se estiver codificando
    outputText.value = addEval(inputText);
  }
}

function isBase64(str) {
  try {
    return btoa(atob(str)) == str;
  } catch (err) {
    return false;
  }
}

function addEval(str) {
  return 'eval(atob("' + btoa(str) + '"));';
}

function removeEval(str) {
  // Verificar se a sentença "eval(atob("Resultado"));" está presente e remover
  var result = atob(str);
  var evalIndex = result.indexOf('eval(atob("');
  if (evalIndex !== -1) {
    result = result.substring(evalIndex + 'eval(atob("'.length, result.length - '"));'.length);
  }
  return result;
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