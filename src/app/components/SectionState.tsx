export function SectionState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
      {text}
    </div>
  );
}
