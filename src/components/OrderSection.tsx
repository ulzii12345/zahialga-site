import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';

const PROJECT_TYPES = [
  'Танилцуулга сайт',
  'Портфолио / Блог',
  'Бизнес / Байгууллага',
  'Тусгай интерактив вэб',
] as const;

const BUDGET_OPTIONS = [
  '100,000₮ – 250,000₮',
  '250,000₮ – 500,000₮',
  '500,000₮ – 1,000,000₮',
  'Тохиролцоно',
] as const;

const TIMELINE_OPTIONS = [
  'Яаралтай (3–5 хоног)',
  'Энгийн (1–2 долоо хоног)',
  'Яарахгүй (Тохиролцоно)',
] as const;

const ORDER_STEPS = [
  {
    number: '01',
    title: 'Хүсэлт илгээх',
    description:
      'Сайтын төрөл, зорилго болон холбоо барих мэдээллээ маягтаар илгээнэ.',
  },
  {
    number: '02',
    title: 'Firestore & Discord бүртгэл',
    description:
      'Таны захиалга Firebase өгөгдлийн санд хадгалагдаж, миний Discord сувагт шууд очно.',
  },
  {
    number: '03',
    title: 'Бүтээх ба хүлээлгэн өгөх',
    description:
      'Хурдан, гар утсанд ээлтэй орчин үеийн вэб сайт бүтээж хүлээлгэн өгнө.',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  contact?: string;
  email?: string;
  details?: string;
}

interface SubmittedReceipt {
  orderId: string;
  name: string;
  projectType: string;
  contact: string;
}

function generateOrderCode(): string {
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ORD-${timePart}${randPart}`.slice(0, 20);
}

export function OrderSection() {
  const { user, isAdmin, setIsPortalOpen } = useFirebase();

  const [projectType, setProjectType] = useState<string>(PROJECT_TYPES[0]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState<string>(BUDGET_OPTIONS[0]);
  const [timeline, setTimeline] = useState<string>(TIMELINE_OPTIONS[1]);
  const [details, setDetails] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Нэрээ оруулна уу (хамгийн багадаа 2 тэмдэгт).';
    }
    if (contact.trim().length < 4) {
      nextErrors.contact =
        'Утасны дугаар, Discord эсвэл сошиал хаягаа оруулна уу.';
    }
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'И-мэйл хаягийн загвар буруу байна.';
    }
    if (details.trim().length < 10) {
      nextErrors.details =
        'Хийлгэх сайтын тухай дор хаяж 10 тэмдэгтээр тайлбарлана уу.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const orderCode = generateOrderCode();
    const cleanName = name.trim().slice(0, 100);
    const cleanContact = contact.trim().slice(0, 150);
    const cleanEmail = email.trim().slice(0, 150);
    const cleanDetails = details.trim().slice(0, 1800);
    const customerUid = user && user.emailVerified ? user.uid : '';

    try {
      try {
        await setDoc(doc(db, 'orders', orderCode), {
          orderCode,
          name: cleanName,
          contact: cleanContact,
          email: cleanEmail,
          projectType,
          budget,
          timeline,
          details: cleanDetails,
          status: 'new',
          adminNote: '',
          customerUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        handleFirestoreError(
          firestoreErr,
          OperationType.CREATE,
          `orders/${orderCode}`
        );
      }

      // Send real-time Discord webhook alert via server route (non-blocking if Discord fails)
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderCode,
            name: cleanName,
            contact: cleanContact,
            email: cleanEmail,
            projectType,
            budget,
            timeline,
            details: cleanDetails,
          }),
        });
      } catch {
        // Order is already persisted safely in Firestore
      }

      setReceipt({
        orderId: orderCode,
        name: cleanName,
        projectType,
        contact: cleanContact,
      });
    } catch {
      setServerError(
        'Захиалгыг хадгалахад алдаа гарлаа. Интернет холболтоо шалгаад дахин оролдоно уу.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setName('');
    setContact('');
    setEmail('');
    setDetails('');
    setErrors({});
    setServerError('');
  };

  return (
    <section
      id="order"
      className="py-20 border-t border-zinc-800/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 tracking-wide mb-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Вэб сайт захиалга</span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span className="text-zinc-400">Firebase & Discord</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display text-balance">
                Вэб сайт хийлгэх хүсэлт илгээх
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mt-3">
                Та өөрийн портфолио, танилцуулга хуудас эсвэл интерактив вэб
                аппликейшн хийлгэхийг хүсвэл маягтыг бөглөнө үү. Таны захиалга
                Firebase-д хадгалагдаж, Discord сувагт шууд очно.
              </p>
            </div>

            <div className="divide-y divide-zinc-800/80 border-t border-b border-zinc-800/80">
              {ORDER_STEPS.map((step) => (
                <div key={step.number} className="py-4 flex items-start gap-4">
                  <span className="font-mono text-sm font-bold text-zinc-300 tabular-nums pt-0.5 shrink-0">
                    {step.number}.
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPortalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors whitespace-nowrap"
              >
                <ClipboardList className="w-4 h-4 text-zinc-300 shrink-0" />
                <span>
                  {isAdmin
                    ? 'Админ захиалгын самбар нээх'
                    : user
                      ? 'Миний илгээсэн захиалгууд'
                      : 'Захиалга хянах / Google нэвтрэх'}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#09090b] border border-zinc-800 p-6 sm:p-8">
              {receipt ? (
                <div className="py-6 space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-zinc-300">
                      Захиалгын дугаар: {receipt.orderId}
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display">
                      Таны захиалга амжилттай бүртгэгдлээ
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Баярлалаа, {receipt.name}. Таны хүсэлт Firebase өгөгдлийн
                      санд хадгалагдаж, миний Discord суваг руу мэдэгдэл
                      илгээгдлээ.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80 text-xs">
                    <div className="p-3.5 rounded-xl bg-zinc-900/70 space-y-1">
                      <div className="text-zinc-500">Сонгосон төрөл</div>
                      <div className="text-white font-medium">
                        {receipt.projectType}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-900/70 space-y-1">
                      <div className="text-zinc-500">Холбоо барих</div>
                      <div className="text-white font-medium truncate">
                        {receipt.contact}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-black bg-zinc-200 hover:bg-white rounded-xl transition-colors"
                    >
                      Шинэ захиалга өгөх
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPortalOpen(true)}
                      className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                    >
                      Захиалгын самбар харах
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <span className="block text-xs font-medium text-zinc-300 mb-2">
                      Хийлгэх вэб сайтын төрөл
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PROJECT_TYPES.map((type) => {
                        const isSelected = projectType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setProjectType(type)}
                            className={`px-3.5 py-2.5 text-xs font-medium rounded-xl border text-left transition-colors whitespace-nowrap truncate ${
                              isSelected
                                ? 'bg-zinc-200/10 border-zinc-300 text-white'
                                : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="order-name"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Таны нэр <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="order-name"
                        type="text"
                        maxLength={100}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) {
                            setErrors((prev) => ({ ...prev, name: undefined }));
                          }
                        }}
                        placeholder="Жишээ нь: Бат-Эрдэнэ"
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-rose-400">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="order-contact"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Утас, Discord эсвэл сошиал хаяг{' '}
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="order-contact"
                        type="text"
                        maxLength={150}
                        value={contact}
                        onChange={(e) => {
                          setContact(e.target.value);
                          if (errors.contact) {
                            setErrors((prev) => ({
                              ...prev,
                              contact: undefined,
                            }));
                          }
                        }}
                        placeholder="Жишээ нь: 9911xxxx эсвэл @discord"
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                      />
                      {errors.contact && (
                        <p className="mt-1.5 text-xs text-rose-400">
                          {errors.contact}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="order-email"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        И-мэйл (заавал биш)
                      </label>
                      <input
                        id="order-email"
                        type="email"
                        maxLength={150}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors((prev) => ({
                              ...prev,
                              email: undefined,
                            }));
                          }
                        }}
                        placeholder="name@example.com"
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-rose-400">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="order-budget"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Төсөв
                      </label>
                      <select
                        id="order-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-400 transition-colors"
                      >
                        {BUDGET_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="order-timeline"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Хугацаа
                      </label>
                      <select
                        id="order-timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-400 transition-colors"
                      >
                        {TIMELINE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="order-details"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      Сайтын тухай дэлгэрэнгүй тайлбар{' '}
                      <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      id="order-details"
                      rows={4}
                      maxLength={1800}
                      value={details}
                      onChange={(e) => {
                        setDetails(e.target.value);
                        if (errors.details) {
                          setErrors((prev) => ({
                            ...prev,
                            details: undefined,
                          }));
                        }
                      }}
                      placeholder="Ямар хуудсууд, өнгө загвар, онцлог функцүүд хэрэгтэй байгаагаа бичнэ үү..."
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-y"
                    />
                    {errors.details && (
                      <p className="mt-1.5 text-xs text-rose-400">
                        {errors.details}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs text-rose-200 flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-zinc-500">
                      Firebase Firestore-д хадгалагдаж, Discord мэдэгдэл очно.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-zinc-200 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Илгээж байна...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Захиалга илгээх</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
