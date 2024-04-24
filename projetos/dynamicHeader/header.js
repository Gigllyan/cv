// header.js
function loadHeader() {
  const headerHTML = fetch('header.html').then(response => response.text());
  return headerHTML;
}

function appendHeader(element) {
  const header = document.createElement('div');
  header.innerHTML = element;
  document.body.insertBefore(header, document.body.firstChild);
}

loadHeader().then(headerHTML => {
  appendHeader(headerHTML);
});