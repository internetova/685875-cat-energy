var navToggle = document.querySelector('.toggle-menu');
var navMain = document.querySelector('.main-nav');

navToggle.classList.remove('toggle-menu--nojs');
navMain.classList.add('main-nav--closed');

navToggle.addEventListener('click', function () {
  if (navMain.classList.contains('main-nav--closed')) {
    navMain.classList.remove('main-nav--closed');
    navToggle.classList.add('toggle-menu--close');
  } else {
    navMain.classList.add('main-nav--closed');
    navToggle.classList.remove('toggle-menu--close');
  }
});
