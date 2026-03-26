// event listerns to play fade in animation upon loading content
// index page
document.addEventListener("DOMContentLoaded", function() {
    const indexContent = document.getElementById('index');
    indexContent.classList.add('appear');
});
// about page
document.addEventListener("DOMContentLoaded", function() {
    const aboutmeContent = document.getElementById('aboutme');
    aboutmeContent.classList.add('appear');
});
// media page
document.addEventListener("DOMContentLoaded", function() {
    const mediaContent = document.getElementById('projectMedia');
    mediaContent.classList.add('appear');
});
// personal page
document.addEventListener("DOMContentLoaded", function() {
    const personalContent = document.getElementById('personal');
    personalContent.classList.add('appear');
});
// contact page
document.addEventListener("DOMContentLoaded", function() {
    const contactContent = document.getElementById('contact-content');
    contactContent.classList.add('appear');
});