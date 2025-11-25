# Codeforces Random Unsolved

A simple web app that helps you find random Codeforces problems you haven't solved yet. Filter by tags, rating, and more to practice problems without browsing through long problemset lists.

## How it Works

- Enter your Codeforces username (e.g., `tourist`)
- Select tags and pick rating range
- App checks which problems you already solved
- Gets all problems that match your filters
- Removes problems you already solved
- Picks one random problem
- Shows you:
   - Problem name
   - Contest ID
   - Rating
   - Tags
   - How many people solved it
   - Direct links to problem and contest
   
## Tech Used

- HTML, CSS, JavaScript (frontend)
- Node.js, Express (backend)
- Codeforces API

## Performance Notes

- Uses local caching for avatar loading to reduce repeated API calls.
- Reduces Codeforces API load by caching tags and problemset.
- Debounces input to avoid unnecessary fetch storms.
- Uses `async/await` + streaming responses where applicable.

## Known Limitations

- Heavily depends on Codeforces API rate limits.
- Avatar fetching may vary based on CF CDN response time.

## Planned Improvements

- IndexedDB caching for full problemset.
- Offline mode with preloaded data.
- Support for multiple handles.
- Better tag-based recommendation logic.

## Designed and Developed by Piyush Jha 👨🏻‍💻
#### If you like this project, star it on GitHub and share it with friends who do Codeforces.