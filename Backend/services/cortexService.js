const {
  ChatValidationError,
  UpstreamApiError,
  validateActionPayload
} = require('./chatSchemas');

const SYSTEM_PROMPT = `
You are an API action planner for an EV charging rental backend.
Return strict JSON only. Do not return markdown. Do not add any explanation text.

Allowed actions:
1) search_listings
Schema: {"action":"search_listings","filters":{"city"?:string,"chargerType"?:string,"maxDistanceKm"?:number,"latitude"?:number,"longitude"?:number,"date"?:string,"startTime"?:string,"endTime"?:string,"minPrice"?:number,"maxPrice"?:number}}

2) get_my_reservations
Schema: {"action":"get_my_reservations","filters":{"status"?:string}}

3) cancel_reservation
Schema: {"action":"cancel_reservation","reservationId":"<mongodb_object_id>"}

4) extend_reservation
Schema: {"action":"extend_reservation","reservationId":"<mongodb_object_id>","additionalScheduleIds":["<mongodb_object_id>"]}
`.trim();

const getConfig = () => {
  const url = process.env.SNOWFLAKE_CORTEX_URL;
  const apiKey = process.env.SNOWFLAKE_CORTEX_API_KEY;
  const model = process.env.SNOWFLAKE_CORTEX_MODEL || 'snowflake-arctic';
  const timeoutMs = Number(process.env.SNOWFLAKE_TIMEOUT_MS || 15000);

  if (!url || !apiKey) {
    throw new UpstreamApiError('Snowflake Cortex credentials are missing');
  }

  return { url, apiKey, model, timeoutMs };
};

const extractJsonString = (value) => {
  if (typeof value !== 'string') {
    throw new ChatValidationError('Cortex response content is not a string');
  }

  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) return fencedMatch[1].trim();

  return trimmed;
};

const parseCortexAction = (rawText) => {
  const jsonText = extractJsonString(rawText);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new ChatValidationError('Cortex did not return valid JSON');
  }

  return validateActionPayload(parsed);
};

const extractResponseContent = (responseData) => {
  if (typeof responseData?.output_text === 'string') return responseData.output_text;

  if (Array.isArray(responseData?.choices) && responseData.choices[0]) {
    const firstChoice = responseData.choices[0];
    if (typeof firstChoice?.message?.content === 'string') return firstChoice.message.content;
    if (Array.isArray(firstChoice?.message?.content) && firstChoice.message.content[0]?.text) {
      return firstChoice.message.content[0].text;
    }
    if (typeof firstChoice?.text === 'string') return firstChoice.text;
  }

  if (Array.isArray(responseData?.messages) && responseData.messages[0]?.content) {
    return responseData.messages[0].content;
  }

  throw new UpstreamApiError('Unexpected Cortex response format');
};

const extractFromSseEvent = (eventPayload) => {
  if (typeof eventPayload?.output_text === 'string') return eventPayload.output_text;

  if (Array.isArray(eventPayload?.choices) && eventPayload.choices[0]) {
    const choice = eventPayload.choices[0];
    if (typeof choice?.delta?.content === 'string') return choice.delta.content;
    if (typeof choice?.message?.content === 'string') return choice.message.content;
    if (typeof choice?.text === 'string') return choice.text;
  }

  return '';
};

const parseSseResponseText = (rawText) => {
  const lines = String(rawText || '').split('\n');
  const contentParts = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;

    const payloadText = trimmed.replace(/^data:\s*/, '').trim();
    if (!payloadText || payloadText === '[DONE]') continue;

    try {
      const payload = JSON.parse(payloadText);
      const piece = extractFromSseEvent(payload);
      if (piece) contentParts.push(piece);
    } catch (error) {
      // Ignore malformed event chunks and continue parsing remaining events.
    }
  }

  if (contentParts.length === 0) {
    throw new UpstreamApiError('Could not parse SSE response from Cortex');
  }

  return contentParts.join('');
};

const parseResponseToRawContent = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();

  if (contentType.includes('text/event-stream') || rawBody.trim().startsWith('data:')) {
    return parseSseResponseText(rawBody);
  }

  try {
    const data = JSON.parse(rawBody);
    return extractResponseContent(data);
  } catch (error) {
    throw new UpstreamApiError('Unexpected non-JSON response from Cortex');
  }
};

const inferActionFromMessage = async (message) => {
  const { url, apiKey, model, timeoutMs } = getConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0,
        stream: false
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new UpstreamApiError(`Cortex API request failed (${response.status}): ${bodyText}`);
    }

    const rawContent = await parseResponseToRawContent(response);
    return parseCortexAction(rawContent);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new UpstreamApiError('Cortex API request timed out');
    }
    if (error.statusCode) throw error;
    throw new UpstreamApiError(error.message || 'Cortex API request failed');
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  inferActionFromMessage,
  parseCortexAction
};
