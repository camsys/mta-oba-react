Install node.js if not already done so https://nodejs.org/en/download

Pull repo down from git

Open cmd and navigate to mta-oba-react wherever your local git repo is

Install react via cmd running "npm install react react-dom" (no quotes)

Execute "npm run start"

Navigate to http://localhost:8080/?LineRef=B63 in your browser

Configurable env variables:
Var Name | Var Use | Default Value
---|---|---
ALLOWED_HOST_ADDRESS | where this is being hosted |app-react.qa.obanyc.com
ENV_ADDRESS | what OBA env the app gets data from |app.qa.obanyc.com


Theoretically this should work!





--------

basic overview of codebase:

data storage
- DataModels.js
  - a refactor is needed so that data objects corresponding to a component are kept in that component
  - otherwise this js file contains a number of data objects and is fairly relevant for data processing of effects
    - the choice to have it help process data was made to makeup for javascript's limitations around typing
    - probably we should have just switched to typescript and kept things more loosely coupled

external data collection:
- the search effect
  - determines what card type we are using
  - can be called for initializing and for searches
  - it fills in the data for a number of components when performing this initial search
- afterwards more frequently updated data is collected by the ____ call, which calls the other effects

state handling:
- card object
  - all information needed by components is stored in "card" objects kept in the global state object
  - this object will not trigger a new state update if the reference to the card is kept the same
  - some subclasses should be rendered more frequently than that state being updated




---------

IF YOU ARE DOING A RELEASE FROM THIS BRANCH:

unfortunately we have no meaningful release tool support. when someone has time we should add that.

here is the versioning sequence for releases:

sample:

right now we're basicly at 0.5.29, we're about to have our first frozen release and at that point we will diverge into this branch having a more stable long term structure, because it's likely what is needed depending on timelines for the sandbox.

sample sequence of releases:

frozen first release: 0.5.29-disrupt.1
moving: 0.5.29-disrupt.2.SNAPSHOT
frozen second release: 0.5.29-disrupt.2
moving: 0.5.29-disrupt.3.SNAPSHOT

then, main finishes a release && 0.5.30 is released
we freeze this branch 0.5.29-disrupt.3
we merge in main
we bump the version of main, and this branch:
0.5.30-disrupt.3.1-SNAPSHOT
