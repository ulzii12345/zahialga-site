import { CheckCircle2, Globe, Sparkles, Target } from 'lucide-react';
import { GOALS_DATA, type GoalItem } from '../data/portfolioData';

export function GoalsSection() {
  const renderGoalIcon = (icon: GoalItem['icon']) => {
    switch (icon) {
      case 'globe':
        return <Globe className="w-4 h-4 text-zinc-300" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-zinc-300" />;
      case 'target':
        return <Target className="w-4 h-4 text-zinc-300" />;
    }
  };

  return (
    <section id="goals" className="py-20 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 tracking-wide mb-2">
            <Target className="w-4 h-4 shrink-0" />
            <span>Суралцах зорилго</span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="text-zinc-400">Алсын хараа</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            Сургалтад сурч буй зорилго
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
            Өлзийтогтохын технологийн ертөнц дэх сурах гол зорилгууд ба хичээл
            зүтгэл
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {GOALS_DATA.map((goal) => (
            <article
              key={goal.number}
              className="flex flex-col justify-between rounded-2xl bg-[#09090b] border border-zinc-800 p-6 sm:p-7 hover:border-zinc-700 transition-colors duration-200"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                  <span className="font-mono text-2xl font-bold text-zinc-300 tracking-tight tabular-nums">
                    {goal.number}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {renderGoalIcon(goal.icon)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white font-display mt-5">
                  {goal.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mt-2.5">
                  {goal.description}
                </p>
              </div>

              <ul className="mt-6 pt-4 border-t border-zinc-800/70 space-y-2.5 text-xs text-zinc-300">
                {goal.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-bold text-white font-display">
              &ldquo;Хамгийн шилдэг код бол өдөр бүрийн тасралтгүй дадлагаас
              төрдөг&rdquo;
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400">
              16 настай сурагч Өлзийтогтохын сурах их аялал дөнгөж эхэлж байна.
            </p>
          </div>
          <a
            href="#order"
            className="px-5 py-2.5 text-xs font-semibold text-black bg-zinc-200 hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Вэб сайт захиалах
          </a>
        </div>
      </div>
    </section>
  );
}
