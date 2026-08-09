export default function PageLoading() {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="화면을 불러오는 중">
      <header className="mb-5 space-y-1.5">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-9 w-56 rounded bg-slate-200" />
        <p className="text-base text-muted">화면을 준비하고 있습니다.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }, (_, columnIndex) => (
          <section
            key={columnIndex}
            className="rounded-[1.25rem] border border-line bg-white p-4 shadow-panel"
          >
            <div className="h-5 w-20 rounded bg-slate-200" />
            <div className="mb-3 mt-2 h-6 w-24 rounded-full bg-slate-100" />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 2 }, (_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-line bg-slate-50/80 p-4"
                >
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-9 w-24 rounded-xl bg-white" />
                  </div>
                  <div className="h-20 w-16 rounded-2xl bg-slate-200" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
