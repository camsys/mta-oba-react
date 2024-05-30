import React from 'react';


function getRouteCard  () {
    console.log("using routeCard")

  var routeCard = document.getElementById('app');
  var root = createRoot(routeCard);
  root.render(<div class="card-header" >
      <h3 class="card-title">B38 Ridgewood - Downtown Brooklyn</h3>
    </div>);

   return <h3 class="card-title">Rey Test</h3>;

  
 }

export default getRouteCard;