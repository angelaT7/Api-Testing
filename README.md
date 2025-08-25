# API Testing Project

Automated tests for the GraphQL API [https://graphqlzero.almansi.me/api] using **Playwright**.  
Tests cover **Users** and **Albums** endpoints, including queries, mutations, pagination, and error handling.

## Tech Stack
- Node.js, TypeScript  
- Playwright  
- GitHub Actions (CI/CD, optional)

## Project Structure
- `api/` – API wrapper classes (`users.ts`, `albums.ts`)  
- `data/` – JSON test data (`arrayUsers.json`, `arrayAlbums.json`)  
- `tests/` – Test scripts (`users.spec.ts`, `albums.spec.ts`)  
- `playwright.config.ts` – Playwright configuration file  
- `package.json` – Project dependencies and scripts  
- `README.md` – Documentation

## Test Data (Data-Driven Testing)

The tests use local JSON files for input data. This approach allows running the same tests with different datasets without changing the test logic.  

Example of loading JSON data in the tests:

```ts
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '../data/arrayAlbums.json');
const albumData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));


## Setup & Run
```bash
# Git clone https://github.com/angelaT7/Api-Testing.git

# Create a local folder for the project (if not already created)
- mkdir <your-local-folder>
- cd <your-local-folder>

# npm install
- npm install

# Run all tests
- npx playwright test    

# Run a specific test       
- npx playwright test ./testfile (tests/users.spec.ts)    

# View test report
- npx playwright show-report    