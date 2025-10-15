/**
 * Quick test of Roboflow API integration
 * Run this to verify the Roboflow service is working
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW_ID = process.env.ROBOFLOW_WORKFLOW_ID;

async function testRoboflowAPI() {
  console.log('\n🧪 Testing Roboflow API Integration\n');
  console.log('Configuration:');
  console.log(`  Workspace: ${ROBOFLOW_WORKSPACE}`);
  console.log(`  Workflow: ${ROBOFLOW_WORKFLOW_ID}`);
  console.log(`  API Key: ${ROBOFLOW_API_KEY?.substring(0, 10)}...`);
  console.log('');

  // Test image URL (a flower image from Unsplash)
  const testImageUrl = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400';
  
  console.log('📸 Using test image:', testImageUrl);
  console.log('');

  try {
    // Download image and convert to base64
    console.log('📥 Downloading test image...');
    const imageResponse = await axios.get(testImageUrl, {
      responseType: 'arraybuffer'
    });
    
    const base64Image = Buffer.from(imageResponse.data).toString('base64');
    console.log(`✅ Image downloaded (${(base64Image.length / 1024).toFixed(2)} KB)`);
    console.log('');

    // Try different API endpoints to find the right one
    const endpoints = [
      {
        name: 'Workflow Inference API (Hosted)',
        url: `https://detect.roboflow.com/infer/workflows/${ROBOFLOW_WORKSPACE}/${ROBOFLOW_WORKFLOW_ID}`,
        data: {
          api_key: ROBOFLOW_API_KEY,
          inputs: {
            image: {
              type: 'base64',
              value: base64Image
            }
          }
        }
      },
      {
        name: 'Serverless Workflow API',
        url: `https://serverless.roboflow.com/${ROBOFLOW_WORKSPACE}/${ROBOFLOW_WORKFLOW_ID}`,
        data: {
          api_key: ROBOFLOW_API_KEY,
          inputs: {
            image: {
              type: 'base64',
              value: base64Image
            }
          }
        }
      },
      {
        name: 'Workflow API with Query Param',
        url: `https://detect.roboflow.com/${ROBOFLOW_WORKSPACE}/${ROBOFLOW_WORKFLOW_ID}?api_key=${ROBOFLOW_API_KEY}`,
        data: {
          image: base64Image
        }
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url.replace(ROBOFLOW_API_KEY, '***')}`);
      
      try {
        const response = await axios.post(endpoint.url, endpoint.data, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });

        console.log('   ✅ SUCCESS!');
        console.log('   Response:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
        console.log('\n✅ Working endpoint found!');
        return;

      } catch (error) {
        if (error.response) {
          console.log(`   ❌ Failed: ${error.response.status}`);
          console.log(`   Error: ${JSON.stringify(error.response.data)}`);
        } else {
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
    }

    console.log('\n❌ None of the endpoints worked. Check your Roboflow configuration.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoboflowAPI();
