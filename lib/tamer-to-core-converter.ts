/**
 * TAMER to CORE Conversion Utility
 * 
 * Converts 5-dimension TAMER scores to 4-dimension CORE scores
 * 
 * TAMER (5 dimensions, 0-6 scale):
 * - Trade: 0 = Free trade, 6 = Protectionism
 * - Abortion: 0 = No limit, 6 = Total ban
 * - Migration: 0 = Open borders, 6 = Closed borders
 * - Economics: 0 = Free market, 6 = State control
 * - Rights: 0 = Full equality, 6 = Criminalization
 * 
 * CORE (4 dimensions, 0-5 scale):
 * - Civil Rights (C): 0 = Liberty, 5 = Authority
 * - Openness (O): 0 = Global, 5 = National
 * - Redistribution (R): 0 = Market, 5 = Social
 * - Ethics (E): 0 = Progressive, 5 = Traditional
 */

export interface TamerScores {
  trade_score: number;      // 0-6
  abortion_score: number;   // 0-6
  migration_score: number;  // 0-6
  economics_score: number;  // 0-6
  rights_score: number;     // 0-6
}

export interface CoreScores {
  civil_rights_score: number;    // 0-5
  openness_score: number;        // 0-5
  redistribution_score: number;  // 0-5
  ethics_score: number;          // 0-5
}

/**
 * Convert TAMER scores (5-dim, 0-6 scale) to CORE scores (4-dim, 0-5 scale)
 * 
 * Mapping logic:
 * 
 * Civil Rights (C):
 * - Primary: rights_score (direct mapping)
 * - Secondary: abortion_score (reproductive rights are civil rights)
 * - Formula: average(rights, abortion) scaled from 0-6 to 0-5
 * 
 * Openness (O):
 * - Primary: migration_score (immigration policy)
 * - Secondary: trade_score (economic openness)
 * - Formula: average(migration, trade) scaled from 0-6 to 0-5
 * 
 * Redistribution (R):
 * - Primary: economics_score (state vs market)
 * - Formula: economics_score scaled from 0-6 to 0-5
 * 
 * Ethics (E):
 * - Primary: abortion_score (social values proxy)
 * - Secondary: rights_score (traditional vs progressive values)
 * - Formula: average(abortion, rights) scaled from 0-6 to 0-5
 */
export function convertTamerToCore(tamer: TamerScores): CoreScores {
  // Helper to scale from 0-6 to 0-5
  const scale = (value: number): number => {
    // Clamp to 0-6 range first
    const clamped = Math.max(0, Math.min(6, value));
    // Scale to 0-5 and round to nearest integer
    return Math.round((clamped / 6) * 5);
  };

  // Civil Rights: Combination of rights and abortion scores
  // Both relate to individual autonomy vs state control
  const civilRightsRaw = (tamer.rights_score + tamer.abortion_score) / 2;
  const civil_rights_score = scale(civilRightsRaw);

  // Openness: Combination of migration and trade
  // Both relate to borders/barriers vs global integration
  const opennessRaw = (tamer.migration_score + tamer.trade_score) / 2;
  const openness_score = scale(opennessRaw);

  // Redistribution: Direct mapping from economics
  // State control vs free market
  const redistribution_score = scale(tamer.economics_score);

  // Ethics: Combination of abortion and rights
  // Social progressivism vs traditional values
  // Weight abortion slightly higher as it's a strong values proxy
  const ethicsRaw = (tamer.abortion_score * 0.6 + tamer.rights_score * 0.4);
  const ethics_score = scale(ethicsRaw);

  return {
    civil_rights_score,
    openness_score,
    redistribution_score,
    ethics_score,
  };
}

/**
 * Batch convert multiple TAMER scores to CORE
 */
export function convertTamerArrayToCore(tamerScores: TamerScores[]): CoreScores[] {
  return tamerScores.map(convertTamerToCore);
}

/**
 * Get a confidence score for the conversion (0-1)
 * Higher confidence when TAMER dimensions align closely
 */
export function getConversionConfidence(tamer: TamerScores): number {
  // Check alignment between related dimensions
  // High confidence if related dimensions are similar (suggesting consistent ideology)
  
  const rightsAbortionDiff = Math.abs(tamer.rights_score - tamer.abortion_score);
  const migrationTradeDiff = Math.abs(tamer.migration_score - tamer.trade_score);
  
  // Lower difference = higher confidence
  // Max difference is 6, normalize to 0-1 where 1 is high confidence
  const rightsConfidence = 1 - (rightsAbortionDiff / 6);
  const opennessConfidence = 1 - (migrationTradeDiff / 6);
  
  // Average the confidences
  return (rightsConfidence + opennessConfidence) / 2;
}

