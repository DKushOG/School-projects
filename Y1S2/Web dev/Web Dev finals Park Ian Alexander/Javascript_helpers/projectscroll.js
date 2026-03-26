document.addEventListener('DOMContentLoaded', function() {
    // function to add 'show' class to elements that are in view
    function handleScroll(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target); // Stop observing after it has been shown
            }
        });
    }

    // create an IntersectionObserver instance
    const observer = new IntersectionObserver(handleScroll, {
        root: null, // Use the viewport as the root
        threshold: 0.8 // Trigger when 10% of the element is visible
    });

    // select all elements with the 'fade-in' class
    const fadeInElementsleft = document.querySelectorAll('.fade-in-left');
    const fadeInElementsright = document.querySelectorAll('.fade-in-right');
    const fadeInElementstop = document.querySelectorAll('.fade-in-top');
    const fadeInElementsbtm = document.querySelectorAll('.fade-in-btm');

    // scroll observers for each element
    fadeInElementsleft.forEach(element => {
        observer.observe(element);
    });

    fadeInElementsright.forEach(element => {
        observer.observe(element);
    });

    fadeInElementstop.forEach(element => {
        observer.observe(element);
    });

    fadeInElementsbtm.forEach(element => {
        observer.observe(element);
    });
});