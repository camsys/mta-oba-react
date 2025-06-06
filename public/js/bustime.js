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

  // window.console.log('boop test');

  // Store the original language of the page
  document.documentElement.setAttribute('original-lang', document.documentElement.lang);
  checkGoogleTranslate();

  // ✅ Monitor changes in the `<html>` lang attribute (Google Translate modifies it)
  const translateObserver = new MutationObserver(() => checkGoogleTranslate());
  translateObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // ✅ Monitor DOM changes in case Google injects elements
  const domTranslateObserver = new MutationObserver(() => checkGoogleTranslate());
  domTranslateObserver.observe(document.body, { childList: true, subtree: true });

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
        if(collapseContent){
          var allInnerTabbableItems = collapseContent.querySelectorAll('a[tabindex], button[tabindex]');
          
          var allInnerCollapseTriggers = collapseContent.querySelectorAll('.collapse-trigger');

          if (parent && collapseContent) {

            // if the card is open, close it, adjust the max height, and tabindex of inner elements
            if (parent.classList.contains('open')) {

              // window.log.info('boop closing collapsible')

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

              // window.log.info('boop opening collapsible')

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
                // allInnerTabbableItems that are a child of .card-menu
                var allInnerCardMenuItems = collapseContent.querySelectorAll('.card-menu a[tabindex], .card-menu button[tabindex]');
                
                allInnerCardMenuItems.forEach(function(element) {
                  element.setAttribute('tabindex', '0');
                });
                allInnerCollapseTriggers.forEach(function(element) {
                  element.setAttribute('tabindex', '0');
                });
              }
              // else, set tabindex of all inner elements to 0
              else {
                allInnerTabbableItems.forEach(function(element) {
                  element.setAttribute('tabindex', '0');
                });
              }

            }

            // Update aria-expanded attribute

            collapseTrigger.setAttribute('aria-expanded', parent.classList.contains('open'));

          }
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

      if(mapWrap.classList){
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

  const searchInstructionObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const sidebarContent = document.querySelector('.sidebar-content');
        const searchInstructions = document.querySelector('.search-instructions');
        const content = document.querySelector('.sidebar-content .content');
        const footer = document.querySelector('.sidebar-content .footer');
        const searchInstructionsHeight = 30;
  
        if (sidebarContent && searchInstructions && content && footer) {
          // Scroll event
          sidebarContent.addEventListener('scroll', () => {
            const scrollTop = sidebarContent.scrollTop;
            const overFlowAmount = sidebarContent.scrollHeight - sidebarContent.clientHeight;
            // window.console.log('sidebar content is scrolling');
            if (overFlowAmount > searchInstructionsHeight) {
              if (scrollTop <= searchInstructionsHeight) {
                searchInstructions.style.height = (searchInstructionsHeight - scrollTop) + 'px';
              } else {
                searchInstructions.style.height = '0';
              }
            }
          });
  
          // ResizeObserver to watch the actual content inside the scrollable area
          const handleResize = () => {
            requestAnimationFrame(() => {
              const overFlowAmount = sidebarContent.scrollHeight - sidebarContent.clientHeight;
              const scrollTop = sidebarContent.scrollTop;
          
              if (overFlowAmount <= 0) {
                searchInstructions.style.height = '';
                sidebarContent.scrollTop = 0; // optional
              }
            });
          };
  
          const resizeObserver = new ResizeObserver(handleResize);
  
          resizeObserver.observe(content);
          resizeObserver.observe(footer);
  
          // Optionally trigger on load too
          handleResize();
  
          searchInstructionObserver.disconnect();

          // headroom style search for mobile
          const sidebar = document.getElementById('sidebar');
          const search = document.getElementById('search');
          let lastScrollTop = sidebar.scrollTop;
          let isSticky = false;
          let upwardScrollAccumulated = 0;
          let userScrolledFarEnoughDown = false;

          const STICKY_TRIGGER_DISTANCE = 20;

          sidebar.addEventListener('scroll', () => {
            const currentScrollTop = sidebar.scrollTop;
            const searchTop = search.offsetTop;
            const searchHeight = search.offsetHeight;
            const searchBottom = searchTop + searchHeight;
            const scrollDelta = lastScrollTop - currentScrollTop;

            // Top of scroll — reset all
            if (currentScrollTop <= 0) {
              search.classList.remove('sticky', 'scrolled');
              isSticky = false;
              upwardScrollAccumulated = 0;
              userScrolledFarEnoughDown = false;
            } else {
              // Mark when user has scrolled far enough down past search
              if (currentScrollTop >= searchBottom + searchHeight) {
                userScrolledFarEnoughDown = true;
              }

              // Add .scrolled if search is out of view
              if (currentScrollTop >= searchBottom) {
                search.classList.add('scrolled');
              }

              if (scrollDelta > 0) {
                // Scrolling up — accumulate
                upwardScrollAccumulated += scrollDelta;

                if (
                  userScrolledFarEnoughDown &&
                  upwardScrollAccumulated >= STICKY_TRIGGER_DISTANCE &&
                  !isSticky
                ) {
                  search.classList.add('sticky');
                  isSticky = true;
                }
              } else if (scrollDelta < 0) {
                // Scrolling down — reset sticky logic
                upwardScrollAccumulated = 0;

                if (isSticky) {
                  search.classList.remove('sticky');
                  isSticky = false;
                }
              }
            }

            lastScrollTop = currentScrollTop;
          });

          // end headroom style search for mobile

          break;
        }
      }
    }
  });
  
  searchInstructionObserver.observe(document.body, { childList: true, subtree: true });
  


  var tocToggle = document.getElementById('toc-toggle');

  // function to toggle tabbable elements in toc specifically
  function toggleToc(toc, open) {
    // adjust tabindex of all tabbable elements in toc
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