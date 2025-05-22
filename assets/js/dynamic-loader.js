// ==== dynamic-loader.js ====

function loadSection(sectionUrl, sectionId) {
    const targetElement = document.getElementById('main-content-area');
    if (!targetElement) {
        console.error('Main content area #main-content-area not found!');
        return;
    }

    if (typeof loadContent === 'function') {
        loadContent(sectionUrl, targetElement); // from load-content.js
        // Call initializers after loadContent completes.
        // loadContent uses XMLHttpRequest, so we need to hook into onreadystatechange
        // For simplicity here, we'll assume loadContent handles this, or we call them after a delay.
        // This is a limitation if loadContent doesn't have a callback.
        setTimeout(() => { // Simple delay; a callback in loadContent would be better
            if (typeof initializeSkillsModal === 'function') initializeSkillsModal();
            if (typeof applyScrollReveal === 'function') applyScrollReveal();
        }, 250);


    } else {
        console.error('loadContent function is not defined. Make sure load-content.js is loaded before dynamic-loader.js.');
        // Fallback basic fetch (less ideal as loadContent handles .txt files specifically)
        fetch(sectionUrl)
            .then(response => response.text())
            .then(html => {
                targetElement.innerHTML = html;
                if (typeof initializeSkillsModal === 'function') initializeSkillsModal();
                if (typeof applyScrollReveal === 'function') applyScrollReveal();
            })
            .catch(error => console.error('Error loading section with fetch:', error));
    }

    window.location.hash = sectionId;

    document.querySelectorAll('.nav__menu .nav__link').forEach(link => {
        link.classList.remove('active-link');
    });
    const activeNavLink = document.querySelector(`.nav__menu a[data-id="${sectionId}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active-link');
    }
}

function initializeSkillsModal() {
    var modal = document.getElementById("myModal");
    if (!modal) { /* console.log("Modal structure not found, skipping init."); */ return; }

    var span = modal.querySelector(".close");
    if (span && !span.getAttribute('data-initialized')) {
        span.onclick = function() { modal.style.display = "none"; }
        span.setAttribute('data-initialized', 'true');
    }

    var skillItems = document.querySelectorAll(".skills__data");
    skillItems.forEach(function(item) {
        if (item.getAttribute('data-modal-initialized')) return; // Skip if already initialized

        item.addEventListener("click", function() {
            var dados = this.getAttribute("data-dados");
            var titulo = this.querySelector(".skills__name").innerText;
            var modalContent = modal.querySelector("#modalContent");
            var modalTitle = modal.querySelector("#modalTitle");
            
            if (dados && modalContent && modalTitle) {
                dados = dados.replace(/\[a href='([^']*)' title='([^']*)'\]/g, "<a href='$1' title='$2'>");
                dados = dados.replace(/\[\/a\]/g, "</a>");
                modalContent.innerHTML = dados;
                modalTitle.innerText = titulo;
                modal.style.display = "block";
            }
        });
        item.setAttribute('data-modal-initialized', 'true');
    });

    // Ensure modal closes on window click (only add this listener once)
    if (!document.body.getAttribute('data-modal-window-click')) {
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
        document.body.setAttribute('data-modal-window-click', 'true');
    }
}

function applyScrollReveal() {
    if (typeof ScrollReveal !== 'function') { /* console.log("ScrollReveal not found, skipping init."); */ return; }
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2000,
        delay: 200,
        reset: true // Reset helps with dynamically loaded content
    });
    sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text',{}); 
    sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 400}); 
    sr.reveal('.home__social-icon',{ interval: 200}); 
    sr.reveal('.skills__data, .work__img, .contact__input, .contact__button',{interval: 200}); 
}

document.addEventListener('DOMContentLoaded', function() {
    let initialSectionId = window.location.hash.substring(1);
    let initialUrl = '';

    if (initialSectionId) {
        initialUrl = `assets/content/html/${initialSectionId}-section.html`;
    } else {
        const mainContentArea = document.getElementById('main-content-area');
        if (mainContentArea && mainContentArea.dataset.src) {
            initialUrl = mainContentArea.dataset.src; // Use data-src from index.html for default
            initialSectionId = initialUrl.substring(initialUrl.lastIndexOf('/') + 1).replace('-section.html', '');
        } else { // Fallback if data-src is also missing
            initialSectionId = 'home';
            initialUrl = 'assets/content/html/home-section.html';
        }
    }
    if (initialUrl) {
         loadSection(initialUrl, initialSectionId);
    } else {
        console.error("Could not determine initial section to load.");
    }
});
