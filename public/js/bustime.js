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
        var allInnerTabbableItems = collapseContent.querySelectorAll('a[tabindex], button[tabindex]');
        // only the inner tabbable items that are children of a .collapse-content that is a direct child of parent
        var openParentTabbableItems = Array.from(allInnerTabbableItems).filter(function(element) {
          if (element.closest('.collapsible').classList.contains('open')) {
            return element;
          }
        });
        var allInnerCollapseTriggers = collapseContent.querySelectorAll('.collapse-trigger');
    
        if (parent && collapseContent) {

          // if the card is open, close it, adjust the max height, and tabindex of inner elements
          if (parent.classList.contains('open')) {

            // window.console.log('boop closing collapsible')
            
            collapseContent.style.maxHeight = collapseContent.scrollHeight + 'px'; // Set maxHeight before collapsing

            setTimeout(() => {
              parent.classList.remove('open');
              collapseContent.style.maxHeight = '0'; // Collapse the content
            }, 10); // Small delay to trigger transition

            // set tabindex of all inner elements to -1
            allInnerTabbableItems.forEach(function(element) {
              element.setAttribute('tabindex', '-1');
            });
            
          } 
          // if the card is closed, open it, adjust the max height, and tabindex of inner elements 
          else {

            // window.console.log('boop opening collapsible')

            // Set maxHeight to actual height before expanding
            collapseContent.style.maxHeight = collapseContent.scrollHeight + 'px'; // Allow it to expand

            // Add class to parent to trigger transition
            setTimeout(() => {
              parent.classList.add('open');
            }, 10); // Small delay to trigger transition
            
            // Set maxHeight back to none after transition
            setTimeout(() => {
              collapseContent.style.maxHeight = 'none'; // Reset to none to allow further expansion
            }, 500); // Timeout matches the transition duration

            // if parent has class 'inner-card', set tabindex of all inner elements to 0
            if (parent.classList.contains('inner-card')) {
              allInnerTabbableItems.forEach(function(element) {
                element.setAttribute('tabindex', '0');
              });
            }
            // else if parent has class 'card', set tabindex of all inner elements whose closest parent .collapsible has class .open to 0, and set tabindex of all inner collapse triggers to 0
            else if (parent.classList.contains('card')) {
              openParentTabbableItems.forEach(function(element) {
                element.setAttribute('tabindex', '0');
              });
              allInnerCollapseTriggers.forEach(function(element) {
                element.setAttribute('tabindex', '0');
              });
            }

          }

          // Update aria-expanded attribute

          collapseTrigger.setAttribute('aria-expanded', parent.classList.contains('open'));
            
        }

    }

    // Check if the clicked element or any of its ancestrs have the id 'map-toggle'

    // map trigger open and close
    var mapToggle = event.target.closest('#map-toggle');
    if (mapToggle) {
      
      // map trigger closest parent with class 'map-wrap'
      var mapWrap = mapToggle.closest('#map-wrap');
      
      window.console.log('boop');
      window.console.log(mapToggle);
      window.console.log(mapWrap);
      
      mapWrap.classList.toggle('open');

      mapToggle.setAttribute('aria-expanded', mapWrap.classList.contains('open'));
      mapToggle.setAttribute('aria-label', mapWrap.classList.contains('open') ? 'Toggle Map Visibility (currently visible)' : 'Toggle Map Visibility (currently hidden)');
      mapToggle.setAttribute('aria-pressed', mapWrap.classList.contains('open'));
    }


  });





  // all .close-popup-button buttons close their parent popup
  // var popupCloseButtons = document.querySelectorAll('.close-popup-button');

  // popupCloseButtons.forEach(function(button) {
  //   button.addEventListener('click', function() {
  //     var parent = this.closest('.map-popup');
  //     if (parent) {
  //       // add class to hide the popup
  //       parent.classList.add('hidden');
  //     }
  //   });
  // });

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