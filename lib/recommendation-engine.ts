import { AcneSeverity, PigmentationLevel, HairDensity, ScarType } from '@prisma/client'

export interface SessionData {
  acneSeverity?: AcneSeverity | null
  pigmentationLevel?: PigmentationLevel | null
  glowDullnessScale?: number | null
  hairDensity?: HairDensity | null
  scarType?: ScarType | null
}

export interface Recommendation {
  type: string
  reason: string
  suggestedProducts: string[]
  followUpDays: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export function generateRecommendations(sessionData: SessionData): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Acne Treatment Recommendations
  if (sessionData.acneSeverity === 'MODERATE' || sessionData.acneSeverity === 'SEVERE') {
    recommendations.push({
      type: 'Acne Peel',
      reason: `${sessionData.acneSeverity.toLowerCase()} acne detected`,
      suggestedProducts: ['Acne Peel Solution', 'Antibiotic Topical Gel', 'Oil-free Moisturizer'],
      followUpDays: 7,
      priority: sessionData.acneSeverity === 'SEVERE' ? 'HIGH' : 'MEDIUM'
    })

    if (sessionData.acneSeverity === 'SEVERE') {
      recommendations.push({
        type: 'Intra-lesional Injections',
        reason: 'Severe acne with nodules detected',
        suggestedProducts: ['Corticosteroid Injection', 'Post-injection Care Cream'],
        followUpDays: 10,
        priority: 'HIGH'
      })
    } else {
      recommendations.push({
        type: 'Hydra Facial',
        reason: 'Deep cleansing needed for moderate acne',
        suggestedProducts: ['Hydrating Serum', 'Gentle Cleanser', 'Sunscreen SPF 50+'],
        followUpDays: 14,
        priority: 'MEDIUM'
      })
    }
  }

  // Pigmentation Treatment Recommendations
  if (sessionData.pigmentationLevel === 'MEDIUM' || sessionData.pigmentationLevel === 'HIGH') {
    recommendations.push({
      type: 'Melasma Peel',
      reason: `${sessionData.pigmentationLevel.toLowerCase()} pigmentation detected`,
      suggestedProducts: ['Melasma Peel', 'Vitamin C Serum', 'Sunscreen SPF 50+', 'Brightening Cream'],
      followUpDays: 14,
      priority: sessionData.pigmentationLevel === 'HIGH' ? 'HIGH' : 'MEDIUM'
    })

    recommendations.push({
      type: 'Skin Brightening Treatment',
      reason: 'Enhance pigmentation reduction',
      suggestedProducts: ['Kojic Acid Cream', 'Niacinamide Serum', 'Gentle Exfoliant'],
      followUpDays: 21,
      priority: 'MEDIUM'
    })
  }

  // Skin Glow Recommendations
  if (sessionData.glowDullnessScale && sessionData.glowDullnessScale >= 4) {
    const priority = sessionData.glowDullnessScale >= 7 ? 'HIGH' : 'MEDIUM'
    
    recommendations.push({
      type: 'Hydra Facial',
      reason: `Dullness level ${sessionData.glowDullnessScale}/10 detected`,
      suggestedProducts: ['Hydrating Serum', 'Vitamin C Serum', 'Moisturizer'],
      followUpDays: 15,
      priority
    })

    recommendations.push({
      type: 'MediGlow Facial',
      reason: 'Restore skin radiance and glow',
      suggestedProducts: ['Glow Enhancing Serum', 'Hydrating Mask', 'Illuminating Cream'],
      followUpDays: 15,
      priority
    })

    if (sessionData.glowDullnessScale >= 6) {
      recommendations.push({
        type: 'Carbon Facial',
        reason: 'Deep rejuvenation needed for significant dullness',
        suggestedProducts: ['Carbon Lotion', 'Soothing Gel', 'Sunscreen'],
        followUpDays: 21,
        priority: 'HIGH'
      })
    }
  }

  // Laser Hair Removal Recommendations
  if (sessionData.hairDensity === 'THICK' || sessionData.hairDensity === 'MEDIUM') {
    recommendations.push({
      type: 'Laser Hair Removal - Full Session',
      reason: `${sessionData.hairDensity.toLowerCase()} hair density detected`,
      suggestedProducts: ['Cooling Gel', 'Aloe Vera Gel', 'Post-LHR Care Cream'],
      followUpDays: 30,
      priority: sessionData.hairDensity === 'THICK' ? 'HIGH' : 'MEDIUM'
    })

    recommendations.push({
      type: 'Pre-LHR Preparation',
      reason: 'Prepare skin for laser treatment',
      suggestedProducts: ['Shaving Kit', 'Exfoliating Scrub', 'Moisturizer'],
      followUpDays: 7,
      priority: 'LOW'
    })
  }

  // Scar Treatment Recommendations
  if (sessionData.scarType === 'KELOID' || sessionData.scarType === 'HYPERTROPHIC') {
    recommendations.push({
      type: 'Intra-lesional Injections',
      reason: `${sessionData.scarType.toLowerCase()} scar type detected`,
      suggestedProducts: ['Corticosteroid Injection', 'Scar Reducing Gel', 'Silicone Sheet'],
      followUpDays: 14,
      priority: 'HIGH'
    })

    recommendations.push({
      type: 'Scar Revision Treatment',
      reason: 'Reduce scar appearance',
      suggestedProducts: ['Scar Cream', 'Moisturizing Lotion'],
      followUpDays: 21,
      priority: 'MEDIUM'
    })
  } else if (sessionData.scarType && ['ICE_PICK', 'BOXCAR', 'ROLLING'].includes(sessionData.scarType)) {
    recommendations.push({
      type: 'Microneedling',
      reason: `${sessionData.scarType.toLowerCase().replace('_', ' ')} scar detected`,
      suggestedProducts: ['Growth Factor Serum', 'Healing Cream', 'Sunscreen'],
      followUpDays: 30,
      priority: 'HIGH'
    })

    recommendations.push({
      type: 'PRP Facial',
      reason: 'Enhance skin regeneration and scar healing',
      suggestedProducts: ['PRP Treatment', 'Regenerating Serum', 'Moisturizer'],
      followUpDays: 30,
      priority: 'MEDIUM'
    })
  }

  return recommendations
}
