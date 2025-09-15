/**
 * Telegram Bot Integration for Pets IQ
 * Connects Telegram users to the veterinary AI assistant
 */

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  date: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: { id: number; first_name: string; username?: string; };
    message: TelegramMessage;
    data: string;
  };
}

interface UserSession {
  chatId: number;
  state: 'waiting_pet_type' | 'waiting_age' | 'waiting_symptoms' | 'complete';
  petType?: string;
  petAge?: string;
  symptoms?: string;
}

// In-memory session storage (in production, use Redis or database)
const userSessions = new Map<number, UserSession>();

// Telegram Bot Token (from environment variable)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN not set - Telegram bot disabled');
}

/**
 * Send message to Telegram user
 */
async function sendTelegramMessage(chatId: number, text: string, keyboard?: any) {
  if (!TELEGRAM_BOT_TOKEN) return;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

/**
 * Create inline keyboard for pet type selection
 */
function createPetTypeKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🐕 Dog', callback_data: 'pet_dog' },
        { text: '🐱 Cat', callback_data: 'pet_cat' }
      ],
      [
        { text: '🐦 Bird', callback_data: 'pet_bird' },
        { text: '🐰 Rabbit', callback_data: 'pet_rabbit' }
      ],
      [
        { text: '🐾 Other', callback_data: 'pet_other' }
      ]
    ]
  };
}

/**
 * Create inline keyboard for pet age selection
 */
function createPetAgeKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👶 Under 6 months', callback_data: 'age_under_6_months' },
        { text: '🐕 6 months - 1 year', callback_data: 'age_6_months_1_year' }
      ],
      [
        { text: '🐕‍🦺 1-2 years', callback_data: 'age_1_2_years' },
        { text: '🐕 3-5 years', callback_data: 'age_3_5_years' }
      ],
      [
        { text: '🐕‍⚕️ 6-8 years', callback_data: 'age_6_8_years' },
        { text: '🐕‍🦽 9-12 years', callback_data: 'age_9_12_years' }
      ],
      [
        { text: '👴 Over 12 years', callback_data: 'age_over_12_years' }
      ]
    ]
  };
}

/**
 * Handle /start command
 */
function handleStartCommand(chatId: number, firstName: string) {
  // Initialize user session
  userSessions.set(chatId, {
    chatId,
    state: 'waiting_pet_type'
  });

  const welcomeMessage = `🩺 *Welcome to Pets IQ!*

Hi ${firstName}! I'm your AI veterinary assistant. I can help assess your pet's symptoms and provide guidance on whether they need immediate veterinary care.

⚠️ *Important:* I provide information only, not medical diagnosis. Always consult a veterinarian for serious concerns.

Let's start! What type of pet do you have?`;

  sendTelegramMessage(chatId, welcomeMessage, createPetTypeKeyboard());
}

/**
 * Handle callback queries (button presses)
 */
async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const session = userSessions.get(chatId);

  if (!session) {
    sendTelegramMessage(chatId, "Please start over with /start");
    return;
  }

  // Handle pet type selection
  if (data.startsWith('pet_')) {
    const petType = data.replace('pet_', '');
    session.petType = petType;
    session.state = 'waiting_age';
    userSessions.set(chatId, session);

    const petEmoji: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      rabbit: '🐰',
      other: '🐾'
    };
    const selectedEmoji = petEmoji[petType] || '🐾';

    sendTelegramMessage(
      chatId, 
      `Great! You have a ${selectedEmoji} ${petType}.\n\nHow old is your ${petType}?`,
      createPetAgeKeyboard()
    );
  }

  // Handle age selection
  else if (data.startsWith('age_')) {
    const ageValue = data.replace('age_', '').replace(/_/g, ' ');
    session.petAge = ageValue;
    session.state = 'waiting_symptoms';
    userSessions.set(chatId, session);

    const petEmoji: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      rabbit: '🐰',
      other: '🐾'
    };
    const selectedEmoji = petEmoji[session.petType || 'other'] || '🐾';

    sendTelegramMessage(
      chatId,
      `Perfect! Your ${selectedEmoji} ${session.petType} is ${ageValue}.\n\n💬 *Now, please describe the symptoms or concerns you have about your pet.*\n\nFor example:\n• "My dog is vomiting and not eating"\n• "My cat is limping and seems in pain"\n• "My bird is not singing and looks tired"\n\nJust type your message below:`
    );
  }
}

/**
 * Handle symptoms message and call veterinary AI
 */
async function handleSymptomsMessage(chatId: number, symptoms: string) {
  const session = userSessions.get(chatId);
  if (!session || !session.petType || !session.petAge) {
    sendTelegramMessage(chatId, "Please start over with /start");
    return;
  }

  session.symptoms = symptoms;
  session.state = 'complete';
  userSessions.set(chatId, session);

  // Show processing message
  sendTelegramMessage(chatId, "🔍 *Analyzing symptoms...*\n\nLet me assess your pet's condition using our veterinary AI system.");

  try {
    // Call the existing API assessment endpoint
    const response = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petType: session.petType,
        petAge: session.petAge,
        symptoms: symptoms
      })
    });

    if (!response.ok) {
      throw new Error(`Assessment failed: ${response.status}`);
    }

    const assessment = await response.json();
    
    // Format response for Telegram
    const triageEmojis: Record<string, string> = {
      emergency: '🚨',
      see_vet_soon: '⚠️',
      ok: '✅'
    };
    const triageEmoji = triageEmojis[assessment.triage] || '🩺';

    const urgencyTexts: Record<string, string> = {
      emergency: '*🚨 EMERGENCY*',
      see_vet_soon: '*⚠️ See Vet Soon*',
      ok: '*✅ Monitor at Home*'
    };
    const urgencyText = urgencyTexts[assessment.triage] || 'Assessment Complete';

    let responseMessage = `${triageEmoji} *Assessment Complete*\n\n`;
    responseMessage += `**Pet:** ${session.petType} (${session.petAge})\n`;
    responseMessage += `**Status:** ${urgencyText}\n\n`;
    responseMessage += `**Summary:** ${assessment.summary}\n\n`;
    
    responseMessage += `**Recommended Actions:**\n`;
    assessment.advice.forEach((advice: string, index: number) => {
      responseMessage += `${index + 1}. ${advice}\n`;
    });

    responseMessage += `\n**When to see a vet:** ${assessment.when_to_see_vet}\n\n`;
    responseMessage += `⚠️ *${assessment.disclaimer}*`;

    // Send assessment result
    sendTelegramMessage(chatId, responseMessage);

    // Add restart option
    setTimeout(() => {
      sendTelegramMessage(
        chatId, 
        "Need another assessment? Just type /start to begin again! 🩺"
      );
    }, 2000);

  } catch (error) {
    console.error('Assessment error:', error);
    sendTelegramMessage(
      chatId,
      "❌ Sorry, there was an error processing your request. Please try again with /start"
    );
  }
}

/**
 * Process incoming Telegram update
 */
export async function processTelegramUpdate(update: TelegramUpdate) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot disabled - no token provided');
    return;
  }

  // Handle callback queries (button presses)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  // Handle regular messages
  if (!update.message?.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text;
  const firstName = update.message.from.first_name;

  // Handle commands
  if (text === '/start') {
    handleStartCommand(chatId, firstName);
    return;
  }

  if (text === '/help') {
    sendTelegramMessage(chatId, `🩺 *Pets IQ - AI Veterinary Assistant*

**Commands:**
/start - Begin new pet assessment
/help - Show this help message

**How it works:**
1. Select your pet type
2. Choose your pet's age
3. Describe symptoms
4. Get AI veterinary assessment

⚠️ *Remember: This is for guidance only. Always consult a real veterinarian for serious health concerns.*`);
    return;
  }

  // Handle symptoms input
  const session = userSessions.get(chatId);
  if (session?.state === 'waiting_symptoms') {
    await handleSymptomsMessage(chatId, text);
  } else {
    // User sent message without starting assessment
    sendTelegramMessage(
      chatId,
      "Hi! 👋 I'm Pets IQ, your AI veterinary assistant.\n\nType /start to begin a pet health assessment! 🩺"
    );
  }
}

/**
 * Set webhook URL for Telegram bot
 */
export async function setTelegramWebhook(webhookUrl: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Cannot set webhook - TELEGRAM_BOT_TOKEN not provided');
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    const result = await response.json();
    if (result.ok) {
      console.log('✅ Telegram webhook set successfully');
      return true;
    } else {
      console.error('❌ Failed to set Telegram webhook:', result.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Error setting Telegram webhook:', error);
    return false;
  }
}