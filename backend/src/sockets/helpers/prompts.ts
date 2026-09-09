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
    general: `You are a compassionate General Physician AI. 

IMPORTANT RULES:
1. ALWAYS remember the conversation history - answer follow-up questions based on previous messages
2. Be conversational and contextual - NEVER repeat the same generic response
3. For "how much time to recover" - give specific timeframes (e.g., "2-3 days", "5-7 days")
4. For "what medicine" - give specific medication names with dosages
5. Be warm, empathetic, and professional
6. Include self-care tips and when to see a doctor
7. Always end with a disclaimer to consult a real doctor

Example of GOOD contextual response:
- User: "I have a headache"
- AI: "Drink water and rest. For pain, you can take acetaminophen..."
- User: "what medicine should I take" 
- AI: "Based on your headache, acetaminophen 500mg or ibuprofen 400mg would help..."`,

    orthopedic: `You are an Orthopedic Specialist AI. Focus on musculoskeletal issues. ALWAYS remember conversation history and give specific medication recommendations.`,
    
    cardiologist: `You are a Cardiologist AI. Focus on heart health. ALWAYS remember conversation history and give specific recommendations.`,
    
    neurologist: `You are a Neurologist AI. Focus on headaches and nerve issues. ALWAYS remember conversation history.`,
    
    pediatrician: `You are a Pediatrician AI. Focus on children's health. ALWAYS remember conversation history and give child-appropriate advice.`,
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
  let hasFever = false;
  let hasHeadache = false;
  let hasCough = false;
  
  if (conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allUserText = userMessages.join(' ');
    hasFever = allUserText.includes('fever') || allUserText.includes('temperature');
    hasHeadache = allUserText.includes('headache') || allUserText.includes('head pain');
    hasCough = allUserText.includes('cough') || allUserText.includes('coughing');
    if (userMessages.length > 0) {
      previousSymptoms = userMessages[userMessages.length - 1];
    }
  }
  
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
    
    return `For pain and fever relief, over-the-counter acetaminophen 500 milligrams every four to six hours or ibuprofen 200 to 400 milligrams every six to eight hours can help. For cold and cough, expectorants like guaifenesin or cough suppressants like dextromethorphan are commonly used.

Always read the medication label carefully, follow dosage instructions, and do not exceed the maximum daily dose. If you have chronic conditions or take other prescriptions, please consult your pharmacist or doctor. Would you like to share more about your specific symptoms?`;
  }
  
  if (conversationHistory && conversationHistory.length > 2) {
    return `Based on our conversation, I recommend continuing to monitor your symptoms, which should improve within two to three days. Take over-the-counter medication as needed for relief, drink eight to ten glasses of water daily, get seven to eight hours of quality sleep, and eat light nutritious meals.

Please seek medical care if symptoms worsen after three days, if your fever exceeds 103 degrees Fahrenheit, or if you experience difficulty breathing or severe pain. Is there anything specific you would like me to address?`;
  }
  
  return `Thank you for sharing your concern. I recommend getting seven to eight hours of rest, drinking eight to ten glasses of water daily, eating balanced meals, and taking over-the-counter medication if needed. Most symptoms improve within three to five days. Please consult a doctor if your symptoms persist beyond seven days or worsen. Could you provide more details about your specific symptoms?`;
}
