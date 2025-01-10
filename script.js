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
  text.style.marginTop = Math.min(value * 2.5, window.outerHeight)+ 'px';
  text2.style.marginTop = Math.min(value * 2.5, window.outerHeight) + 'px';
  back1.style.left = Math.min(value * 2.5, width) + 'px';
  back2.style.left = Math.min(value * -1.5, width) + 'px';
  back3.style.top = Math.min(value * 2.5, height) + 'px';
});

window.addEventListener('scroll', function () {
  var textBox1 = document.getElementById('text-container');
  var textBox2 = document.getElementById('textcontainer2');
  var triggerPoint1 = textBox1.offsetTop - window.innerHeight + textBox1.offsetHeight;
  var triggerPoint2 = textBox2.offsetTop - window.innerHeight + textBox2.offsetHeight;

  if (window.scrollY >= triggerPoint1) {
    textBox1.classList.add('animate');
  }

  if (window.scrollY >= triggerPoint2) {
    textBox2.classList.add('animate');
  }
});



let back4 = document.getElementById('bg');
let back5 = document.getElementById('bg2');
window.addEventListener('scroll', () => {
  const value = window.scrollY;
  back5.style.top = Math.min(value * 0.5, height) + 'px';
  back4.style.top = Math.min(value * 0.5, height) + 'px';
});