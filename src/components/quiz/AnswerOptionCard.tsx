interface AnswerOptionCardProps {
  id: string;
  text: string;
  selected: boolean;
  onSelect: () => void;
  name: string;
}

export function AnswerOptionCard({ id, text, selected, onSelect, name }: AnswerOptionCardProps) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 transition-all duration-200 sm:px-5 sm:py-5 ${
        selected
          ? 'border-secondary bg-secondary-50 shadow-soft'
          : 'border-secondary-100 hover:border-secondary-200 hover:bg-soft'
      }`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          selected ? 'border-secondary bg-secondary' : 'border-secondary-200 bg-white'
        }`}
        aria-hidden="true"
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
      </span>
      <span
        className={`text-base font-semibold leading-relaxed sm:text-lg ${
          selected ? 'text-primary' : 'text-ink'
        }`}
      >
        {text}
      </span>
    </label>
  );
}
