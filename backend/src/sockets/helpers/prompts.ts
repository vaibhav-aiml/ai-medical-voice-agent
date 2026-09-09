import { Specialist } from '../../types/consultation.types';

export const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

export function getSystemPrompt(specialistType: string, contextPrompt?: string, language: string = 'en'): string {
  const basePrompts: Record<string, string> = {
    general: `You are an expert, compassionate clinical General Physician AI providing real-time telemedicine consultations.

CLINICAL CONSULTATION RULES:
1. HIGHLY SPECIFIC AND MEANINGFUL: Directly analyze the exact symptoms, activities, or medications the patient mentions. Never output generic boilerplate or vague platitudes. If the patient mentions weightlifting, deadlifts, or exercise, immediately address acute musculoskeletal strain, lumbar spinal dynamics, or delayed onset muscle soreness.
2. BRIEF, CRISP AND STRUCTURED: Keep responses concise and focused (around 100 to 140 words). Patients want direct, actionable answers without overwhelming walls of text.
3. CONVERSATIONAL CLINICAL MEMORY: Fully remember prior context and follow-up details from previous messages in this consultation.
4. ACTIONABLE PROTOCOL:
   - Provide a clear initial assessment of likely causes.
   - Give direct self-care advice (such as relative rest, cold or warm therapy, hydration).
   - Offer specific over-the-counter medication options with standard adult dosages and cautions when appropriate.
   - Clearly state any red flag warning signs that require emergency medical evaluation.
5. PROFESSIONAL AND REASSURING: Provide warm, empathetic guidance while reminding the patient to seek in-person evaluation if symptoms worsen.`,

    orthopedic: `You are an expert clinical Orthopedic and Sports Medicine Specialist AI.
Focus on musculoskeletal conditions, joints, bones, spine, and workout injuries (such as lifting injuries, deadlift back pain, tendonitis, ligament sprains, and muscle tears).
CLINICAL GUIDELINES:
1. Assess likely biomechanical or muscular causes directly related to the user's specific exercise or movement.
2. Provide immediate targeted self-care: relative rest, ice or heat protocols, and avoiding aggravating positions.
3. Detail specific anti-inflammatory or pain relief options with adult dosages and food instructions (for example, Ibuprofen 400 to 600 milligrams with food, or Naproxen 220 milligrams).
4. Highlight critical red flags: sciatica with pain radiating down the leg, numbness or tingling in extremities or groin, inability to bear weight, or sudden popping sensations.
5. Keep explanations brief, concise (under 130 words), and highly actionable.`,

    cardiologist: `You are an expert clinical Cardiologist AI.
Focus on cardiovascular symptoms, blood pressure, palpitations, chest sensations, and shortness of breath.
CLINICAL GUIDELINES:
1. Immediately prioritize triage: identify any potential emergency signs (crushing chest pain, pain radiating to jaw or left arm, diaphoresis, severe breathlessness).
2. For non-emergent inquiries, provide brief, reassuring, evidence-based guidance.
3. Outline lifestyle factors, hydration, sodium intake, and monitoring.
4. Keep answers brief (under 130 words), direct, and specific.`,

    neurologist: `You are an expert clinical Neurologist AI.
Focus on headaches, migraines, nerve pain, neuropathy, dizziness, and neurological symptoms.
CLINICAL GUIDELINES:
1. Differentiate tension headaches, migraines, and cervical spine or nerve involvement.
2. Provide immediate non-pharmacological and OTC medication recommendations with dosages.
3. Highlight neurological red flags: thunderclap headache, focal weakness, vision changes, confusion.
4. Keep answers brief (under 130 words), direct, and focused.`,

    pediatrician: `You are an expert clinical Pediatrician AI.
Focus on pediatric health, infants, children, and adolescents.
CLINICAL GUIDELINES:
1. Provide gentle, precise, child-appropriate clinical advice.
2. Detail pediatric fever management, hydration, and monitoring.
3. Emphasize weight-based dosing for pediatric medications under a doctor's care.
4. Highlight red flags: lethargy, dehydration, respiratory distress, persistent high fever.
5. Keep answers concise, reassuring, and brief (under 130 words).`,
  };
  
  let prompt = basePrompts[specialistType] || basePrompts.general;
  if (contextPrompt) {
    prompt += contextPrompt;
  }

  prompt += `\n\nVOICE AND SPEECH FORMATTING INSTRUCTION:
Your response will be read aloud to the patient by a speech synthesizer. Write in clear, natural, spoken sentences. Do NOT use markdown symbols, asterisks (no bold or italic markers), hash signs, bullet points, emojis, or markdown tables. Use standard sentence punctuation and write lists naturally as complete sentences.`;

  if (language && language !== 'en') {
    const langName = languageNames[language] || language;
    prompt += `\n\nIMPORTANT: The patient's preferred language is ${langName}. You MUST write your entire response in ${langName}. Do not respond in English.`;
  }
  
  return prompt;
}

export function getFallbackResponse(
  symptoms: string, 
  specialistType: string, 
  conversationHistory?: Array<{role: string, content: string}>
): string {
  const lowerQuestion = symptoms.toLowerCase();
  
  let previousSymptoms = '';
  let hasFever = lowerQuestion.includes('fever') || lowerQuestion.includes('temperature');
  let hasHeadache = lowerQuestion.includes('headache') || lowerQuestion.includes('head pain');
  let hasCough = lowerQuestion.includes('cough') || lowerQuestion.includes('coughing');
  
  if (conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allUserText = userMessages.join(' ');
    hasFever = hasFever || allUserText.includes('fever') || allUserText.includes('temperature');
    hasHeadache = hasHeadache || allUserText.includes('headache') || allUserText.includes('head pain');
    hasCough = hasCough || allUserText.includes('cough') || allUserText.includes('coughing');
    if (userMessages.length > 0) {
      previousSymptoms = userMessages[userMessages.length - 1];
    }
  }

  // 1. Musculoskeletal, Workout, Deadlift, or Back Pain inquiries
  if (
    lowerQuestion.includes('deadlift') ||
    lowerQuestion.includes('lift') ||
    lowerQuestion.includes('gym') ||
    lowerQuestion.includes('workout') ||
    lowerQuestion.includes('back pain') ||
    lowerQuestion.includes('muscle') ||
    lowerQuestion.includes('strain') ||
    lowerQuestion.includes('sprain') ||
    lowerQuestion.includes('knee') ||
    lowerQuestion.includes('joint')
  ) {
    return `For acute pain following heavy lifting or exercise, the most common cause is a lumbar muscle strain or minor joint irritation.

Immediate self-care involves relative rest from heavy loading for 48 to 72 hours, along with applying cold packs wrapped in a towel for 15 to 20 minutes every 3 hours. For pain and inflammation, over-the-counter ibuprofen 400 milligrams taken with food every 6 to 8 hours, or acetaminophen 500 milligrams every 6 hours can help.

Seek immediate medical attention if you experience pain radiating down your leg, numbness or tingling in the legs or groin, or loss of bladder control. Would you like to share the exact location of your pain?`;
  }
  
  // 2. Recovery Timeline inquiries
  if (lowerQuestion.includes('how much time') || lowerQuestion.includes('recover') || lowerQuestion.includes('how long') || lowerQuestion.includes('when will')) {
    if (hasFever && hasHeadache) {
      return `For fever and headache, recovery typically takes five to seven days. During the first two days symptoms may persist, so rest is crucial. By day three, most symptoms should improve significantly.

To speed recovery, get eight to ten hours of sleep daily, drink plenty of water and electrolytes, eat light nutritious meals, and take acetaminophen or ibuprofen as needed.

Please see a doctor immediately if your fever exceeds 103 degrees Fahrenheit, if symptoms worsen after three days, or if you experience a severe headache with a stiff neck. Would you like specific home care tips?`;
    }
    
    if (hasFever) {
      return `For a fever, recovery usually takes five to seven days. Within 24 to 48 hours the fever should start reducing, and by day three you should feel significantly better.

Be sure to stay hydrated with water and electrolytes, rest in a cool and comfortable room, take fever reducers as needed, and eat light soups. Seek medical care if your fever exceeds 103 degrees Fahrenheit or lasts more than three days. Is there anything specific about your recovery I can help with?`;
    }
    
    return `For minor illness like a cold or mild fever, recovery usually takes three to five days. For moderate symptoms like flu or viral infections, full recovery typically takes five to ten days.

To speed up recovery, rest eight to ten hours daily, drink eight or more glasses of water, eat nutritious foods, and take over-the-counter medications as needed. Please consult a doctor if symptoms worsen or persist beyond seven days. Would you like to share more details about your symptoms?`;
  }
  
  // 3. Medication inquiries
  if (lowerQuestion.includes('medicine') || lowerQuestion.includes('medication') || lowerQuestion.includes('should i take') || lowerQuestion.includes('what can i take')) {
    if (hasFever && hasHeadache) {
      return `For fever and headache, you have two main over-the-counter options.

Option one is acetaminophen, also known as Tylenol. The typical dosage is 500 milligrams every four to six hours, with a maximum of 3000 milligrams per day. It is effective for both fever and headache relief.

Option two is ibuprofen, also known as Advil or Motrin. The typical dosage is 200 to 400 milligrams every six to eight hours, and it should be taken with food.

Important: do not take both medications together. Choose one. You can also apply a cool compress to your forehead, drink ginger or peppermint tea, and rest in a dark, quiet room. Please consult a doctor if your symptoms do not improve.`;
    }
    
    if (hasFever) {
      return `For fever reduction, acetaminophen 500 milligrams every four to six hours is gentle on the stomach and effectively reduces fever. Alternatively, ibuprofen 400 milligrams every six to eight hours reduces both fever and inflammation, and should be taken with food.

Do not exceed the recommended dosage, and choose only one of these medications. In addition, place a cool compress on your forehead, wear light clothing, and stay well hydrated. Seek medical attention if your fever reaches 103 degrees Fahrenheit or higher.`;
    }
    
    return `For acute pain and inflammation relief, over-the-counter ibuprofen 200 to 400 milligrams taken with food every 6 to 8 hours, or acetaminophen 500 milligrams every 4 to 6 hours are standard first-line options.

Always follow package directions, never exceed maximum daily doses, and consult a doctor or pharmacist if you have stomach ulcers, kidney disease, or take other prescriptions. Would you like to share more about what symptoms you are treating?`;
  }
  
  // 4. Multi-turn follow up
  if (conversationHistory && conversationHistory.length > 2) {
    return `Based on our conversation, I recommend continuing to monitor your symptoms, which should improve within two to three days. Take over-the-counter medication as needed for relief, drink eight to ten glasses of water daily, get seven to eight hours of quality sleep, and eat light nutritious meals.

Please seek medical care if symptoms worsen after three days, if your fever exceeds 103 degrees Fahrenheit, or if you experience difficulty breathing or severe pain. Is there anything specific you would like me to address?`;
  }
  
  return `Thank you for sharing your concern. I recommend getting seven to eight hours of rest, drinking eight to ten glasses of water daily, eating balanced meals, and taking over-the-counter medication if needed. Most symptoms improve within three to five days. Please consult a doctor if your symptoms persist beyond seven days or worsen. Could you provide more details about your specific symptoms?`;
}
