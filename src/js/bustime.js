//-----------
// below two functions are used to get the URL parameters and load the content based on the URL parameter, so we can load different bustime views for styling in just one HTML file, this should not move over
//-----------

function loadContent() {
  const urlParams = getUrlParams();
  let content = urlParams['content'];

  // If content parameter is not specified, default to "home"
  if (!content) {
    content = "home";
  }

  // Use AJAX to fetch content from HTML file
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Inject fetched content into the #app div
        document.getElementById('app').innerHTML = xhr.responseText;

        // Call the function to update collapsibles after content injection
        updateCollapsibles();
      } else {
        console.error('Failed to fetch content');
      }
    }
  };

  // Fetch HTML file from the content directory based on URL parameter
  xhr.open('GET', 'content/' + content + '.html', true);
  xhr.send();

  // Set value of #search-input to the search parameter
  const searchParam = urlParams['search'];
  if (searchParam) {
    document.getElementById('search-input').value = searchParam;
  }

  // Display refresh button if the param exists
  const refresh = urlParams['refresh'];
  if (refresh) {
    // Get all .refresh-buttons and add class show
    const refreshButtons = document.querySelectorAll('.refresh-button');
    refreshButtons.forEach(button => {
      button.classList.add('show');
    });
  }

  // Display vehicle popup if param exists
  const vehiclePopup = urlParams['vehicle-popup'];
  if (vehiclePopup) {
    document.getElementById('vehicle-popup').style.display = 'block';
  }
}

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

  // Load content based on URL parameter, so we can load different bustime views for styling in just one HTML file, this should not move over
  loadContent();


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
