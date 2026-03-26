// function for the dropdown menu in the header
document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navItems = document.querySelector(".nav-items");

    menuToggle.addEventListener("click", function() {
        navItems.classList.toggle("show");
    });
});

