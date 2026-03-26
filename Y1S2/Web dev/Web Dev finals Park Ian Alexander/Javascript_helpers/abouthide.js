document.addEventListener('DOMContentLoaded', () => {
    const aboutCircle = document.querySelector('.about-circle');
    const blades = document.querySelectorAll('.blade');

    // function to show blades
    function showBlades() {
        blades.forEach(blade => blade.classList.add('show'));
    }

    // event listeners
    aboutCircle.addEventListener('mouseover', showBlades);
});