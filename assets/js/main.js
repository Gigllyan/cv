/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
//     reset: true
});

sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text',{}); 
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 400}); 
sr.reveal('.home__social-icon',{ interval: 200}); 
sr.reveal('.skills__data, .work__img, .contact__input, .contact__button',{interval: 200}); 








// Get the modal



// Get the modal
// Get all elements with class "skills__data"
var skillItems = document.querySelectorAll(".skills__data");

// Loop through each skill item
skillItems.forEach(function(item) {
  // Add click event listener to each skill item
  item.addEventListener("click", function() {
    // Get data from the data attribute
    var dados = this.getAttribute("data-dados");
    var titulo = this.querySelector(".skills__name").innerText;
    var modalContent = document.getElementById("modalContent");
    var modalTitle = document.getElementById("modalTitle");

    // Replace [a] with <a> and [/a] with </a> in the content
    dados = dados.replace(/\[a href='([^']*)' title='([^']*)'\]/g, "<a href='$1' title='$2'>");
    dados = dados.replace(/\[\/a\]/g, "</a>");

    // Set modal content dynamically
    modalContent.innerHTML = dados;
    modalTitle.innerText = titulo;

    // Display the modal
    modal.style.display = "block";
  });
});
// Get all elements with class "skills__data"
var skillItems = document.querySelectorAll(".skills__data");

// Loop through each skill item
skillItems.forEach(function(item) {
  // Add click event listener to each skill item
  item.addEventListener("click", function() {
    // Get data from the data attribute
    var dados = this.getAttribute("data-dados");
    var titulo = this.querySelector(".skills__name").innerText;
    var modalContent = document.getElementById("modalContent");
    var modalTitle = document.getElementById("modalTitle");

    // Replace [a] with <a> and [/a] with </a> in the content
    dados = dados.replace(/\[a href='([^']*)' title='([^']*)'\]/g, "<a href='$1' title='$2'>");
    dados = dados.replace(/\[\/a\]/g, "</a>");

    // Set modal content dynamically
    modalContent.innerHTML = dados;
    modalTitle.innerText = titulo;

    // Display the modal
    modal.style.display = "block";
  });
});