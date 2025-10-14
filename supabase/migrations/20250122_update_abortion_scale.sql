-- Update abortion scale in system prompts
UPDATE system_prompts
SET 
  assessor_prompt = REPLACE(
    REPLACE(
      REPLACE(assessor_prompt, 
        '2. **Abortion** - From partial birth abortion allowed (0) to no exceptions (6)',
        '2. **Abortion** - From no gestational limit (0) to total ban (6)'
      ),
      'Abortion: partial birth abortion',
      'Abortion: no gestational limit'
    ),
    'Abortion: no exceptions allowed',
    'Abortion: total ban'
  ),
  updated_at = NOW()
WHERE assessor_prompt LIKE '%partial birth abortion%';
