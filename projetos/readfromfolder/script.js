// Get the folder path
const folderPath = 'files';

// Get the file list
const files = [];
fetch(folderPath)
  .then(response => response.json())
  .then(data => {
    files = data;
    const fileList = document.getElementById('file-list');
    files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file.name;
      fileList.appendChild(li);
    });
  });

// Read the contents of each file
files.forEach(file => {
  const fileReader = new FileReader();
  fileReader.onload = event => {
    const fileContent = event.target.result;
    // Do something with the file content
    console.log(fileContent);
  };
  fileReader.readAsText(file);
});
