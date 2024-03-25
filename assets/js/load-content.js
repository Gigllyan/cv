document.addEventListener("DOMContentLoaded", function() {
            var contents = document.querySelectorAll(".content");
            contents.forEach(function(content) {
                var url = content.getAttribute("data-src");
                loadContent(url, content);
            });
        });

        function loadContent(url, targetElement) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    if (url.endsWith(".txt")) {
                        // Se for um arquivo .txt, exiba o conteúdo como texto simples
                        targetElement.innerText = this.responseText;
                    } else {
                        // Caso contrário, exiba o conteúdo como HTML
                        targetElement.innerHTML = this.responseText;
                    }
                }
            };
            xhttp.open("GET", url, true);
            xhttp.send();
        }