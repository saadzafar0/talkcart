export function ChatTypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-primary-900/5 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
