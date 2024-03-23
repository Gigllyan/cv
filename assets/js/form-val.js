
    function validarFormulario() {
  var nome = document.forms["contactForm"]["nome"].value;
  var email = document.forms["contactForm"]["email"].value;
  var telefone = document.forms["contactForm"]["telefone"].value;
  var assunto = document.forms["contactForm"]["assunto"].value;
  var mensagem = document.forms["contactForm"]["mensagem"].value;
var mensagemResumida = mensagem.length > 20 ? mensagem.substring(0, 60) + "(...)" : mensagem;
  
  var camposNaoPreenchidos = [];
  if (nome == "") {
    camposNaoPreenchidos.push("Nome");
    document.forms["contactForm"]["nome"].classList.add("required");
  } else {
    document.forms["contactForm"]["nome"].classList.remove("required");
  } 
  
  // Validar email
  if (email != "" && !isValidEmail(email)) {
    alert("Por favor, insira um email válido.");
    document.forms["contactForm"]["email"].classList.add("required");
    return false;
  } else {
    document.forms["contactForm"]["email"].classList.remove("required");
  }
  
  // Validar telefone
  if (telefone != "" && telefone.length < 14) {
    camposNaoPreenchidos.push("Telefone (mínimo 10 caracteres)");
    document.forms["contactForm"]["telefone"].classList.add("required");
  } else {
    document.forms["contactForm"]["telefone"].classList.remove("required");
  }

  // Verificar se pelo menos um dos campos (telefone ou email) foi preenchido
  if (email == "" && telefone == "") {
    camposNaoPreenchidos.push("Email ou Telefone");
    document.forms["contactForm"]["email"].classList.add("required");
    document.forms["contactForm"]["telefone"].classList.add("required");
  }

  if (mensagem == "") {
    camposNaoPreenchidos.push("Mensagem");
    document.forms["contactForm"]["mensagem"].classList.add("required");
  } else {
    document.forms["contactForm"]["mensagem"].classList.remove("required");
  } 

  if (camposNaoPreenchidos.length > 0) {
    alert("Por favor, os campos são obrigatórios:\n" + camposNaoPreenchidos.join("\n"));
    return false;
  }

var confirmacao = confirm("Tem certeza que deseja enviar o email?\n\n("+nome+"  - "+telefone+" - "+email+")\n\nAssunto: "+assunto+"\nMensagem: "+mensagemResumida);
if (!confirmacao) {
  return false;
}
  // Validação adicional, se necessário
  else {
    alert("Enviando e-mail... \n \n Dados ("+nome+" - "+telefone+" - "+email+")\nAssunto: "+assunto+"\nMensagem: "+mensagemResumida);
  }

  return true;
}

// Função para limpar o campo de entrada
function clearInput() {
  document.forms["contactForm"]["nome"].value = "";
  document.forms["contactForm"]["email"].value = "";
  document.forms["contactForm"]["telefone"].value = ""; 
  document.forms["contactForm"]["assunto"].value = "";
  document.forms["contactForm"]["mensagem"].value = "";
}

// Função para validar o formato do email
function isValidEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}



