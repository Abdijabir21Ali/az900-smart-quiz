import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  KeyRound,
  Loader2,
  MessageCircle,
  Moon,
  RotateCcw,
  Send,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { DOMAINS, questionsForDomain, type Domain, type Question } from '@/data/questions';
import { askFollowUp } from '@/lib/gemini';
import { useApiKey } from '@/hooks/useApiKey';
import { useTheme } from '@/hooks/useTheme';
import ApiKeyModal from '@/components/ApiKeyModal';

type Screen = 'topics' | 'quiz' | 'done';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [screen, setScreen] = useState<Screen>('topics');
  const [domain, setDomain] = useState<Domain | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const [followUpText, setFollowUpText] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const { apiKey, save, loaded } = useApiKey();
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  const questions = useMemo<Question[]>(
    () => (domain ? questionsForDomain(domain) : []),
    [domain],
  );
  const current = questions[qIndex];

  function startDomain(d: Domain) {
    setDomain(d);
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setChat([]);
    setFollowUpText('');
    setFollowUpError(null);
    setScreen('quiz');
  }

  function chooseOption(i: number) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === current.correct) setScore((s) => s + 1);
  }

  function nextQuestion() {
    if (qIndex + 1 >= questions.length) {
      setScreen('done');
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
    setChat([]);
    setFollowUpText('');
    setFollowUpError(null);
  }

  async function submitFollowUp() {
    const text = followUpText.trim();
    if (!text) return;
    if (!apiKey) {
      setKeyModalOpen(true);
      return;
    }
    setChat((c) => [...c, { role: 'user', text }]);
    setFollowUpText('');
    setAsking(true);
    setFollowUpError(null);
    try {
      const reply = await askFollowUp(apiKey, {
        question: current.question,
        correctOption: current.options[current.correct],
        chosenOption: current.options[selected ?? current.correct],
        standardExplanation: current.standardExplanation,
        wrongExplanation: current.wrongExplanation,
        userQuestion: text,
      });
      setChat((c) => [...c, { role: 'assistant', text: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setFollowUpError(msg);
    } finally {
      setAsking(false);
    }
  }

  function restartAll() {
    setScreen('topics');
    setDomain(null);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setChat([]);
    setFollowUpText('');
    setFollowUpError(null);
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-200">
      <BackgroundBlobs />
      <div className="relative z-10 flex min-h-screen flex-col">
      <Header
        onKeyClick={() => setKeyModalOpen(true)}
        hasKey={!!apiKey}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {screen === 'topics' && (
        <TopicsScreen
          onStart={startDomain}
          loaded={loaded}
          apiKey={apiKey}
          onKeyClick={() => setKeyModalOpen(true)}
        />
      )}

      {screen === 'done' && (
        <DoneScreen
          score={score}
          total={questions.length}
          domain={domain}
          onRetry={() => domain && startDomain(domain)}
          onChooseAnother={restartAll}
        />
      )}

      {screen === 'quiz' && current && (
        <QuizScreen
          domain={domain!}
          questions={questions}
          qIndex={qIndex}
          current={current}
          selected={selected}
          answered={answered}
          score={score}
          chat={chat}
          asking={asking}
          followUpText={followUpText}
          followUpError={followUpError}
          apiKey={apiKey}
          loaded={loaded}
          onChooseOption={chooseOption}
          onNext={nextQuestion}
          onFollowUpText={setFollowUpText}
          onSubmitFollowUp={submitFollowUp}
          onKeyClick={() => setKeyModalOpen(true)}
        />
      )}

      {screen === 'quiz' && !current && (
        <main className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">No questions available.</p>
          <button
            onClick={restartAll}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4" /> Back to topics
          </button>
        </main>
      )}

      <Footer />
      <ApiKeyModal
        open={keyModalOpen}
        initialKey={apiKey}
        onSave={(k) => {
          save(k);
          setKeyModalOpen(false);
        }}
        onClose={() => setKeyModalOpen(false)}
      />
      </div>
    </div>
  );
}

/* ──────────────────────────── Header ──────────────────────────── */

interface HeaderProps {
  onKeyClick: () => void;
  hasKey: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function Header({ onKeyClick, hasKey, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-blue-500/30">
            AZ
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            AZ-900 Vibe Prep
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onKeyClick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {hasKey ? 'API key set' : 'Add API key'}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────── Footer ──────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-slate-200/60 py-6 text-center dark:border-slate-800/60">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Unofficial study tool. Not affiliated with Microsoft.
      </p>
    </footer>
  );
}

/* ──────────────────────────── Decorative blobs ──────────────────────────── */

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-blob-float dark:bg-blue-500/10" />
      <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl animate-blob-float dark:bg-cyan-500/10" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-300/10 blur-3xl animate-blob-float dark:bg-cyan-600/8" style={{ animationDelay: '8s' }} />
    </div>
  );
}

/* ──────────────────────────── Topics Screen ──────────────────────────── */

interface TopicsScreenProps {
  onStart: (d: Domain) => void;
  loaded: boolean;
  apiKey: string | null;
  onKeyClick: () => void;
}

function TopicsScreen({ onStart, loaded, apiKey, onKeyClick }: TopicsScreenProps) {
  return (
    <main className="relative mx-auto max-w-4xl px-5 py-16">
      <div className="animate-slide-up text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-600 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-400">
          <Sparkles className="h-4 w-4" /> Microsoft Azure Fundamentals
        </div>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
            AZ-900 Vibe Prep
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400">
          Pick a topic, answer short practice questions, and ask a follow-up
          when you want to dig deeper.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {DOMAINS.map((d, i) => {
          const count = questionsForDomain(d).length;
          return (
            <button
              key={d}
              onClick={() => onStart(d)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-blue-500/10 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 transition-opacity duration-300 group-hover:from-blue-500/5 group-hover:to-cyan-500/5" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-blue-500/30">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {d}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{count} questions</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-all duration-200 group-hover:gap-2 dark:text-blue-400">
                  Start <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {loaded && !apiKey && (
        <div className="mt-10 animate-fade-in rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          Want AI-powered follow-up answers?{' '}
          <button onClick={onKeyClick} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Add your Gemini API key
          </button>{' '}
          to enable it.
        </div>
      )}
    </main>
  );
}

/* ──────────────────────────── Done Screen ──────────────────────────── */

interface DoneScreenProps {
  score: number;
  total: number;
  domain: Domain | null;
  onRetry: () => void;
  onChooseAnother: () => void;
}

function DoneScreen({ score, total, domain, onRetry, onChooseAnother }: DoneScreenProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-20 text-center">
      <div className="animate-slide-up">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Topic complete
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          You scored{' '}
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
            {score}
          </span>{' '}
          out of{' '}
          <span className="font-bold">{total}</span>
          {' '}in {domain}.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
            {percentage}%
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" /> Retry this topic
          </button>
          <button
            onClick={onChooseAnother}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Choose another topic
          </button>
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────────── Quiz Screen ──────────────────────────── */

interface QuizScreenProps {
  domain: Domain;
  questions: Question[];
  qIndex: number;
  current: Question;
  selected: number | null;
  answered: boolean;
  score: number;
  chat: ChatMessage[];
  asking: boolean;
  followUpText: string;
  followUpError: string | null;
  apiKey: string | null;
  loaded: boolean;
  onChooseOption: (i: number) => void;
  onNext: () => void;
  onFollowUpText: (s: string) => void;
  onSubmitFollowUp: () => void;
  onKeyClick: () => void;
}

function QuizScreen({
  domain,
  questions,
  qIndex,
  current,
  selected,
  answered,
  chat,
  asking,
  followUpText,
  followUpError,
  apiKey,
  loaded,
  onChooseOption,
  onNext,
  onFollowUpText,
  onSubmitFollowUp,
  onKeyClick,
}: QuizScreenProps) {
  const progress = ((qIndex + (answered ? 1 : 0)) / questions.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      {/* progress */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{domain}</span>
          <span className="text-slate-500 dark:text-slate-400">
            {qIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* question card */}
      <div
        key={qIndex}
        className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-7 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20"
      >
        <h2 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl dark:text-slate-100">
          {current.question}
        </h2>

        <div className="mt-5 grid gap-3">
          {current.options.map((opt, i) => {
            const isCorrect = i === current.correct;
            const isPicked = i === selected;
            let cls =
              'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/30';
            if (answered) {
              if (isCorrect)
                cls = 'border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-950/40';
              else if (isPicked)
                cls = 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/40';
              else cls = 'border-slate-200 bg-white opacity-50 dark:border-slate-700 dark:bg-slate-800/50';
            }
            return (
              <button
                key={i}
                onClick={() => onChooseOption(i)}
                disabled={answered}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium text-slate-800 transition-all duration-200 ${cls} ${
                  answered ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                    answered && isCorrect
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/40'
                      : answered && isPicked
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/40'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                  }`}
                >
                  {answered && isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : answered && isPicked ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <span>{letters[i] ?? ''}</span>
                  )}
                </span>
                <span className="dark:text-slate-200">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* explanations */}
        {answered && (
          <div className="mt-5 grid gap-3 animate-fade-in">
            <div className="rounded-xl border border-green-300/60 bg-green-50/80 p-4 shadow-sm shadow-green-500/10 dark:border-green-700/60 dark:bg-green-950/30">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Why this is correct
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {current.standardExplanation}
              </p>
            </div>
            <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 p-4 shadow-sm shadow-amber-500/10 dark:border-amber-700/60 dark:bg-amber-950/30">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                <X className="h-4 w-4" /> Why the other answers are wrong
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {current.wrongExplanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* follow-up + chat */}
      {answered && (
        <div className="mt-5 animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            <MessageCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            Ask a follow-up
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Curious about a detail? Ask and get an AI explanation.
          </p>

          {/* chat input with embedded send button */}
          <div className="mt-3 relative">
            <input
              value={followUpText}
              onChange={(e) => onFollowUpText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !asking) {
                  e.preventDefault();
                  onSubmitFollowUp();
                }
              }}
              placeholder="e.g. Why is PaaS cheaper than IaaS here?"
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-3 pl-5 pr-14 text-sm text-slate-800 shadow-inner shadow-slate-200/50 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:shadow-black/20"
            />
            <button
              onClick={onSubmitFollowUp}
              disabled={asking || !followUpText.trim()}
              aria-label="Send"
              className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              {asking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {!apiKey && loaded && (
            <button
              onClick={onKeyClick}
              className="mt-2 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Add your Gemini API key to enable follow-ups
            </button>
          )}

          {followUpError && (
            <p className="mt-3 rounded-lg border border-red-300/60 bg-red-50/80 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400">
              {followUpError}
            </p>
          )}

          {chat.length > 0 && (
            <div className="mt-4 space-y-3">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'animate-slide-in-right rounded-br-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                        : 'animate-slide-in-left rounded-bl-sm border border-white/20 bg-white/70 text-slate-800 shadow-sm backdrop-blur-md dark:border-slate-600/30 dark:bg-slate-700/50 dark:text-slate-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {asking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="rounded-2xl rounded-bl-sm border border-white/20 bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur-md dark:border-slate-600/30 dark:bg-slate-700/50">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* next */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!answered}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
        >
          {qIndex + 1 >= questions.length ? 'Finish' : 'Next question'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
