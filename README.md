# Installed packages
json-server - For creation of mock APIs
react-table - React Table implementation
Ant Design - Made use of the Datepicker

# How to run
1. Navigate to the FrontendDeveloperAssessment folder and run npm install,
2. Once the npm install is done, in the terminal, run `npx json-server -w .\database\db.json -p 3001`. This will run the mock API server using json-server on port 3001.
3. proceed to run `npm start` to start the local app.
4. Proxy is already set in the packaage.json to perform the API fetch on the stated URL in the proxy to `https://localhost:3001`.

# Running Test Case
1. Navigate to the FrontendDeveloperAssessment folder
2. run npm run test to run the test suite.
