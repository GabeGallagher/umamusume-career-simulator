# Uma Musume Simulation Project Planning

## Project Overview

**Goal**: Create a simulation tool for Uma Musume: Pretty Derby to test different support card combinations and training strategies through hundreds of simulations, removing RNG variance to identify optimal strategies.

**Target Simulations**: 500-1000 runs per analysis
**End Goal**: Community tool for strategy optimization

## Project Vision

### Input Parameters
- **Trainee Character**: Specific uma musume to train
- **6 Support Cards**: Card combination to test
- **Strategic Parameters**: Risk tolerance and approach

### Strategy Types
1. **Risky**: High failure rate but maximum potential for strongest possible uma
2. **Balanced**: Calculated risks targeting specific attribute benchmarks  
3. **Conservative**: Low risk, high completion rate, weaker top-end performance

### Simulation Scope
- Training events and outcomes
- Story events throughout career
- Race simulations and results
- Support card effects and interactions

## Technical Decision Analysis

### Language Recommendations

**Primary Recommendation: TypeScript/Node.js**
- **Pros**: 
  - Strongest language for developer (faster development)
  - Easy path to web visualization and full-stack deployment
  - Surprisingly fast for simulation work
  - Large ecosystem for data manipulation and visualization
  - Natural fit for eventual community web tool
- **Cons**: 
  - Potentially slower than C++ (but negligible for target scale)

**Secondary Option: Python**
- **Pros**:
  - Excellent data science ecosystem (numpy, pandas)
  - Great for analysis and visualization
  - Good performance for target simulation count
- **Cons**:
  - Developer less experienced
  - More complex path to web deployment

**Not Recommended: C++**
- Overkill for 500-1000 simulations
- Development overhead not justified
- Developer least experienced

### Architecture Structure

```
Core Engine Structure:
├── Game State Management
├── Event System (training/story events)
├── Race Simulation Engine  
├── Strategy Decision Trees
├── Statistics Collection
└── Results Analysis
```

### Race Simulation Approach (Tiered System)

**Level 1 - Basic (Recommended Start)**
- Simple stat checks with RNG
- Performance: ~1ms per race
- Good for initial development and testing

**Level 2 - Medium**  
- Position tracking and skill activation timing
- Performance: ~5-10ms per race
- Balanced detail vs speed

**Level 3 - Detailed**
- Full positional simulation with pace changes
- Performance: ~50ms+ per race
- Use only for critical races or final validation

### Strategy Implementation Example

```typescript
interface Strategy {
  trainingThreshold: number;
  statPrioritization: 'max_potential' | 'target_benchmarks' | 'safe_growth';
  raceSelection: 'high_reward_only' | 'calculated_risk' | 'guaranteed_wins';
}

const strategies: Record<string, Strategy> = {
  risky: {
    trainingThreshold: 0.3,  // Accept 30% failure rate
    statPrioritization: 'max_potential',
    raceSelection: 'high_reward_only'
  },
  balanced: {
    trainingThreshold: 0.15,
    statPrioritization: 'target_benchmarks', 
    raceSelection: 'calculated_risk'
  },
  conservative: {
    trainingThreshold: 0.05,
    statPrioritization: 'safe_growth',
    raceSelection: 'guaranteed_wins'
  }
} as const;
```

## Development Phases

### Phase 1: Core Simulation Engine
- Focus: Get game mechanics accurate
- Output: Raw data to CSV/JSON
- Interface: Command-line
- Goal: Validate simulation accuracy

### Phase 2: Visualization Layer
- **If TypeScript**: Web-based charts (Chart.js, D3.js)
- **If Python**: Jupyter notebooks or Streamlit
- Goal: Make results interpretable

### Phase 3: Community Tool
- Web interface for configuration
- Cloud deployment for sharing results
- User-friendly input/output

## Data Management Strategy

**Development Phase**: SQLite (works well with Node.js)
**Prototyping**: JSON files for quick iteration  
**Production**: PostgreSQL for web deployment

**Expected Data Volume**: 1000 runs with detailed tracking = substantial data
**Performance Target**: 10-50ms per career simulation = 10-50 seconds for full analysis

## Alternative UI Approach: Google Sheets Integration

**Concept**: Use Google Sheets as UI with backend processing
**Benefits**:
- Much faster than building custom UI
- Easy community sharing (users copy sheet and run)
- Familiar interface for users

**Structure**:
- Input Sheet: Character, support cards, strategy settings
- Output Sheet: Statistical summaries, top performer details  
- Backend: Reads from Sheets API, processes, writes results back

## Performance Expectations

**TypeScript/Node.js Performance**:
- Well-optimized simulation: 10-50ms per full career
- 1000 runs: 10-50 seconds total runtime
- Acceptable for target use case

**Simulation Count Recommendation**:
- Development: Start with 100 runs for faster iteration
- Testing: 500 runs for statistical significance  
- Production: 1000 runs for final analysis

## Next Steps

1. **Choose specific character/support card combination for prototype**
2. **Implement basic game state management**
3. **Create simple training event system**
4. **Add basic race simulation (Level 1)**
5. **Implement one strategy type (probably balanced)**
6. **Run initial simulations and validate against known game behavior**
7. **Iterate and expand**

## Key Technical Considerations

- **Modularity**: Keep systems loosely coupled for easy testing/modification
- **Configuration**: Make strategies and game parameters easily configurable
- **Validation**: Compare simulation results against known player experiences
- **Performance**: Profile and optimize hot paths if needed
- **Community**: Design with eventual sharing/collaboration in mind