//parallax scrolling
let text = document.getElementById('text');
let text2 = document.getElementById('text2');
let back1 = document.getElementById('back1');
let back2 = document.getElementById('back2');
let back3 = document.getElementById('back3');
var body = document.body;
var height = Math.max(body.scrollHeight, body.offsetHeight);
var width= Math.max(body.scrollWidth, body.offsetWidth);

window.addEventListener('scroll', () => {
  const value = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  text.style.marginTop = Math.min(value * 2.5, window.outerHeight)+ 'px';
  text2.style.marginTop = Math.min(value * 2.5, window.outerHeight) + 'px';
  back1.style.left = Math.min(value * 2.5, width) + 'px';
  back2.style.left = Math.min(value * -1.5, width) + 'px';
  back3.style.top = Math.min(value * 2.5, maxScroll) + 'px';
});

//studio ghibli side animations
let back4 = document.getElementById('bg');
let back5 = document.getElementById('bg2');
window.addEventListener('scroll', () => {
  const value = window.scrollY;
  back5.style.top = Math.min(value * 0.5, height) + 'px';
  back4.style.top = Math.min(value * 0.5, height) + 'px';
});

//navbar shrinking animation
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navigation");
  const collapsed = document.getElementById("collapsed-nav");

  if (window.scrollY > 100) {
    nav.classList.add("nav-shrunk");
    collapsed.style.display = "block";
  } else {
    nav.classList.remove("nav-shrunk");
    collapsed.style.display = "none";
  }
});

//returns to top when shrunk navbar clicked on
document.getElementById("collapsed-nav").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


//navbar hovering smooth background animation
const hoverBg = document.querySelector('.nav-hover-bg');
const navLinks = document.querySelectorAll('.header-link');
const navLinksContainer = document.querySelector('.nav-links');

navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    const linkRect = link.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();
    
    const offsetLeft = linkRect.left - containerRect.left;
    const width = linkRect.width;

    hoverBg.style.left = `${offsetLeft}px`;
    hoverBg.style.width = `${width}px`;
  });
});

navLinksContainer.addEventListener('mouseleave', () => {
  hoverBg.style.width = '0px';
});

//toggle mobile nav
document.getElementById("collapsed-nav").addEventListener("click", function () {
  document.querySelector("nav.navigation").classList.toggle("active");
});

document.querySelectorAll('.list-item.pics p').forEach(p => {
  const imgDiv = p.closest('.list-item').querySelector('.hover-img');
  p.addEventListener('mouseenter', () => {
    imgDiv.style.backgroundImage = `url(${p.dataset.img})`;
    imgDiv.style.opacity = 1;
  });
  p.addEventListener('mouseleave', () => {
    imgDiv.style.opacity = 0;
  });
});