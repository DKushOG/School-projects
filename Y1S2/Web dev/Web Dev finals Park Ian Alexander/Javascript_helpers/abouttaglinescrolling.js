document.addEventListener('DOMContentLoaded', function() {
    // function to add 'show' class to elements that are in view
    function handleScroll(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target); // stop observing after it has been shown
            }
        });
    }

    // create an IntersectionObserver instance
    const observer = new IntersectionObserver(handleScroll, {
        root: null, // Use the viewport as the root
        threshold: 0.9 // Trigger when 90% of the element is visible
    });

    // select all elements with the 'fade-in' class
    const fadeInTaglineleft = document.querySelectorAll('.taganim-left');
    const fadeInTaglineright = document.querySelectorAll('.taganim-right');
    const fadeInTaglinetop = document.querySelectorAll('.taganim-top');

    // observe each element
    fadeInTaglineleft.forEach(element => {
        observer.observe(element);
    });

    fadeInTaglineright.forEach(element => {
        observer.observe(element);
    });

    fadeInTaglinetop.forEach(element => {
        observer.observe(element);
    });


});
