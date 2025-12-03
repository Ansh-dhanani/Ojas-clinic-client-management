import { generateRecommendations } from '../recommendation-engine'

describe('Recommendation Engine', () => {
  describe('generateRecommendations', () => {
    it('should recommend acne treatments for severe acne', () => {
      const skinData = {
        acneSeverity: 'SEVERE' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.type.toLowerCase().includes('acne'))).toBe(true)
      expect(recommendations.some(r => r.priority === 'HIGH')).toBe(true)
    })

    it('should recommend pigmentation treatments for high pigmentation', () => {
      const skinData = {
        pigmentationLevel: 'HIGH' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.type.toLowerCase().includes('melasma') || r.type.toLowerCase().includes('brightening'))).toBe(true)
    })

    it('should recommend glow treatments for low glow score', () => {
      const skinData = {
        glowDullnessScale: 8,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.type.toLowerCase().includes('facial') || r.type.toLowerCase().includes('glow'))).toBe(true)
    })

    it('should recommend hair removal for thick hair density', () => {
      const skinData = {
        hairDensity: 'THICK' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.type.toLowerCase().includes('laser') || r.type.toLowerCase().includes('lhr'))).toBe(true)
    })

    it('should recommend scar treatments for keloid scars', () => {
      const skinData = {
        scarType: 'KELOID' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.type.toLowerCase().includes('scar') || r.type.toLowerCase().includes('injection'))).toBe(true)
    })

    it('should generate multiple recommendations for multiple concerns', () => {
      const skinData = {
        acneSeverity: 'MODERATE' as any,
        pigmentationLevel: 'MEDIUM' as any,
        glowDullnessScale: 5,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThanOrEqual(3)
    })

    it('should return empty array for no concerns', () => {
      const skinData = {}
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations).toEqual([])
    })

    it('should include suggested products', () => {
      const skinData = {
        acneSeverity: 'MODERATE' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.every(r => Array.isArray(r.suggestedProducts))).toBe(true)
    })

    it('should include follow-up days', () => {
      const skinData = {
        pigmentationLevel: 'HIGH' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.every(r => typeof r.followUpDays === 'number')).toBe(true)
    })

    it('should set appropriate priority levels', () => {
      const skinData = {
        acneSeverity: 'SEVERE' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      const priorities = recommendations.map(r => r.priority)
      expect(priorities).toContain('HIGH')
    })

    it('should include descriptions for recommendations', () => {
      const skinData = {
        acneSeverity: 'MILD' as any,
      }
      
      const recommendations = generateRecommendations(skinData)
      
      recommendations.forEach(rec => {
        expect(rec.reason).toBeDefined()
        expect(rec.reason.length).toBeGreaterThan(0)
      })
    })
  })
})
