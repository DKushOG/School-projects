// animations for the progress donuts
function setProgress(circle, percent) {
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

// set percentages for each skill
const codingCircle = document.querySelector('.skill1 .progress-ring__circle');
setProgress(codingCircle, 95);

const uxCircle = document.querySelector('.skill2 .progress-ring__circle');
setProgress(uxCircle, 75);

const engineeringCircle = document.querySelector('.skill3 .progress-ring__circle');
setProgress(engineeringCircle, 100);