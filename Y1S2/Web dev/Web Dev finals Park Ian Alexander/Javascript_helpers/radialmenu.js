document.addEventListener('DOMContentLoaded', function() {
    const blades = document.querySelectorAll('.blade');
    const descriptionBox = document.querySelector('.description-box');
    
    
    // handle Clicks on Blade
    blades.forEach((blade, index) => {
        blade.addEventListener('click', function() {
            let content = '';
            // fill content for description box
            switch(index) {
                case 0:
                    content = `
                        <h3>Personal</h3>
                        <p>Hello! I'm Ian Alexander Park, a Computer Scientist based in Singapore.</p>
                        <p>With 8 years of experience in Computer Science, I have developed expertise in AI and Machine Learning.</p>
                    `;
                    break;
                case 1:
                    content = `
                        <h3>Hermes Drones</h3>
                        <p>I am the project lead behind the automated Hermes delivery drones, showcasing excellence in AI and aeronautical robotics.</p>
                        <p>Our drones have revolutionized logistics and delivery systems worldwide.</p>
                    `;
                    break;
                case 2:
                    content = `
                        <h3>Education Background</h3>
                        <p>I hold a Diploma in Aeronautical Engineering from Singapore Polytechnic and an Honours Degree in Computer Science from UOL, Singapore Institute of Management.</p>
                    `;
                    break;
                case 3:
                    content = `
                        <h3>Skills</h3>
                        <ul>
                            <li>Artificial Intelligence & Machine Learning</li>
                            <li>Automated Aeronautical Robotics</li>
                            <li>Project Management</li>
                        </ul>
                    `;
                    break;
            }
            descriptionBox.innerHTML = content;
           // fade in the description box
           descriptionBox.classList.remove('show');
           void descriptionBox.offsetWidth; //trigger animations again after clicking a different blade
           descriptionBox.classList.add('show');
        });
    });
});