# AI Fine-Tuning Plan

## Overview
Fine-tuning a model on human-corrected triage data is the long-term "moat" for accuracy. A fine-tuned 8B model will outperform generic GPT-4o at a fraction of the cost.

## Prerequisites
- **1,000+ human-corrected triages**: Reviews where humans have verified/corrected the AI's category, urgency, topic, and summary
- **Data collection mechanism**: UI for users to correct AI classifications
- **Training infrastructure**: Access to fine-tuning API (OpenRouter, Together.ai, or self-hosted)

## Model Selection
**Target Model**: Llama 3 8B or Mistral 7B
- Small enough to fine-tune cost-effectively
- Large enough to capture nuanced patterns
- Fast inference for production use

## Data Collection Strategy

### Phase 1: Collect Corrections (Current)
- Add "Correct Classification" button to each review/cluster in UI
- Store corrections in new `ReviewCorrection` table:
  ```prisma
  model ReviewCorrection {
    id        String   @id @default(cuid())
    reviewId  String
    review    Review   @relation(fields: [reviewId], references: [id])
    userId    String
    user      User     @relation(fields: [userId], references: [id])
    
    // Corrected values
    category  String   // User's correction
    urgency   String
    topic     String
    summary   String
    
    // Original AI values (for comparison)
    originalCategory String
    originalUrgency  String
    
    createdAt DateTime @default(now())
  }
  ```

### Phase 2: Training Data Format
Convert corrections to training format:
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are an expert app review triage specialist..."
    },
    {
      "role": "user",
      "content": "[Review text]"
    },
    {
      "role": "assistant",
      "content": "{\"category\": \"Bug Report\", \"urgency\": \"Critical\", \"topic\": \"Checkout Crash\", \"summary\": \"...\"}"
    }
  ]
}
```

## Fine-Tuning Process

### Step 1: Data Preparation
- Extract all reviews with corrections
- Format as JSONL (one JSON object per line)
- Split: 80% training, 20% validation
- Ensure balanced distribution of categories/urgencies

### Step 2: Fine-Tuning
- Use OpenRouter fine-tuning API or Together.ai
- Train on Llama 3 8B base model
- Monitor validation loss
- Early stopping if overfitting

### Step 3: Evaluation
- Test on held-out validation set
- Compare accuracy vs. GPT-4o
- Measure cost per inference
- A/B test in production

### Step 4: Deployment
- Deploy fine-tuned model via OpenRouter
- Update `ACTIONABLE_MODEL` env var
- Monitor accuracy metrics
- Iterate with more corrections

## Success Metrics
- **Accuracy**: >95% category accuracy (vs. current ~70-80%)
- **Cost**: <$0.001 per review (vs. GPT-4o ~$0.01)
- **Speed**: <500ms per review (vs. GPT-4o ~2s)

## Timeline
- **Month 1-2**: Collect 1,000+ corrections
- **Month 3**: Fine-tune first model
- **Month 4**: Evaluate and iterate
- **Month 5+**: Continuous improvement with more data

