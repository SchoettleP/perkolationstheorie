export enum CellState {
  EMPTY = 0,
  TREE = 1,
  BURNING = 2,
  BURNT = 3,
}

export interface SimulationStats {
  empty: number;
  tree: number;
  burning: number;
  burnt: number;
  totalCells: number;
  initialTrees: number;
  burntPercentageOfInitialTrees: number;
  burntPercentageOfTotalGrid: number;
}

export class PercolationEngine {
  public width: number;
  public height: number;
  public p: number; // probability of a cell containing a tree (0 to 1)
  public useDiagonal: boolean;
  public grid: Uint8Array;
  
  public burningIndices: number[] = [];
  public stepCount: number = 0;
  public initialTreeCount: number = 0;
  
  constructor(width: number, height: number, p: number, useDiagonal: boolean) {
    this.width = width;
    this.height = height;
    this.p = p;
    this.useDiagonal = useDiagonal;
    this.grid = new Uint8Array(width * height);
    this.reset();
  }
  
  /**
   * Resets the grid and generates a new layout based on tree probability p.
   */
  public reset() {
    this.grid.fill(CellState.EMPTY);
    this.burningIndices = [];
    this.stepCount = 0;
    this.initialTreeCount = 0;
    
    for (let i = 0; i < this.grid.length; i++) {
      if (Math.random() < this.p) {
        this.grid[i] = CellState.TREE;
        this.initialTreeCount++;
      }
    }
  }
  
  /**
   * Ignites all trees on the leftmost column (c = 0).
   * Returns the number of ignited trees.
   */
  public startFire(): number {
    this.burningIndices = [];
    this.stepCount = 0;
    
    // Set all leftmost trees to BURNING
    for (let r = 0; r < this.height; r++) {
      const idx = r * this.width + 0;
      if (this.grid[idx] === CellState.TREE) {
        this.grid[idx] = CellState.BURNING;
        this.burningIndices.push(idx);
      }
    }
    return this.burningIndices.length;
  }
  
  /**
   * Propagates the fire by one tick.
   * Returns whether the simulation has finished (no more burning cells) and how many were newly ignited.
   */
  public step(): { finished: boolean; newlyIgnited: number } {
    if (this.burningIndices.length === 0) {
      return { finished: true, newlyIgnited: 0 };
    }
    
    const nextBurning: number[] = [];
    const w = this.width;
    
    for (let i = 0; i < this.burningIndices.length; i++) {
      const idx = this.burningIndices[i];
      const r = Math.floor(idx / w);
      const c = idx % w;
      
      // Check 4 neighbors
      this.checkAndIgnite(r - 1, c, nextBurning);
      this.checkAndIgnite(r + 1, c, nextBurning);
      this.checkAndIgnite(r, c - 1, nextBurning);
      this.checkAndIgnite(r, c + 1, nextBurning);
      
      // Optionally check diagonal neighbors
      if (this.useDiagonal) {
        this.checkAndIgnite(r - 1, c - 1, nextBurning);
        this.checkAndIgnite(r - 1, c + 1, nextBurning);
        this.checkAndIgnite(r + 1, c - 1, nextBurning);
        this.checkAndIgnite(r + 1, c + 1, nextBurning);
      }
      
      // Current burning cell is consumed and becomes burnt
      this.grid[idx] = CellState.BURNT;
    }
    
    this.burningIndices = nextBurning;
    this.stepCount++;
    
    return {
      finished: this.burningIndices.length === 0,
      newlyIgnited: nextBurning.length
    };
  }
  
  private checkAndIgnite(r: number, c: number, nextBurningList: number[]) {
    if (r >= 0 && r < this.height && c >= 0 && c < this.width) {
      const idx = r * this.width + c;
      if (this.grid[idx] === CellState.TREE) {
        this.grid[idx] = CellState.BURNING;
        nextBurningList.push(idx);
      }
    }
  }
  
  /**
   * Checks if any BURNT (or BURNING) cell has reached the right edge (c = width - 1).
   */
  public hasPercolated(): boolean {
    const lastCol = this.width - 1;
    for (let r = 0; r < this.height; r++) {
      const idx = r * this.width + lastCol;
      const state = this.grid[idx];
      if (state === CellState.BURNT || state === CellState.BURNING) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Gathers live statistics from the grid.
   */
  public getStats(): SimulationStats {
    let empty = 0;
    let tree = 0;
    let burning = 0;
    let burnt = 0;
    
    for (let i = 0; i < this.grid.length; i++) {
      const state = this.grid[i];
      if (state === CellState.EMPTY) empty++;
      else if (state === CellState.TREE) tree++;
      else if (state === CellState.BURNING) burning++;
      else if (state === CellState.BURNT) burnt++;
    }
    
    return {
      empty,
      tree,
      burning,
      burnt,
      totalCells: this.grid.length,
      initialTrees: this.initialTreeCount,
      burntPercentageOfInitialTrees: this.initialTreeCount > 0 ? (burnt / this.initialTreeCount) * 100 : 0,
      burntPercentageOfTotalGrid: (burnt / this.grid.length) * 100
    };
  }
}
