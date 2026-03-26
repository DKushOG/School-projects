//controls for playback button and blockmidhighlow
function ControlsAndInput() {
    this.menuDisplayed = false;
    this.menuElement = document.getElementById('visualisationMenu');
    this.promptElement = document.getElementById('promptText');
  
    //create new objects for gui
    this.blockbutton = new BlockMidHighLow();
  
    //display visualisation choose menu
    this.keyPressed = function (keycode, event) {
      // Prevent default action for spacebar
      if (keycode === 32) {
        event.preventDefault();
        this.menuDisplayed = !this.menuDisplayed;
        this.updateMenuDisplay();
        return; // Exit the function early
      }
  
      // Handling number keys for visualization
      if (keycode > 48 && keycode < 58) {
        var visNumber = keycode - 49;
        vis.selectVisual(vis.visuals[visNumber].name);
      }
    };
  
    //draw the menu and playback button
    this.draw = function () {
      push();
      fill("white");
      stroke("black");
      strokeWeight(2);
      textSize(34);
  
      pop();
    };
  
    //update menu display
    this.updateMenuDisplay = function () {
      if (this.menuDisplayed) {
        this.menuElement.style.display = 'block';
        this.promptElement.style.display = 'none'; // Hide the prompt
        this.populateMenu();
      } else {
        this.menuElement.style.display = 'none';
        this.promptElement.style.display = 'block'; // Show the prompt
      }
    };
  
    //populate the menu with visualization options
    this.populateMenu = function () {
      var ul = this.menuElement.querySelector('ul');
      ul.innerHTML = ''; // Clear previous items
      vis.visuals.forEach((visual, index) => {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#'; // Prevent default link behavior
        a.textContent = (index + 1) + ': ' + visual.name;
        a.addEventListener('click', () => {
          vis.selectVisual(visual.name);
          this.menuDisplayed = false;
          this.updateMenuDisplay();
        });
        li.appendChild(a);
        ul.appendChild(li);
      });
    };
  }
  