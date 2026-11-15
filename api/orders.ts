import type { IncomingMessage, ServerResponse } from 'node:http';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: unknown) => void;
}

interface OrderPayload {
  orderCode?: unknown;
  name?: unknown;
  contact?: unknown;
  email?: unknown;
  projectType?: unknown;
  budget?: unknown;
  timeline?: unknown;
  details?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_CODE_REGEX = /^ORD-[A-Z0-9]{2,20}$/;

function sanitizeField(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function resolveDiscordWebhookUrl(): string | null {
  const envUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (
    envUrl &&
    (envUrl.startsWith('https://discord.com/api/webhooks/') ||
      envUrl.startsWith('https://discordapp.com/api/webhooks/'))
  ) {
    return envUrl;
  }
  return null;
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readBody(req: VercelRequest): Promise<OrderPayload> {
  if (req.body && typeof req.body === 'object') {
    return req.body as OrderPayload;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as OrderPayload;
    } catch {
      return {};
    }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw) as OrderPayload;
  } catch {
    return {};
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await readBody(req);

    const incomingOrderCode = sanitizeField(body.orderCode, 24);
    const name = sanitizeField(body.name, 100);
    const contact = sanitizeField(body.contact, 150);
    const email = sanitizeField(body.email, 150);
    const projectType = sanitizeField(body.projectType, 100);
    const budget = sanitizeField(body.budget, 100);
    const timeline = sanitizeField(body.timeline, 100);
    const details = sanitizeField(body.details, 1800);

    if (name.length < 2) {
      return sendJson(res, 400, {
        error: 'Захиалагчийн нэрээ зөв оруулна уу (хамгийн багадаа 2 тэмдэгт).',
      });
    }

    if (contact.length < 4) {
      return sendJson(res, 400, {
        error: 'Холбоо барих утас, Discord эсвэл сошиал хаягаа оруулна уу.',
      });
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return sendJson(res, 400, {
        error: 'И-мэйл хаягийн загвар буруу байна.',
      });
    }

    if (!projectType) {
      return sendJson(res, 400, {
        error: 'Хийлгэх вэб сайтын төрлөө сонгоно уу.',
      });
    }

    if (details.length < 10) {
      return sendJson(res, 400, {
        error: 'Төслийн дэлгэрэнгүй тайлбарыг дор хаяж 10 тэмдэгтээр бичнэ үү.',
      });
    }

    const webhookUrl = resolveDiscordWebhookUrl();
    if (!webhookUrl) {
      return sendJson(res, 503, {
        error:
          'Discord webhook тохируулаагүй байна. Environment Variables хэсэгт DISCORD_WEBHOOK_URL нэмнэ үү.',
      });
    }

    const orderId = ORDER_CODE_REGEX.test(incomingOrderCode)
      ? incomingOrderCode
      : `ORD-${Date.now().toString(36).toUpperCase()}`;

    const discordEmbed = {
      username: 'Вэб Захиалга Бот',
      embeds: [
        {
          title: `Шинэ вэб сайт захиалга (${orderId})`,
          color: 0x22d3ee,
          fields: [
            { name: 'Захиалагч', value: name, inline: true },
            { name: 'Холбоо барих', value: contact, inline: true },
            {
              name: 'И-мэйл',
              value: email || 'Оруулаагүй',
              inline: true,
            },
            { name: 'Вэб сайтын төрөл', value: projectType, inline: true },
            {
              name: 'Төсөв',
              value: budget || 'Тохиролцоно',
              inline: true,
            },
            {
              name: 'Хугацаа',
              value: timeline || 'Тохиролцоно',
              inline: true,
            },
            {
              name: 'Дэлгэрэнгүй хүсэлт',
              value: details,
              inline: false,
            },
          ],
          footer: {
            text: 'Өлзийтогтох Портфолио · Вэб захиалгын систем',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const webhookResponse = await fetch(`${webhookUrl}?wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordEmbed),
    });

    if (!webhookResponse.ok) {
      return sendJson(res, 502, {
        error:
          'Discord суваг руу илгээхэд алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.',
      });
    }

    return sendJson(res, 201, {
      success: true,
      orderId,
    });
  } catch {
    return sendJson(res, 500, {
      error: 'Сервер дээр алдаа гарлаа. Дахин оролдоно уу.',
    });
  }
}
