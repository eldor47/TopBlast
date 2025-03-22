import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

export interface LeaderboardEntry {
  id: number;
  address: string;
  characterName: string;
  score: number;
  timestamp: string;
}

export async function createLeaderboardTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) NOT NULL,
        character_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_address ON leaderboard(address)`;
    
    console.log('Leaderboard table created or verified');
  } catch (error) {
    console.error('Error creating leaderboard table:', error);
    throw error;
  }
}

export async function insertScore(address: string, characterName: string, score: number): Promise<LeaderboardEntry> {
  try {
    const result = await sql`
      INSERT INTO leaderboard (address, character_name, score)
      VALUES (${address}, ${characterName}, ${score})
      RETURNING 
        id,
        address,
        character_name as "characterName",
        score,
        timestamp::text as timestamp
    `;
    return result[0] as LeaderboardEntry;
  } catch (error) {
    console.error('Error inserting score:', error);
    throw error;
  }
}

export async function getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        address,
        character_name as "characterName",
        score,
        timestamp::text as timestamp
      FROM leaderboard
      ORDER BY score DESC
      LIMIT ${limit}
    `;
    return result as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting top scores:', error);
    throw error;
  }
}

export async function getPlayerScores(address: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        address,
        character_name as "characterName",
        score,
        timestamp::text as timestamp
      FROM leaderboard
      WHERE address = ${address}
      ORDER BY score DESC
      LIMIT ${limit}
    `;
    return result as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting player scores:', error);
    throw error;
  }
} 