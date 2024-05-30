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


  // map trigger open and close
  var mapToggle = document.getElementById('map-toggle');
  // var map = document.getElementById('map');
  var mapWrap = document.getElementById('map-wrap');

  mapToggle.addEventListener('click', function() {

    // window.console.log('mapToggle clicked');
    
    mapWrap.classList.toggle('open');

    mapToggle.setAttribute('aria-expanded', mapWrap.classList.contains('open'));
    mapToggle.setAttribute('aria-label', mapWrap.classList.contains('open') ? 'Toggle Map Visibility (currently visible)' : 'Toggle Map Visibility (currently hidden)');
    mapToggle.setAttribute('aria-pressed', mapWrap.classList.contains('open'));
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



});
