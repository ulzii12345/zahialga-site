import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import {
  CheckCircle2,
  Clock,
  LogOut,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';

type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

interface StoredOrder {
  id: string;
  orderCode: string;
  name: string;
  contact: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
  status: OrderStatus;
  adminNote: string;
  customerUid: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Шинэ',
  in_progress: 'Хийгдэж буй',
  completed: 'Дууссан',
  cancelled: 'Цуцалсан',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40',
  in_progress: 'text-amber-300 border-amber-500/40 bg-amber-950/40',
  completed: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40',
  cancelled: 'text-zinc-400 border-zinc-700 bg-zinc-900',
};

function formatTimestamp(ts?: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Саяхан';
  return ts.toDate().toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrdersPortalModal() {
  const {
    user,
    authReady,
    isAdmin,
    isPortalOpen,
    setIsPortalOpen,
    signInWithGoogle,
    signOutUser,
    authError,
  } = useFirebase();

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!isPortalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPortalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPortalOpen, setIsPortalOpen]);

  useEffect(() => {
    if (!isPortalOpen || !authReady || !user) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setActionError('');

    const ordersRef = collection(db, 'orders');
    const ordersQuery = isAdmin
      ? query(ordersRef, orderBy('createdAt', 'desc'))
      : query(ordersRef, where('customerUid', '==', user.uid));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const items: StoredOrder[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data() as Omit<StoredOrder, 'id'>;
          return {
            id: docSnap.id,
            ...d,
          };
        });

        if (!isAdmin) {
          items.sort((a, b) => {
            const aMs = a.createdAt?.toMillis?.() ?? 0;
            const bMs = b.createdAt?.toMillis?.() ?? 0;
            return bMs - aMs;
          });
        }

        setOrders(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setActionError('Захиалгуудыг унших эрх эсвэл холболтын алдаа гарлаа.');
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    return () => unsubscribe();
  }, [isPortalOpen, authReady, user, isAdmin]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((item) => item.status === filter);
  }, [orders, filter]);

  if (!isPortalOpen) return null;

  const handleStatusChange = async (order: StoredOrder, nextStatus: OrderStatus) => {
    if (!isAdmin) return;
    setSavingId(order.id);
    setActionError('');
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setActionError('Төлөв шинэчлэхэд алдаа гарлаа.');
      handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNote = async (order: StoredOrder) => {
    if (!isAdmin) return;
    const nextNote = (noteDrafts[order.id] ?? order.adminNote ?? '')
      .trim()
      .slice(0, 500);
    setSavingId(order.id);
    setActionError('');
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        adminNote: nextNote,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setActionError('Тэмдэглэл хадгалахад алдаа гарлаа.');
      handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteOrder = async (order: StoredOrder) => {
    if (!isAdmin) return;
    setSavingId(order.id);
    setActionError('');
    try {
      await deleteDoc(doc(db, 'orders', order.id));
    } catch (error) {
      setActionError('Захиалга устгахад алдаа гарлаа.');
      handleFirestoreError(error, OperationType.DELETE, `orders/${order.id}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Firebase захиалгын самбар"
      onClick={() => setIsPortalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-[#09090b] border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {isAdmin
                  ? 'Админ захиалгын самбар (Firestore)'
                  : 'Миний захиалгууд (Firestore)'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-display truncate mt-0.5">
              {user
                ? `${user.displayName || user.email}`
                : 'Google бүртгэлээр нэвтрэх'}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Гарах</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPortalOpen(false)}
              aria-label="Хаах"
              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!user ? (
            <div className="py-10 text-center space-y-5 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white font-display">
                  Захиалгуудыг удирдах ба хянах
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Google бүртгэлээр нэвтэрснээр админ бүх захиалгыг бодит
                  хугацаанд хянаж төлөв өөрчлөх, харин хэрэглэгчид өөрийн
                  илгээсэн захиалгын явцыг шалгах боломжтой.
                </p>
              </div>
              {authError && (
                <p className="text-xs text-rose-400">{authError}</p>
              )}
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors"
              >
                <span>Google-ээр нэвтрэх</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  {(['all', 'new', 'in_progress', 'completed', 'cancelled'] as const).map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          filter === key
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {key === 'all'
                          ? `Бүгд (${orders.length})`
                          : STATUS_LABELS[key]}
                      </button>
                    )
                  )}
                </div>

                <div className="text-xs text-zinc-400 tabular-nums">
                  Нийт: {filteredOrders.length} захиалга
                </div>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs text-rose-200">
                  {actionError}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-sm text-zinc-400">
                  Firestore өгөгдлийг ачааллаж байна...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 space-y-1">
                  <div className="text-sm font-medium text-zinc-300">
                    Захиалга олдсонгүй
                  </div>
                  <p className="text-xs text-zinc-500">
                    Одоогоор энэ ангилалд бүртгэгдсэн захиалга байхгүй байна.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const draftNote =
                      noteDrafts[order.id] ?? order.adminNote ?? '';
                    const isBusy = savingId === order.id;

                    return (
                      <article
                        key={order.id}
                        className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-semibold text-cyan-400">
                                {order.orderCode}
                              </span>
                              <span aria-hidden="true" className="text-zinc-600">
                                ·
                              </span>
                              <span className="text-zinc-400">
                                {order.projectType}
                              </span>
                              <span aria-hidden="true" className="text-zinc-600">
                                ·
                              </span>
                              <span className="inline-flex items-center gap-1 text-zinc-500 tabular-nums">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(order.createdAt)}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white font-display">
                              {order.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${STATUS_STYLES[order.status]}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {STATUS_LABELS[order.status]}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="text-zinc-500">Холбоо барих</div>
                            <div className="text-zinc-200 font-medium mt-0.5 break-all">
                              {order.contact}
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-500">Төсөв</div>
                            <div className="text-zinc-200 font-medium mt-0.5">
                              {order.budget}
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-500">Хугацаа</div>
                            <div className="text-zinc-200 font-medium mt-0.5">
                              {order.timeline}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800/70">
                          {order.details}
                        </p>

                        {order.adminNote && !isAdmin && (
                          <div className="text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-3">
                            Хөгжүүлэгчийн тэмдэглэл: {order.adminNote}
                          </div>
                        )}

                        {isAdmin && (
                          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {(
                                  [
                                    'new',
                                    'in_progress',
                                    'completed',
                                    'cancelled',
                                  ] as const
                                ).map((statusKey) => (
                                  <button
                                    key={statusKey}
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      void handleStatusChange(order, statusKey)
                                    }
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                      order.status === statusKey
                                        ? 'bg-cyan-400 text-black border-cyan-400 font-semibold'
                                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                  >
                                    {STATUS_LABELS[statusKey]}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleDeleteOrder(order)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Устгах</span>
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={draftNote}
                                maxLength={500}
                                onChange={(e) =>
                                  setNoteDrafts((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.value,
                                  }))
                                }
                                placeholder="Админы тэмдэглэл бичих..."
                                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
                              />
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleSaveNote(order)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Тэмдэглэл хадгалах</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
