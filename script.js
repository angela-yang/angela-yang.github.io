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



// Image Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <button class="modal-nav modal-prev">&#8249;</button>
            <button class="modal-nav modal-next">&#8250;</button>
            <img class="modal-image" src="" alt="">
        </div>
    `;
    document.body.appendChild(modal);

    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const modalContent = modal.querySelector('.modal-content');
    const modalImage = modal.querySelector('.modal-image');
    const closeBtn = modal.querySelector('.modal-close');
    const prevBtn = modal.querySelector('.modal-prev');
    const nextBtn = modal.querySelector('.modal-next');

    let currentImageIndex = -1;
    let imageArray = [];
    let isArtGallery = false;

    function openModal(imgSrc, clickedElement, imageList = null) {
        modalImage.src = imgSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (imageList) {
            isArtGallery = true;
            imageArray = imageList;
            currentImageIndex = Array.from(imageList).findIndex(img => img.src === imgSrc);
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            updateNavButtons();
        } else {
            isArtGallery = false;
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        const rect = clickedElement.getBoundingClientRect();
        modalContent.style.transformOrigin = `${rect.left + rect.width/2}px ${rect.top + rect.height/2}px`;
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentImageIndex = -1;
        imageArray = [];
        isArtGallery = false;
    }

    function showNextImage() {
        if (!isArtGallery || currentImageIndex === -1) return;
        
        currentImageIndex = (currentImageIndex + 1) % imageArray.length;
        modalImage.classList.add('image-transition');
        
        setTimeout(() => {
            modalImage.src = imageArray[currentImageIndex].src;
            modalImage.classList.remove('image-transition');
            updateNavButtons();
        }, 150);
    }

    function showPrevImage() {
        if (!isArtGallery || currentImageIndex === -1) return;
        
        currentImageIndex = (currentImageIndex - 1 + imageArray.length) % imageArray.length;
        modalImage.classList.add('image-transition');
        
        setTimeout(() => {
            modalImage.src = imageArray[currentImageIndex].src;
            modalImage.classList.remove('image-transition');
            updateNavButtons();
        }, 150);
    }

    function updateNavButtons() {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }

    const artImages = document.querySelectorAll('.a-pic');
    artImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(this.src, this, artImages);
        });
    });

    const portrait = document.querySelector('#portrait');
    if (portrait) {
        portrait.style.cursor = 'pointer';
        portrait.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(this.src, this, null);
        });
    }

    // Close modal on X button click
    closeBtn.addEventListener('click', closeModal);

    // Close modal on backdrop click
    modalBackdrop.addEventListener('click', closeModal);

    // Navigation button clicks
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showPrevImage();
    });

    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showNextImage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowRight' && isArtGallery) {
            showNextImage();
        } else if (e.key === 'ArrowLeft' && isArtGallery) {
            showPrevImage();
        }
    });

    // Prevent closing when clicking on the image itself
    modalImage.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Bubbles!
    const container = document.getElementById('bubble-container');
    document.addEventListener('mousemove', (e) => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 5px and 15px
        const size = Math.random() * 10 + 5;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // Position at cursor
        bubble.style.left = e.clientX - size / 2 + 'px';
        bubble.style.top = e.clientY - size / 2 + 'px';
        
        container.appendChild(bubble);
        
        // Remove bubble after animation completes
        setTimeout(() => {
            bubble.remove();
        }, 1000);
    });
});