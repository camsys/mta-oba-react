Install node.js if not already done so https://nodejs.org/en/download (CI uses Node 20)

Pull repo down from git

Open a terminal and navigate to mta-oba-react wherever your local git repo is

Install dependencies: `npm install`

Start the dev server: `npm run dev-start`

Navigate to http://localhost:8080/?LineRef=B63 in your browser

Other scripts:
- `npm run build`: production build into `dist/`
- `npm test`: run the tests in `test/`

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



--------

How to deploy:
- start from an up-to-date main: `git checkout main && git pull`
- release: `npm version 1.0.15` (use the real version)
  - this syncs package.json, package-lock.json and public/version.json, commits, and tags (tags have no "v" prefix; see `.npmrc`)
  - it runs `npm audit --audit-level=high` first and stops if anything high-severity is found; fix that before releasing
- next snapshot: `npm version 1.0.16-SNAPSHOT --no-git-tag-version` (the *next* patch number, not the one just released)
  - `--no-git-tag-version` skips the tag, and the commit with it, so commit by hand: `git commit -m "bump to 1.0.16-SNAPSHOT" package.json package-lock.json public/version.json`
- push commits and tags: `git push && git push --tags`
- bump version in devops repo for the environment you want to change
- kick off a jenkins build for the appropriate env