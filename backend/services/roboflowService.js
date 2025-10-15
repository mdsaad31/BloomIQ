/**
 * Roboflow ML Service Integration
 * Calls Roboflow API directly from Node.js backend
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class RoboflowService {
  constructor() {
    this.apiKey = process.env.ROBOFLOW_API_KEY;
    this.workspace = process.env.ROBOFLOW_WORKSPACE;
    this.workflowId = process.env.ROBOFLOW_WORKFLOW_ID;
    // Roboflow Hosted API for workflows
    this.apiUrl = 'https://detect.roboflow.com';
    
    if (!this.apiKey || !this.workspace || !this.workflowId) {
      console.warn('⚠️ Roboflow configuration incomplete. Check .env file.');
    } else {
      console.log('✅ Roboflow service initialized');
      console.log(`   Workspace: ${this.workspace}`);
      console.log(`   Workflow: ${this.workflowId}`);
      console.log(`   API URL: ${this.apiUrl}`);
    }
  }

  /**
   * Analyze image using Roboflow workflow via Inference API
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeImage(imagePath) {
    try {
      const startTime = Date.now();

      // Read image as base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      console.log('📤 Sending request to Roboflow Inference API...');
      console.log(`   Workspace: ${this.workspace}`);
      console.log(`   Workflow: ${this.workflowId}`);

      // Call Roboflow Hosted Inference API for workflows
      // Using the same format as the Inference SDK's run_workflow method
      const response = await axios.post(
        `https://detect.roboflow.com/infer/workflows/${this.workspace}/${this.workflowId}`,
        {
          api_key: this.apiKey,
          inputs: {
            image: {
              type: 'base64',
              value: base64Image
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds
        }
      );

      const processingTime = (Date.now() - startTime) / 1000;

      console.log('✅ Received response from Roboflow');
      console.log('🔍 Raw Response:', JSON.stringify(response.data, null, 2));

      // Parse the response
      const result = this.parseRoboflowResult(response.data, processingTime);

      return result;

    } catch (error) {
      console.error('❌ Roboflow API Error:', error.message);
      if (error.response) {
        console.error('   Response Status:', error.response.status);
        console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Roboflow API. Check your internet connection.');
      }
      throw new Error(`Roboflow analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Parse Roboflow workflow response into BloomIQ format
   * @param {Object} workflowOutput - Roboflow workflow response
   * @param {number} processingTime - Time taken for processing
   * @returns {Object} Parsed results
   */
  parseRoboflowResult(workflowOutput, processingTime) {
    try {
      // Handle different response structures
      let predictions = [];
      
      // Try to extract predictions from various possible structures
      // Format 1: outputs[0].predictions.predictions (current Roboflow format)
      if (workflowOutput.outputs && workflowOutput.outputs[0] && workflowOutput.outputs[0].predictions) {
        const predData = workflowOutput.outputs[0].predictions;
        if (predData.predictions && Array.isArray(predData.predictions)) {
          predictions = predData.predictions;
        } else if (Array.isArray(predData)) {
          predictions = predData;
        }
      }
      // Format 2: output.predictions
      else if (workflowOutput.output && workflowOutput.output.predictions) {
        predictions = workflowOutput.output.predictions;
      }
      // Format 3: Top-level predictions
      // Analyze detections and build class breakdown
      let flowerCount = 0;
      let fruitCount = 0;
      let totalConfidence = 0;
      const allDetections = [];
      const classCounts = {};

      predictions.forEach((pred, index) => {
        const className = (pred.class || pred.class_name || '').toLowerCase();
        const confidence = pred.confidence || 0;

        // Count classes
        classCounts[className] = (classCounts[className] || 0) + 1;

        // Classify detection (handle ripening stages and general categories)
        if (
          className.includes('flower') ||
          className.includes('bloom') ||
          className.includes('blossom') ||
          className === 'b_green'
        ) {
          flowerCount++;
        } else if (
          className.includes('fruit') ||
          className.includes('berry') ||
          className.includes('ripened') ||
          (className.includes('green') && className !== 'b_green') ||
          className.includes('half') ||
          className.includes('fully')
        ) {
          fruitCount++;
        }

        totalConfidence += confidence;

        allDetections.push({
          class: className,
          confidence: confidence,
          bbox: pred.bbox || pred.bounding_box || null,
          x: pred.x || null,
          y: pred.y || null,
          width: pred.width || null,
          height: pred.height || null
        });
      });

      // Determine overall stage by most frequent class
      let overallStage = 'unknown';
      let maxClass = null;
      let maxCount = 0;
      for (const [cls, count] of Object.entries(classCounts)) {
        if (count > maxCount) {
          maxClass = cls;
          maxCount = count;
        }
      }
      if (maxClass) {
        if (maxClass.includes('fully_ripened')) overallStage = 'fully_ripened';
        else if (maxClass.includes('half_ripened')) overallStage = 'half_ripened';
        else if (maxClass.includes('green') && maxClass !== 'b_green') overallStage = 'green';
        else if (maxClass.includes('flower') || maxClass === 'b_green') overallStage = 'flower';
        else overallStage = maxClass;
      }

      // Count fruits by ripeness
      let fullyRipenedCount = 0;
      let halfRipenedCount = 0;
      let greenCount = 0;
      for (const [cls, count] of Object.entries(classCounts)) {
        if (cls.includes('fully_ripened')) fullyRipenedCount += count;
        else if (cls.includes('half_ripened')) halfRipenedCount += count;
        else if (cls.includes('green') && cls !== 'b_green') greenCount += count;
      }

      // Estimate yield (average tomato weight: 75-125g, use 100g = 0.1kg)
      // Fully ripened: 0.1kg, Half ripened: 0.08kg, Green: 0.05kg, Flowers: 0kg (potential yield)
      const yieldKg = (fullyRipenedCount * 0.1) + (halfRipenedCount * 0.08) + (greenCount * 0.05);
      
      // Market price per kg (average: 4-6 INR/kg, use 5 INR/kg)
      const marketPricePerKg = 5;
      const estimatedEarnings = yieldKg * marketPricePerKg;

      // Growth stage (legacy, for compatibility)
      let stage = 'unknown';
      if (flowerCount > 0 && fruitCount === 0) {
        stage = 'flowering';
      } else if (fruitCount > 0 && flowerCount === 0) {
        stage = 'fruiting';
      } else if (flowerCount > 0 && fruitCount > 0) {
        stage = 'both';
      } else if (predictions.length > 0) {
        stage = 'vegetative';
      }

      const avgConfidence = predictions.length > 0 ? totalConfidence / predictions.length : 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(stage, flowerCount, fruitCount, avgConfidence);

      return {
        stage, // legacy
        overallStage,
        classCounts,
        confidence: avgConfidence,
        detections: predictions.length,
        flowering_results: {
          confidence: flowerCount > 0 ? avgConfidence : 0,
          detections: flowerCount
        },
        fruiting_results: {
          confidence: fruitCount > 0 ? avgConfidence : 0,
          detections: fruitCount
        },
        all_detections: allDetections,
        recommendations,
        yieldKg: Number(yieldKg.toFixed(3)),
        estimatedEarnings: Number(estimatedEarnings.toFixed(2)),
        marketPricePerKg,
        fullyRipenedCount,
        halfRipenedCount,
        greenCount,
        processing_time: processingTime,
        model_version: 'roboflow-v1',
        raw_result: workflowOutput // For debugging
      };

    } catch (error) {
      console.error('❌ Error parsing Roboflow result:', error);
      console.error('   Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Generate crop recommendations based on analysis
   * @param {string} stage - Growth stage
   * @param {number} flowerCount - Number of flowers detected
   * @param {number} fruitCount - Number of fruits detected
   * @param {number} confidence - Average confidence score
   * @returns {Array<string>} List of recommendations
   */
  generateRecommendations(stage, flowerCount, fruitCount, confidence) {
    const recommendations = [];

    if (stage === 'flowering') {
      recommendations.push('🌸 Flowering stage detected - ensure adequate pollination');
      recommendations.push('💧 Maintain consistent moisture levels');
      recommendations.push('🌡️ Monitor temperature for optimal flower development');
      if (flowerCount > 5) {
        recommendations.push('✂️ Consider thinning flowers for better fruit development');
      }
    } else if (stage === 'fruiting') {
      recommendations.push('🍎 Fruiting stage detected - increase potassium fertilization');
      recommendations.push('💧 Ensure consistent watering to prevent fruit splitting');
      recommendations.push('🛡️ Monitor for pests and diseases');
      if (fruitCount > 10) {
        recommendations.push('⚖️ Consider fruit thinning for larger, better quality fruits');
      }
    } else if (stage === 'both') {
      recommendations.push('🌸🍎 Both flowering and fruiting detected - balanced care needed');
      recommendations.push('🌱 Apply balanced NPK fertilizer');
      recommendations.push('💧 Maintain optimal soil moisture');
    } else if (stage === 'vegetative') {
      recommendations.push('🌱 Vegetative growth stage - focus on nitrogen fertilization');
      recommendations.push('☀️ Ensure adequate sunlight exposure');
      recommendations.push('💧 Regular watering schedule recommended');
    } else {
      recommendations.push('🔍 No flowers or fruits detected clearly');
      recommendations.push('📸 Consider retaking photo with better lighting');
      recommendations.push('🌱 Plant may be in early vegetative stage');
    }

    // Add confidence-based recommendations
    if (confidence < 0.5) {
      recommendations.push('⚠️ Low confidence detection - consider retaking image');
    }

    return recommendations;
  }

  /**
   * Health check for Roboflow service
   * @returns {Object} Service status
   */
  async healthCheck() {
    return {
      status: 'ok',
      service: 'Roboflow ML Service',
      configured: !!(this.apiKey && this.workspace && this.workflowId),
      workspace: this.workspace,
      workflow: this.workflowId,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new RoboflowService();
