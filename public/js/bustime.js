//-----------
// below two functions are used to get the URL parameters and load the content based on the URL parameter, so we can load different bustime views for styling in just one HTML file, this should not move over
//-----------

// Define the function to update collapsibles
function updateCollapsibles() {
  var collapsibles = document.querySelectorAll('.collapsible.open');
  collapsibles.forEach(function(collapsible) {
    var collapseContent = collapsible.querySelector('.collapse-content');
    if (collapseContent) {
      // Calculate the actual height of the collapse-content
      var actualHeight = collapseContent.scrollHeight;

      // Set the max-height for animation
      collapseContent.style.maxHeight = actualHeight + 'px';

      // Toggle tabindex of <a> or <button> elements within .collapse-content
      var innerTabbableItems = collapseContent.querySelectorAll('a[tabindex], button[tabindex]');
      innerTabbableItems.forEach(function(element) {
        var currentIndex = element.getAttribute('tabindex');
        element.setAttribute('tabindex', currentIndex === '0' ? '-1' : '0');
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {



  // have to do clicks this way so they work on objects added after the page loads

  // collapse trigger buttons open and close (for icon rotation) and content reveal/toggle
  document.addEventListener('click', function(event) {
    // Check if the clicked element or any of its ancestors have the class 'collapse-trigger'
    var collapseTrigger = event.target.closest('.collapse-trigger');
    if (collapseTrigger) {
        // Toggle the 'open' class
        collapseTrigger.classList.toggle('open');
        // console.log('caretToggle clicked');

        var parent = collapseTrigger.closest('.collapsible');
        // window.console.log(parent);
    
        if (parent) {
          parent.classList.toggle('open');
  
          var collapseContent = parent.querySelector('.collapse-content');
          if (collapseContent) {
            // Calculate the actual height of the collapse-content content
            var actualHeight = collapseContent.scrollHeight;
  
            // Clear the inline height style before setting a new height
            collapseContent.style.maxHeight = '';
  
            // Set the height property to achieve animation
            collapseContent.style.maxHeight = parent.classList.contains('open') ? actualHeight + 'px' : '0';
  
            // Toggle tabindex of <a> or <button> elements within .collapse-content
            var innerTabbableItems = collapseContent.querySelectorAll('a[tabindex], button[tabindex]');
            innerTabbableItems.forEach(function(element) {
              var currentIndex = element.getAttribute('tabindex');
              element.setAttribute('tabindex', currentIndex === '0' ? '-1' : '0');
            });
  
            // Set aria-expanded attribute
            collapseTrigger.setAttribute('aria-expanded', parent.classList.contains('open'));
          }
        }

    }
  });



  // all .close-popup-button buttons close their parent popup
  var popupCloseButtons = document.querySelectorAll('.close-popup-button');

  popupCloseButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var parent = this.closest('.map-popup');
      if (parent) {
        // add class to hide the popup
        parent.classList.add('hidden');
      }
    });
  });

 // its possible that its better to build this into react so i dont have to go so roundabout to get there?
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const sidebarContent = document.querySelector('.sidebar-content');
        const searchInstructions = document.querySelector('.search-instructions');
        var searchInstructionsHeight = '30'; // default height as defined in CSS 
        if (sidebarContent && searchInstructions) {
          sidebarContent.addEventListener('scroll', {
            handleEvent(event) {
              scrollTop = event.target.scrollTop;
              // window.console.log('boop ' + scrollTop);
              // check if amount sidebarContent is overflowed is more than searchInstructionsHeight
              // this avoids a weird jittery scroll jiggle if the sidebarContent is just barely overflowing
              overFlowAmount = sidebarContent.scrollHeight - sidebarContent.clientHeight;
              if (overFlowAmount > searchInstructionsHeight) {
                if (scrollTop <= searchInstructionsHeight) {
                  // set height to difference between scrolltop and searchInstructionsHeight
                  searchInstructions.style.height = (searchInstructionsHeight - scrollTop) + 'px';
                } else if (scrollTop > searchInstructionsHeight) {
                  searchInstructions.style.height = '0';
                } else {
                  searchInstructions.style.height = '';
                }
              }
            },
          });
          observer.disconnect(); // Stop observing once the element is found
          break;
        }
      }
    }
  });

  // Start observing the document body for childList changes
  observer.observe(document.body, { childList: true, subtree: true });


});
