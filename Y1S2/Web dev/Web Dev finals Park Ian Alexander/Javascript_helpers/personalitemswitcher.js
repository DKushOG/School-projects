// funtion to switch the personal content containers on button click
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('toggleButton');
    const projectItem1 = document.querySelector('.project-item1');
    const projectItem2 = document.querySelector('.project-item2');
    // click event listener
    button.addEventListener('click', function() {
        // detect which project element is being shown and hide as necessary
        if (projectItem1.style.display === 'none') {
            projectItem1.style.display = 'block';
            projectItem1.style.animation = 'fadeIn 2s';
            projectItem2.style.display = 'none';
        } 
        else {
            projectItem1.style.display = 'none';
            projectItem2.style.display = 'block';
            projectItem2.style.animation = 'fadeIn 2s';
        }
    });
});