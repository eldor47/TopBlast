import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

export interface LeaderboardEntry {
  id: number;
  address?: string;
  characterName: string;
  score: number;
  timestamp: string;
  xUsername?: string;
}

export async function createLeaderboardTable() {
  try {
    // First, create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) NULL,
        character_name VARCHAR(50) NOT NULL,
        score BIGINT NOT NULL,
        x_username VARCHAR(50) NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`;

    // Then create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_address ON leaderboard(address)`;
    
    // Add x_username column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'leaderboard' 
          AND column_name = 'x_username'
        ) THEN
          ALTER TABLE leaderboard ADD COLUMN x_username VARCHAR(50) NULL;
        END IF;
      END $$;
    `;
    
    // Create index for x_username after ensuring the column exists
    await sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_x_username ON leaderboard(x_username)`;

    // Modify existing address column to allow NULL values
    await sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'leaderboard' 
          AND column_name = 'address'
        ) THEN
          ALTER TABLE leaderboard ALTER COLUMN address DROP NOT NULL;
        END IF;
      END $$;
    `;

    // Modify score column to BIGINT if it's not already
    await sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'leaderboard' 
          AND column_name = 'score'
          AND data_type = 'integer'
        ) THEN
          ALTER TABLE leaderboard ALTER COLUMN score TYPE BIGINT;
        END IF;
      END $$;
    `;
    
    console.log('Leaderboard table created or verified');
  } catch (error) {
    console.error('Error creating leaderboard table:', error);
    throw error;
  }
}

export async function insertScore(address: string | undefined, characterName: string, score: number, xUsername?: string): Promise<LeaderboardEntry> {
  try {
    const result = await sql`
      INSERT INTO leaderboard (address, character_name, score, x_username)
      VALUES (${address}, ${characterName}, ${score}, ${xUsername})
      RETURNING 
        id,
        address,
        character_name as "characterName",
        score,
        x_username as "xUsername",
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
        x_username as "xUsername",
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
        x_username as "xUsername",
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