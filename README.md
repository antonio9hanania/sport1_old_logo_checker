# Sport1 Logo Up-to-Date Checker

## Description

This web application is designed to check if the logos used on the Sport1 website are up to date. It helps identify logos that may need updating by comparing them against a reference set of current logos.

## Features

- Check logos from the Sport1 website for outdated versions
- Set a custom threshold for determining if a logo needs updating
- View side-by-side comparisons of current Sport1 logos and their up-to-date versions
- Filter results to show only logos that may need updating
- Download logos that are identified as potentially outdated

## How to Use

1. Open the application in your web browser.
2. Set the range of logo indices you want to check:
   - Enter the start number in the "Start Number" field
   - Enter the end number in the "End Number" field
3. Set the "Update Threshold" (default is 75%):
   - Logos below this threshold will be flagged as potentially needing an update
4. Click "Check Logos" to start the process
5. Once complete, you can:
   - Use the "Show Logos Needing Update" button to filter the results
   - Use the "Show All Logos" button to view all checked logos
   - Download logos that are flagged as potentially needing an update

## Important Notes

- This tool requires an active internet connection to fetch the logos.
- Due to technical restrictions, you may need to activate temporary access to a demo server:
  1. Open https://cors-anywhere.herokuapp.com/corsdemo in a new tab
  2. Click the button to request temporary access
  3. Return to the Logo Up-to-Date Checker and use as normal
- The checking process may take some time depending on the number of logos being verified.
- This tool is for internal use and should respect Sport1's terms of service and copyright policies.

## Technical Details

- The application uses vanilla JavaScript and is built to run entirely in the browser.
- The project structure is modular for easy maintenance and potential future enhancements.

## Deployment

This project is designed to be easily deployed on GitHub Pages. Follow these steps:

1. Fork or clone this repository
2. Go to your repository settings on GitHub
3. Navigate to the "Pages" section
4. Under "Source", select the branch you want to deploy (usually "main" or "master")
5. Click "Save"

GitHub will provide you with a URL where your site is published.
