# GameTora Uma Musume Data Scraping Project Notes

## Project Goal
Extract Uma Musume character data from GameTora including aptitudes, base stats, growth rates, and other game mechanics data that isn't available in public APIs like umapyoi.net.

## Initial Investigation

### Target Site
- **Main Characters Page**: https://gametora.com/umamusume/characters
- **Individual Character Example**: https://gametora.com/umamusume/characters/100302-tokai-teio

### API Research
- **umapyoi.net API**: Available but lacks game mechanics data (aptitudes, stats, growth rates)
- **GameTora Internal API**: Uses Next.js with JSON endpoints, but no obvious public API

## Key Findings

### Next.js Data Structure Discovery
When examining network requests on character pages, found two important endpoints:

1. **General Data**: `https://gametora.com/_next/data/RaEqkJ6g5a-bZXT7vqAC6/umamusume.json`
2. **Character-Specific Data**: `https://gametora.com/_next/data/RaEqkJ6g5a-bZXT7vqAC6/umamusume/characters/tokai-teio.json?id=tokai-teio`

### URL Pattern Structure
```
https://gametora.com/_next/data/{BUILD_ID}/umamusume/characters/{CHARACTER_SLUG}.json?id={CHARACTER_SLUG}
```
- `BUILD_ID`: `RaEqkJ6g5a-bZXT7vqAC6` (may change with site updates)
- `CHARACTER_SLUG`: Character identifier (e.g., "tokai-teio")

## Recommended Solution

### Approach: Hybrid Scraping + JSON Extraction

#### Step 1: Scrape Character URLs
- Load main characters page: `https://gametora.com/umamusume/characters`
- Target container: `<div class="sc-70f2d7f-0 jaayLK">`
- Extract character links: `<a class="sc-73e3e686-1 cCKwGu" href="/umamusume/characters/100303-tokai-teio">`

#### Step 2: Extract Data from Individual Pages
- Navigate to each character page
- Extract JSON data from `__NEXT_DATA__` script tag
- This contains all the detailed character data needed

### Character Variation Handling

#### Important Issue: Multiple Character Variants
Characters like Tokai Teio have multiple versions with different IDs:
- `100301-tokai-teio` (original version)
- `100302-tokai-teio` (variant 1)  
- `100303-tokai-teio` (variant 2)

Each variant has completely different:
- Growth rates
- Skills  
- Aptitudes
- Missions
- Base stats

#### Solution: Treat Each Variant as Separate Entity
- Collect ALL character URLs regardless of name duplicates
- Use the game ID (100301, 100302, etc.) as primary key
- Extract full character data for each variant

## Implementation Plan

### Pseudo-Code Structure
```python
def scrape_all_characters():
    # Step 1: Get all character URLs
    character_links = scrape_character_urls_from_main_page()
    
    characters_data = []
    
    # Step 2: Process each character
    for url in character_links:
        character_id = extract_id_from_url(url)      # e.g., "100302"
        character_slug = extract_slug_from_url(url)  # e.g., "tokai-teio"
        
        # Step 3: Get data from individual page
        page_data = get_next_data_from_page(url)
        
        characters_data.append({
            'id': character_id,
            'slug': character_slug,
            'name': page_data['name'],
            'variant_info': page_data.get('variant'),
            'aptitudes': page_data['aptitudes'],
            'base_stats': page_data['base_stats'],
            'growth_rates': page_data['growth_rates'],
            # ... other game mechanics data
        })
    
    return characters_data

def scrape_character_urls_from_main_page():
    # Load page with headless browser or requests + BeautifulSoup
    # Wait for dynamic content to load
    # Extract all character URLs from container
    pass

def get_next_data_from_page(url):
    # Load individual character page
    # Find <script id="__NEXT_DATA__"> tag
    # Parse JSON content
    # Return character data object
    pass
```

### Data Fields to Extract
From the character pages, target these data points:
- **Aptitudes**: Turf, Dirt, Short, Mile, Medium, Long, Runner, Leader, Betweener, Chaser
- **Base Stats**: Speed, Stamina, Power, Guts, Wisdom
- **5⭐ Stats**: Max stats at 5-star level
- **Stat Bonuses**: Growth rate bonuses
- **Other**: Skills, missions, voice actor, etc.

## Technical Considerations

### Potential Challenges
1. **Build ID Changes**: The Next.js build ID may change with site updates
2. **Rate Limiting**: Implement delays between requests to avoid being blocked
3. **CSS Class Name Reliability**: Class names may change, use semantic selectors when possible
4. **Dynamic Content Loading**: Ensure JavaScript content is fully loaded before scraping

### Reliability Improvements
- Use character names and URL patterns as primary selectors (more stable than CSS classes)
- Implement error handling for missing data
- Add retry logic for failed requests
- Cache results to avoid re-scraping unchanged data

## Next Steps

1. **Set up scraping environment** (headless browser or requests + BeautifulSoup)
2. **Test character URL extraction** from main characters page
3. **Test `__NEXT_DATA__` extraction** from individual character pages  
4. **Build data extraction functions** for specific fields needed
5. **Implement character variant handling** to capture all versions
6. **Add error handling and rate limiting**
7. **Test with multiple characters** to validate approach
8. **Set up data storage/export** (JSON, CSV, database, etc.)

## Alternative Approaches (if current method fails)
- Direct access to Next.js JSON endpoints (if build ID can be determined reliably)
- Network request interception during page load
- Selenium-based full browser automation

---

*Note: This approach respects the site's data structure while extracting publicly available information. Be mindful of rate limiting and terms of service.*