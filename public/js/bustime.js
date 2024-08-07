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
        var collapseContent = parent.querySelector('.collapse-content');
    
        if (parent && collapseContent) {

          // if the card is open
          if (parent.classList.contains('open')) {
            
            collapseContent.style.maxHeight = collapseContent.scrollHeight + 'px'; // Set maxHeight before collapsing
            setTimeout(() => {
              parent.classList.remove('open');
              collapseContent.style.maxHeight = '0'; // Collapse the content
            }, 10); // Small delay to trigger transition
            
          } 
          // if the card is closed
          else {

            parent.classList.add('open');
            collapseContent.style.maxHeight = collapseContent.scrollHeight + 'px'; // Allow it to expand
            setTimeout(() => {
              collapseContent.style.maxHeight = 'none'; // Reset to none to allow further expansion
            }, 500); // Timeout matches the transition duration

          }

          // Update aria-expanded attribute

          collapseTrigger.setAttribute('aria-expanded', parent.classList.contains('open'));

          // Toggle tabindex of <a> or <button> elements within .collapse-content
          var innerTabbableItems = collapseContent.querySelectorAll('a[tabindex], button[tabindex]');
          innerTabbableItems.forEach(function(element) {
            var currentIndex = element.getAttribute('tabindex');
            element.setAttribute('tabindex', currentIndex === '0' ? '-1' : '0');
          });
            
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

        // search instructions scrolling

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

          // Stop observing once the elements are found
          observer.disconnect(); 
          break;
        }

        

      }
    }
  });

  // Start observing the document body for childList changes
  observer.observe(document.body, { childList: true, subtree: true });


});