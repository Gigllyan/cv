document.getElementById('imagemInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const base64Image = event.target.result;
    const imagemConvertidaDiv = document.getElementById('imagemConvertida');

    // Criar elemento de imagem e definir base64 como src
    const img = document.createElement('img');
    img.src = base64Image;

    // Criar link e definir o src da imagem como href
    const link = document.createElement('a');
    link.href = img.src;
    link.appendChild(img);

    // Criar botão de exclusão
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.addEventListener('click', function() {
      imagemConvertidaDiv.removeChild(link);
    });

    // Criar botão de cópia do link
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copiar link';
    copyButton.addEventListener('click', function() {
      const input = document.createElement('input');
      input.value = img.src;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Link copiado com sucesso!');
    });

    // Adicionar botões à div
    const buttonsDiv = document.createElement('div');
    buttonsDiv.appendChild(deleteButton);
    buttonsDiv.appendChild(copyButton);
    link.appendChild(buttonsDiv);

    // Adicionar link à div
    imagemConvertidaDiv.appendChild(link);
    alert(base64Image);
    console.log("added img: " + base64Image);
  };

  // Ler o arquivo como base64
  reader.readAsDataURL(file);
});