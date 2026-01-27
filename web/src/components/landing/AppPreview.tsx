'use client';

export function AppPreview() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
      {/* Browser Frame - Dashboard Preview */}
      <div className="w-full max-w-xl">
        <div className="rounded-t-[22px] px-4 py-3 flex items-center gap-2" style={{ background: 'var(--ink)' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 mx-4">
            <div className="rounded-full px-3 py-1 text-xs text-center" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-placeholder)' }}>
              bettercoaching.app/agents/new
            </div>
          </div>
        </div>
        <div className="card rounded-t-none p-6" style={{ aspectRatio: '4/3' }}>
          {/* Placeholder for dashboard screenshot */}
          <div className="w-full h-full rounded-[14px] p-6" style={{ background: 'var(--bg-base)' }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 avatar text-lg">
                  A
                </div>
                <div>
                  <div className="h-4 w-32 rounded-full" style={{ background: 'var(--border)' }}></div>
                  <div className="h-3 w-24 rounded-full mt-2" style={{ background: 'var(--sage)' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full" style={{ background: 'var(--border)' }}></div>
                <div className="h-3 w-4/5 rounded-full" style={{ background: 'var(--border)' }}></div>
                <div className="h-3 w-3/5 rounded-full" style={{ background: 'var(--border)' }}></div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-10 w-24 rounded-[14px]" style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))' }}></div>
                <div className="h-10 w-24 rounded-[14px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Frame - Mobile Chat Preview */}
      <div className="w-64 sm:w-72">
        <div className="rounded-[2.5rem] p-3" style={{ background: 'var(--ink)', boxShadow: 'var(--shadow-elevated)' }}>
          <div className="rounded-[2rem] overflow-hidden">
            {/* Phone notch */}
            <div className="h-8 flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <div className="w-20 h-5 bg-black rounded-full"></div>
            </div>
            {/* Screen content */}
            <div className="p-4" style={{ background: 'var(--bg-base)', aspectRatio: '9/16' }}>
              <div className="space-y-3 h-full flex flex-col">
                {/* Chat header */}
                <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--lavender)', color: 'var(--ink)' }}>
                    M
                  </div>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Mindset Coach</div>
                    <div className="text-[10px]" style={{ color: 'var(--success)' }}>Online</div>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="flex-1 space-y-3 overflow-hidden">
                  <div className="flex justify-end">
                    <div className="text-white text-xs px-3 py-2 rounded-[14px] rounded-br-[4px] max-w-[80%]" style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))' }}>
                      How can I stay motivated?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="text-xs px-3 py-2 rounded-[14px] rounded-bl-[4px] max-w-[80%]" style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      Great question! Let&apos;s start by understanding what drives you...
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="rounded-full px-4 py-2 flex items-center gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex-1 text-xs" style={{ color: 'var(--text-placeholder)' }}>Type a message...</div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))' }}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
