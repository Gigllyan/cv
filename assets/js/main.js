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
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

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

async function loadProjects() {
  const workContainer = document.querySelector('.work__container');
  try {
    const response = await fetch('assets/js/projects.js');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const projects = await response.json();

    projects.forEach(project => {
      const projectElement = `
        <div class="work__item">
          <a href="${project.project_url}" target="_blank" class="work__img">
            <img src="${project.image_url}" alt="${project.title}">
            <b>${project.title}</b>
          </a>
          <p class="work__description">${project.description}</p>
        </div>
      `;
      workContainer.innerHTML += projectElement;
    });
  } catch (error) {
    console.error('Failed to load projects:', error);
    workContainer.innerHTML = '<p class="error-message">Failed to load projects.</p>';
  }
}

loadProjects();

async function loadExperiences() {
  const experienceContainer = document.querySelector('.experience__container');
  try {
    const response = await fetch('assets/js/experiences.js');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const experiences = await response.json();

    experiences.forEach(experience => {
      const experienceElement = `
        <div class="experience__item">
          <h3 class="experience__title">${experience.title}</h3>
          <p class="experience__company">${experience.company} (${experience.duration})</p>
          <p class="experience__description">${experience.description}</p>
        </div>
      `;
      experienceContainer.innerHTML += experienceElement;
    });
  } catch (error) {
    console.error('Failed to load experiences:', error);
    experienceContainer.innerHTML = '<p class="error-message">Failed to load experiences.</p>';
  }
}

loadExperiences();