function checkGoogleTranslate() {
  const body = document.body;

  // Google Translate inserts an iframe when active
  const translateIframe = document.querySelector('.goog-te-banner-frame, .goog-te-menu-frame');

  if (translateIframe || document.documentElement.lang !== document.documentElement.getAttribute('original-lang')) {
      body.classList.add('google-translate-active');
  } else {
      body.classList.remove('google-translate-active');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Store the original language of the page
  document.documentElement.setAttribute('original-lang', document.documentElement.lang);
  checkGoogleTranslate();

  // ✅ Monitor changes in the `<html>` lang attribute
  const translateObserver = new MutationObserver(() => checkGoogleTranslate());
  translateObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // ✅ Monitor DOM changes for Google Translate injected elements
  const domTranslateObserver = new MutationObserver(() => checkGoogleTranslate());
  domTranslateObserver.observe(document.body, { childList: true, subtree: true });

  // Constants for animation
  const BASE_DURATION = 200; // Base duration in ms
  const HEIGHT_FACTOR = 0.5; // ms per pixel of height (adjust as needed)
  const MIN_DURATION = 150; // Minimum transition duration in ms
  const MAX_DURATION = 500; // Maximum transition duration in ms

  // window.console.log('boop test');

  // have to do clicks this way so they work on objects added after the page loads
  // collapse trigger buttons open and close (for icon rotation) and content reveal/toggle
  document.addEventListener('click', function(event) {
    // Check if the clicked element or any of its ancestors have the class 'collapse-trigger'
    var collapseTrigger = event.target.closest('.collapse-trigger');
    if (collapseTrigger) {
        // Toggle the 'open' class
        collapseTrigger.classList.toggle('open');
        // log.info('caretToggle clicked');

        var parent = collapseTrigger.closest('.collapsible');
        var collapseContent = parent.querySelector('.collapse-content');
        if (collapseContent) {
          var allInnerTabbableItems = collapseContent.querySelectorAll('a[tabindex], button[tabindex]');
          var allInnerCollapseTriggers = collapseContent.querySelectorAll('.collapse-trigger');

          // Calculate appropriate transition duration based on content height
          const contentHeight = collapseContent.scrollHeight;
          let transitionDuration = BASE_DURATION + (contentHeight * HEIGHT_FACTOR);
          transitionDuration = Math.max(MIN_DURATION, Math.min(transitionDuration, MAX_DURATION));

          // Apply the calculated duration
          collapseContent.style.transition = `max-height ${transitionDuration}ms ease`;

          // if the card is open, close it, adjust the max height, and tabindex of inner elements
          if (parent.classList.contains('open')) {
            // window.log.info('boop closing collapsible')
            collapseContent.style.maxHeight = collapseContent.scrollHeight + 'px';
            setTimeout(() => {
              parent.classList.remove('open');
              collapseContent.style.maxHeight = '0';
            }, 10);

            // set tabindex of all inner elements to -1
            allInnerTabbableItems.forEach(el => el.setAttribute('tabindex', '-1'));
          } else {
            // window.log.info('boop opening collapsible')
            collapseContent.style.maxHeight = collapseContent.scrollHeight + 'px';
            setTimeout(() => parent.classList.add('open'), 10);
            setTimeout(() => collapseContent.style.maxHeight = 'none', transitionDuration + 50);

            // if parent has class 'inner-card', set tabindex of all inner elements to 0
            if (parent.classList.contains('inner-card')) {
              allInnerTabbableItems.forEach(el => el.setAttribute('tabindex', '0'));
            } else if (parent.classList.contains('card')) {
              // allInnerTabbableItems that are a child of .card-menu
              var allInnerCardMenuItems = collapseContent.querySelectorAll('.card-menu a[tabindex], .card-menu button[tabindex]');
              allInnerCardMenuItems.forEach(el => el.setAttribute('tabindex', '0'));
              allInnerCollapseTriggers.forEach(el => el.setAttribute('tabindex', '0'));
            } else {
              allInnerTabbableItems.forEach(el => el.setAttribute('tabindex', '0'));
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

      // window.log.info('boop');
      // window.log.info(mapToggle);
      // window.log.info(mapWrap);

      if (mapWrap.classList) {
        mapWrap.classList.toggle('open');

        mapToggle.setAttribute('aria-expanded', mapWrap.classList.contains('open'));
        mapToggle.setAttribute('aria-label', mapWrap.classList.contains('open') ? 'Toggle Map Visibility (currently visible)' : 'Toggle Map Visibility (currently hidden)');
        mapToggle.setAttribute('aria-pressed', mapWrap.classList.contains('open'));
      }
    }

    // check if the clicked element or any of its ancestors have the class "cards-toggle"
    var cardsToggle = event.target.closest('.cards-toggle');
    if (cardsToggle) {
      // window.console.log('boop' + cardsToggle);
      // get data-target
      var cardsToggleTarget = cardsToggle.getAttribute('data-target');
      // window.console.log('boop ' + cardsToggleTarget);
      // find .toggle-cards with class matching cardsToggleTarget
      var toggleCardsTarget = document.querySelector('.toggle-cards.' + cardsToggleTarget);
      // add class hide to all toggle-cards that are not toggleCardsTarget, remove class hide from toggleCardsTarget, adjust aria- attributes
      var allToggleCards = document.querySelectorAll('.toggle-cards');
      allToggleCards.forEach(function(element) {
        if (element !== toggleCardsTarget) {
          element.classList.add('hide');
          element.setAttribute('aria-hidden', 'true');
        } else {
          element.classList.remove('hide');
          element.setAttribute('aria-hidden', 'false');
        }
      });
      // add class active to clicked cardsToggle, remove class active from all other cardsToggle, adjust aria- attributes
      var allCardsToggle = document.querySelectorAll('.cards-toggle');
      allCardsToggle.forEach(function(element) {
        if (element !== cardsToggle) {
          element.classList.remove('active');
          element.setAttribute('aria-pressed', 'false');
          element.setAttribute('aria-label', 'Show nearby ' + element.getAttribute('data-target') + ' (currently hidden)');
          element.setAttribute('aria-expanded', 'false');
        } else {
          element.classList.add('active');
          element.setAttribute('aria-pressed', 'true');
          element.setAttribute('aria-label', 'Show nearby ' + element.getAttribute('data-target') + ' (currently visible)');
          element.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // search instructions scrolling
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const sidebarContent = document.querySelector('.sidebar-content');
        const searchInstructions = document.querySelector('.search-instructions');
        const searchInstructionsHeight = 30; // default height as defined in CSS

        if (sidebarContent && searchInstructions) {
          sidebarContent.addEventListener('scroll', {
            handleEvent(event) {
              const scrollTop = event.target.scrollTop;
              const overFlowAmount = sidebarContent.scrollHeight - sidebarContent.clientHeight;

              if (overFlowAmount > searchInstructionsHeight) {
                if (scrollTop <= searchInstructionsHeight) {
                  searchInstructions.style.height = (searchInstructionsHeight - scrollTop) + 'px';
                } else {
                  searchInstructions.style.height = '0';
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
  observer.observe(document.body, { childList: true, subtree: true });

  var tocToggle = document.getElementById('toc-toggle');

  // function to toggle tabbable elements in toc specifically
  function toggleToc(toc, open) {
    var tabbableElements = toc.querySelectorAll('a[tabindex], button[tabindex]');
    tabbableElements.forEach(function(element) {
      element.setAttribute('tabindex', open ? '0' : '-1');
    });
    // adjust aria attributes of toc-toggle and toc
    tocToggle.setAttribute('aria-expanded', open);
    tocToggle.setAttribute('aria-label', open ? 'Toggle Table of Contents (currently visible)' : 'Toggle Table of Contents (currently hidden)');
    tocToggle.setAttribute('aria-pressed', open);
    toc.setAttribute('aria-hidden', !open);
  }

  // toc-toggle open and close
  if (tocToggle) {
    // click toggle button to open and close the table of contents
    tocToggle.addEventListener('click', function() {
      var toc = document.getElementById('toc');
      if (toc) {
        toc.classList.toggle('open');
        toggleToc(toc, toc.classList.contains('open'));
      }
    });

    // if screen is less than 600px
    if (window.matchMedia('(max-width: 600px)').matches) {
      toggleToc(toc, false);
      tocToggle.setAttribute('aria-hidden', 'false');
    }

    // if screen is resized to less than 600px
    window.addEventListener('resize', function() {
      if (window.matchMedia('(max-width: 600px)').matches) {
        // mobile toc
        toggleToc(toc, false);
        tocToggle.setAttribute('aria-hidden', 'false');
      } else {
        // desktop toc
        toggleToc(toc, true);
        tocToggle.setAttribute('aria-hidden', 'true');
      }
    });
  }
});
