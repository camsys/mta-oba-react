Install node.js if not already done so https://nodejs.org/en/download

Pull repo down from git

Open cmd and navigate to mta-oba-react wherever your local git repo is

Install react via cmd running "npm install react react-dom" (no quotes)

Execute "npm run start"

Navigate to http://localhost:8080/?LineRef=B63 in your browser

Configurable env variables:
Var Name | Var Use | Default Value
---|---|---
ALLOWED_HOST_ADDRESS | where this is being hosted |'app-react.qa.obanyc.com'
ENV_ADDRESS | what OBA env the app gets data from |'app.qa.obanyc.com'


Theoretically this should work!
