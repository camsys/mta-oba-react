// Define the function to update collapsibles
function updateCollapsibles(collapsibles) {
  // var collapsibles = document.querySelectorAll('.collapsible.open');
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

// update collapsibles
var collapsibles = document.querySelectorAll('.collapsible.open');
updateCollapsibles(collapsibles);