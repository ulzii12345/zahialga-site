import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

dotenv.config({ path: path.resolve(__dirname, '.env') });
if (!resolveDiscordWebhookUrl()) {
  dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
}

function resolvePort(): number {
  const portFlagIndex = process.argv.indexOf('--port');
  if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
    const parsed = Number(process.argv[portFlagIndex + 1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const envPort = Number(process.env.PORT);
  return Number.isFinite(envPort) && envPort > 0 ? envPort : 3000;
}

const PORT = resolvePort();

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const body = (req.body || {}) as OrderPayload;

      const incomingOrderCode = sanitizeField(body.orderCode, 24);
      const name = sanitizeField(body.name, 100);
      const contact = sanitizeField(body.contact, 150);
      const email = sanitizeField(body.email, 150);
      const projectType = sanitizeField(body.projectType, 100);
      const budget = sanitizeField(body.budget, 100);
      const timeline = sanitizeField(body.timeline, 100);
      const details = sanitizeField(body.details, 1800);

      if (name.length < 2) {
        return res.status(400).json({
          error: 'Захиалагчийн нэрээ зөв оруулна уу (хамгийн багадаа 2 тэмдэгт).',
        });
      }

      if (contact.length < 4) {
        return res.status(400).json({
          error: 'Холбоо барих утас, Discord эсвэл сошиал хаягаа оруулна уу.',
        });
      }

      if (email && !EMAIL_REGEX.test(email)) {
        return res.status(400).json({
          error: 'И-мэйл хаягийн загвар буруу байна.',
        });
      }

      if (!projectType) {
        return res.status(400).json({
          error: 'Хийлгэх вэб сайтын төрлөө сонгоно уу.',
        });
      }

      if (details.length < 10) {
        return res.status(400).json({
          error: 'Төслийн дэлгэрэнгүй тайлбарыг дор хаяж 10 тэмдэгтээр бичнэ үү.',
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

      const webhookUrl = resolveDiscordWebhookUrl();
      if (!webhookUrl) {
        return res.status(503).json({
          error:
            'Discord webhook тохируулаагүй байна. AI Studio Secrets хэсэгт DISCORD_WEBHOOK_URL нэмнэ үү.',
        });
      }

      const webhookResponse = await fetch(`${webhookUrl}?wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordEmbed),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text().catch(() => '');
        console.error(
          'Discord webhook rejected order:',
          webhookResponse.status,
          errorText
        );
        return res.status(502).json({
          error:
            'Discord суваг руу илгээхэд алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.',
        });
      }

      return res.status(201).json({
        success: true,
        orderId,
      });
    } catch (err) {
      console.error('Order submission error:', err);
      return res.status(500).json({
        error: 'Сервер дээр алдаа гарлаа. Дахин оролдоно уу.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
