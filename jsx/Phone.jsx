/* ── Phone.jsx ──
   갤럭시 폰 화면 (테두리 포함). 홈 화면에서 앱 아이콘/위젯을 눌러 들어갈 수 있음.
   홈: 달력 위젯 · 음악 위젯 · 구글 검색바 · 앱 그리드 · 독
   앱: 카카오톡(목록/채팅방) · 메시지(목록/대화, 다크) · 뮤직 플레이어 · 캘린더 · 커뮤니티(목록/글)
   하단 홈 인디케이터를 누르면 홈으로, 각 앱 헤더의 < 로 뒤로.
   제약: no import, no export default, no backtick, no arrow function, no inline // comments.
   내부 헬퍼 접두사: PH_
   ★ 메인 컴포넌트를 파일 최상단에 배치

   ── props ──
   owner        폰 주인 이름 ("건우")
   statusTime   상태바 시간 ("오후 2:11")
   battery      배터리 % (90)
   dateTime     오늘 날짜 ("2026년 9월 28일")  ※ Calendar.jsx와 동일 포맷
   promise      일정 문자열 ("9/30 약속 · 10/3~10/5 출장 · D-2")  ※ Calendar.jsx와 동일 포맷
   events       일정 배열 (promise 대신) [{ date: "9/30" | "10/3~10/5", label, color }]
   wallpaper    배경 (CSS background 값 또는 이미지 URL)
   startApp     처음 열릴 화면 "home" | "kakao" | "sms" | "music" | "calendar" | "community"
   startIndex   startApp 안에서 바로 열 방/대화/글 번호 (없으면 목록)
   rooms        카톡방 [{ name, members, unread, time, pinned, muted, bg,
                  messages: [{ author, content, time, isMe, unread } | { date } | { system }] }]
   sms          문자 [{ name, number, unread, messages: [{ content, time, isMe } | { date }] }]
   nowPlaying   { title, artist, album, cover, progress(0~1), duration("3:42"), caption,
                  playing, queue: [{ title, artist, duration }] }
   community    { appName, iconText, gallery,
                  posts: [{ title, author, ip, date, views, recommend, dislike, hot, content,
                  comments: [{ author, ip, content, date, isReply }] }] }
*/

function Phone(props) {
  props = props || {};

  var owner = props.owner || "건우";
  var statusTime = props.statusTime || "오후 2:11";
  var battery = props.battery == null ? 90 : props.battery;
  var today = PH_parseDate(props.dateTime || "2026년 9월 28일");
  var events = PH_getEvents(props);
  var rooms = props.rooms || PH_defaultRooms(owner);
  var sms = props.sms || PH_defaultSms();
  var np = PH_merge(PH_defaultNowPlaying(owner), props.nowPlaying);
  var comm = PH_merge(PH_defaultCommunity(), props.community);

  var aState = useState(props.startApp || "home");
  var app = aState[0]; var setApp = aState[1];
  var sState = useState(props.startIndex == null ? -1 : props.startIndex);
  var sub = sState[0]; var setSub = sState[1];
  var pState = useState(np.playing !== false);
  var playing = pState[0]; var setPlaying = pState[1];

  function open(a, i) { setApp(a); setSub(i == null ? -1 : i); }
  function back() { if (sub >= 0) setSub(-1); else setApp("home"); }
  function goHome() { setApp("home"); setSub(-1); }

  var kakaoUnread = 0;
  for (var ri = 0; ri < rooms.length; ri++) kakaoUnread += rooms[ri].unread || 0;
  var smsUnread = 0;
  for (var si = 0; si < sms.length; si++) smsUnread += sms[si].unread || 0;

  var theme = PH_theme(app, sub);
  if (app === "music") theme.bg = "linear-gradient(180deg," + PH_color(np.title) + "cc 0%,#121212 50%,#030303 100%)";
  var wall = PH_wallpaper(props.wallpaper);
  var font = "'Pretendard Variable','Pretendard','SamsungOne','Apple SD Gothic Neo','Noto Sans KR',sans-serif";

  var body;
  if (app === "kakao" && sub >= 0 && rooms[sub]) {
    body = <PH_KakaoRoom room={rooms[sub]} onBack={back} />;
  } else if (app === "kakao") {
    body = <PH_KakaoList rooms={rooms} onOpen={function(i) { setSub(i); }} onBack={back} />;
  } else if (app === "sms" && sub >= 0 && sms[sub]) {
    body = <PH_SmsThread thread={sms[sub]} onBack={back} />;
  } else if (app === "sms") {
    body = <PH_SmsList threads={sms} onOpen={function(i) { setSub(i); }} onBack={back} />;
  } else if (app === "music") {
    body = <PH_Music np={np} playing={playing} setPlaying={setPlaying} onBack={back} />;
  } else if (app === "calendar") {
    body = <PH_CalendarApp today={today} events={events} onBack={back} />;
  } else if (app === "community" && sub >= 0 && comm.posts[sub]) {
    body = <PH_CommPost comm={comm} post={comm.posts[sub]} onBack={back} />;
  } else if (app === "community") {
    body = <PH_CommList comm={comm} onOpen={function(i) { setSub(i); }} onBack={back} />;
  } else {
    body = (
      <PH_Home
        today={today} events={events} np={np} playing={playing} setPlaying={setPlaying}
        comm={comm} kakaoUnread={kakaoUnread} smsUnread={smsUnread} open={open}
      />
    );
  }

  return (
    <div style={{ fontFamily: font }} className="w-full max-w-[375px] mx-auto relative select-none">
      <style>{PH_css()}</style>
      {/* 사이드 버튼 */}
      <div className="absolute right-[-3px] top-[150px] w-[4px] h-[64px] rounded-r-[3px]" style={{ background: "linear-gradient(90deg,#1b1b1d,#4a4a4e)" }} />
      <div className="absolute right-[-3px] top-[235px] w-[4px] h-[40px] rounded-r-[3px]" style={{ background: "linear-gradient(90deg,#1b1b1d,#4a4a4e)" }} />
      {/* 프레임 */}
      <div
        className="rounded-[46px] p-[9px]"
        style={{
          background: "linear-gradient(145deg,#3a3a3e 0%,#141416 35%,#0a0a0b 65%,#2e2e32 100%)",
          boxShadow: "0 24px 40px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.4), inset 0 0 0 1.5px #56565c, inset 0 0 0 3px #0c0c0d"
        }}
      >
        <div
          className="rounded-[38px] overflow-hidden flex flex-col aspect-[9/19.5] relative"
          style={{ background: app === "home" ? wall : theme.bg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)" }}
        >
          {/* 펀치홀 카메라 */}
          <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[12px] h-[12px] rounded-full z-30"
            style={{ background: "radial-gradient(circle at 35% 35%,#2a2f3a 0%,#050506 55%)", boxShadow: "0 0 0 1.5px #111" }} />
          <PH_StatusBar
            time={statusTime} battery={battery} light={theme.light}
            bg={app === "home" ? "transparent" : theme.bar}
            kakao={kakaoUnread > 0} sms={smsUnread > 0} music={playing}
          />
          <div className="flex-1 min-h-0 flex flex-col relative">{body}</div>
          <div className="flex justify-center pt-[6px] pb-[7px] cursor-pointer" onClick={goHome}
            style={{ background: app === "home" ? "transparent" : theme.nav }}>
            <div className="w-[110px] h-[4px] rounded-full" style={{ background: theme.light ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.35)" }} />
          </div>
          {/* 유리 반사 */}
          <div className="absolute inset-0 pointer-events-none z-40 rounded-[38px]"
            style={{ background: "linear-gradient(125deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0) 28%,rgba(255,255,255,0) 100%)" }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════ 홈 화면 ══════════════ */

function PH_Home(p) {
  var t = p.today;
  var up = PH_upcoming(p.events, t).slice(0, 2);
  var grid = [
    { id: "calendar", label: "캘린더", go: "calendar" },
    { id: "music", label: "YT Music", go: "music" },
    { id: "community", label: p.comm.appName, go: "community" },
    { id: "naver", label: "NAVER" },
    { id: "youtube", label: "YouTube" },
    { id: "coupang", label: "쿠팡" },
    { id: "carrot", label: "당근마켓" },
    { id: "bank", label: "토스" },
    { id: "settings", label: "설정" },
    { id: "play", label: "Play 스토어" }
  ];
  var dock = [
    { id: "phone", label: "전화" },
    { id: "sms", label: "메시지", go: "sms", badge: p.smsUnread },
    { id: "kakao", label: "카카오톡", go: "kakao", badge: p.kakaoUnread },
    { id: "internet", label: "인터넷" },
    { id: "camera", label: "카메라" }
  ];

  return (
    <div className="flex-1 flex flex-col px-[14px] pt-[6px] min-h-0">
      {/* 달력 위젯 */}
      <div onClick={function() { p.open("calendar"); }} className="cursor-pointer rounded-[22px] p-[12px] flex gap-[10px] ph-glass">
        <div className="w-[44%] flex flex-col">
          <div className="text-white/70 text-[11px] font-semibold">{PH_DOW()[t.dow] + "요일"}</div>
          <div className="text-white text-[34px] font-light leading-[38px] tracking-[-1px]">{t.d}</div>
          <div className="text-white/80 text-[11px] mb-[6px]">{t.y + "년 " + t.m + "월"}</div>
          <div className="flex-1 flex flex-col gap-[4px]">
            {up.length === 0 && <div className="text-white/50 text-[10.5px]">예정된 일정 없음</div>}
            {up.map(function(ev, i) {
              return (
                <div key={i} className="flex items-start gap-[5px]">
                  <div className="w-[3px] self-stretch rounded-full" style={{ background: ev.color }} />
                  <div className="min-w-0">
                    <div className="text-white text-[10.5px] leading-[13px] truncate">{ev.label}</div>
                    <div className="text-white/55 text-[9.5px] leading-[12px]">{ev.sm + "/" + ev.sd + (ev.dday === 0 ? " · 오늘" : " · D-" + ev.dday)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <PH_MiniMonth today={t} events={p.events} />
      </div>

      {/* 음악 위젯 */}
      <div className="mt-[8px] rounded-[22px] px-[10px] py-[9px] flex items-center gap-[10px] ph-glass">
        <div onClick={function() { p.open("music"); }} className="cursor-pointer shrink-0">
          <PH_Cover np={p.np} size={42} radius={10} />
        </div>
        <div onClick={function() { p.open("music"); }} className="cursor-pointer min-w-0 flex-1">
          <div className="flex items-center gap-[5px]">
            {p.playing && <PH_Eq color="#ff4e45" h={10} />}
            <div className="text-white text-[12.5px] font-semibold truncate">{p.np.title}</div>
          </div>
          <div className="text-white/60 text-[11px] truncate">{p.np.artist}</div>
        </div>
        <div className="flex items-center gap-[6px] text-white shrink-0">
          <PH_Svg className="w-[18px] h-[18px]" fill="currentColor" sw={0}><path d="M6 6h2v12H6zM9.5 12 18 6v12z" /></PH_Svg>
          <div onClick={function() { p.setPlaying(!p.playing); }} className="cursor-pointer w-[30px] h-[30px] rounded-full bg-white/90 text-black flex items-center justify-center">
            {p.playing
              ? <PH_Svg className="w-[14px] h-[14px]" fill="currentColor" sw={0}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></PH_Svg>
              : <PH_Svg className="w-[14px] h-[14px] ml-[2px]" fill="currentColor" sw={0}><path d="M7 4v16l13-8z" /></PH_Svg>}
          </div>
          <PH_Svg className="w-[18px] h-[18px]" fill="currentColor" sw={0}><path d="M16 6h2v12h-2zM14.5 12 6 18V6z" /></PH_Svg>
        </div>
      </div>

      <div className="flex-1 min-h-[8px]" />

      {/* 구글 검색바 */}
      <div className="h-[40px] rounded-full bg-white/95 flex items-center px-[14px] gap-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.25)] mb-[14px]">
        <PH_GoogleG />
        <div className="flex-1" />
        <PH_Svg className="w-[17px] h-[17px]" sw={0}>
          <rect x="9" y="3" width="6" height="11" rx="3" fill="#4285F4" />
          <path d="M6 11a6 6 0 0 0 12 0" stroke="#4285F4" strokeWidth="2" fill="none" />
          <path d="M12 17v4" stroke="#34A853" strokeWidth="2" />
        </PH_Svg>
      </div>

      {/* 앱 그리드 */}
      <div className="grid grid-cols-5 gap-y-[12px]">
        {grid.map(function(a) {
          return <PH_AppIcon key={a.id} app={a} today={p.today} comm={p.comm} onClick={a.go ? function() { p.open(a.go); } : null} />;
        })}
      </div>

      {/* 페이지 점 */}
      <div className="flex justify-center items-center gap-[7px] my-[12px]">
        <PH_Svg className="w-[9px] h-[9px] text-white" fill="currentColor" sw={0}><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z" /></PH_Svg>
        <div className="w-[6px] h-[6px] rounded-full bg-white" />
        <div className="w-[6px] h-[6px] rounded-full bg-white/40" />
      </div>

      {/* 독 */}
      <div className="grid grid-cols-5 pb-[6px]">
        {dock.map(function(a) {
          return <PH_AppIcon key={a.id} app={a} today={p.today} comm={p.comm} onClick={a.go ? function() { p.open(a.go); } : null} />;
        })}
      </div>
    </div>
  );
}

function PH_MiniMonth(p) {
  var t = p.today;
  var total = PH_daysIn(t.y, t.m);
  var start = PH_firstDow(t.y, t.m);
  var cells = [];
  var k;
  for (k = 0; k < start; k++) cells.push(<div key={"b" + k} />);
  for (k = 1; k <= total; k++) {
    var dow = (start + k - 1) % 7;
    var isToday = k === t.d;
    var has = false;
    for (var e = 0; e < p.events.length; e++) if (PH_hit(p.events[e], t.m, k)) has = true;
    cells.push(
      <div key={k} className="flex flex-col items-center h-[15px]">
        <div className="w-[14px] h-[13px] rounded-full flex items-center justify-center text-[8.5px] leading-none"
          style={{
            background: isToday ? "#ffffff" : "transparent",
            color: isToday ? "#111" : dow === 0 ? "#ff8a80" : dow === 6 ? "#8ab4ff" : "rgba(255,255,255,0.9)",
            fontWeight: isToday ? 700 : 400
          }}>{k}</div>
        {has && <div className="w-[3px] h-[3px] rounded-full bg-[#ffc94d] mt-[0.5px]" />}
      </div>
    );
  }
  return (
    <div className="flex-1">
      <div className="grid grid-cols-7 mb-[2px]">
        {PH_DOW().map(function(h, i) {
          return <div key={i} className="text-center text-[8px] font-semibold" style={{ color: i === 0 ? "#ff8a80" : i === 6 ? "#8ab4ff" : "rgba(255,255,255,0.55)" }}>{h}</div>;
        })}
      </div>
      <div className="grid grid-cols-7 gap-y-[1px]">{cells}</div>
    </div>
  );
}

function PH_AppIcon(p) {
  var a = p.app;
  return (
    <div onClick={p.onClick} className={"flex flex-col items-center " + (p.onClick ? "cursor-pointer active:scale-95 transition-transform" : "")}>
      <div className="relative">
        <div className="w-[50px] h-[50px] rounded-[16px] overflow-hidden relative"
          style={{ boxShadow: "0 3px 6px rgba(0,0,0,0.35), 0 1px 1.5px rgba(0,0,0,0.3)" }}>
          {PH_IconFace(a.id, p.today, p.comm)}
          <div className="absolute inset-0 pointer-events-none rounded-[16px]"
            style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0.06) 45%,rgba(0,0,0,0.06) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.12)" }} />
        </div>
        {a.badge > 0 && (
          <div className="absolute -top-[4px] -right-[5px] min-w-[18px] h-[18px] px-[4px] rounded-full bg-[#f5412e] text-white text-[10px] font-bold flex items-center justify-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{a.badge > 999 ? "999+" : a.badge}</div>
        )}
      </div>
      <div className="mt-[5px] text-[11px] text-white text-center leading-[13px] w-[64px] truncate"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{a.label}</div>
    </div>
  );
}

function PH_IconFace(id, t, comm) {
  var full = "absolute inset-0 flex items-center justify-center";
  if (id === "calendar") {
    return (
      <div className={full + " flex-col bg-white"}>
        <div className="text-[8px] font-bold text-[#e5484d] leading-none mt-[2px]">{PH_DOW()[t.dow] + "요일"}</div>
        <div className="text-[23px] font-semibold text-[#222] leading-[25px] tracking-[-1px]">{t.d}</div>
      </div>
    );
  }
  if (id === "music") {
    return (
      <div className={full} style={{ background: "radial-gradient(circle at 50% 40%,#ff3b30 0%,#e00 70%,#b80000 100%)" }}>
        <div className="w-[32px] h-[32px] rounded-full bg-[#1a0000]/20 border-[2.5px] border-white flex items-center justify-center">
          <PH_Svg className="w-[14px] h-[14px] text-white ml-[2px]" fill="currentColor" sw={0}><path d="M7 4v16l13-8z" /></PH_Svg>
        </div>
      </div>
    );
  }
  if (id === "community") {
    return (
      <div className={full} style={{ background: "linear-gradient(160deg,#4a5bb5 0%,#29367c 100%)" }}>
        <span className="text-white font-extrabold text-[20px] tracking-[-1px]">{comm.iconText}</span>
      </div>
    );
  }
  if (id === "naver") return <div className={full + " bg-[#03C75A]"}><span className="text-white font-black text-[24px]">N</span></div>;
  if (id === "youtube") {
    return (
      <div className={full + " bg-white"}>
        <div className="w-[32px] h-[22px] rounded-[7px] bg-[#FF0000] flex items-center justify-center">
          <PH_Svg className="w-[11px] h-[11px] text-white ml-[1px]" fill="currentColor" sw={0}><path d="M6 3v18l15-9z" /></PH_Svg>
        </div>
      </div>
    );
  }
  if (id === "coupang") {
    return (
      <div className={full} style={{ background: "radial-gradient(circle,#ff6a3d 0%,#e8341c 100%)" }}>
        <span className="text-white font-bold text-[10.5px] tracking-[-0.3px]">coupang</span>
      </div>
    );
  }
  if (id === "carrot") {
    return (
      <div className={full + " bg-white"}>
        <div className="w-[26px] h-[30px] relative">
          <div className="absolute bottom-0 left-0 w-[26px] h-[26px] rounded-full bg-[#FF6F0F]" style={{ borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%" }} />
          <div className="absolute bottom-[8px] left-[8px] w-[10px] h-[10px] rounded-full bg-white" />
          <div className="absolute top-[-2px] left-[9px] w-[8px] h-[7px] rounded-full bg-[#2fb24c]" />
        </div>
      </div>
    );
  }
  if (id === "bank") {
    return (
      <div className={full + " bg-white"}>
        <PH_Svg className="w-[30px] h-[30px]" sw={0}>
          <path d="M3 17c4-1 6-8 9-13 3 5 5 12 9 13-6 3-12 3-18 0z" fill="#3182F6" />
        </PH_Svg>
      </div>
    );
  }
  if (id === "settings") {
    return (
      <div className={full} style={{ background: "linear-gradient(160deg,#8b93a1 0%,#5b6270 100%)" }}>
        <PH_Svg className="w-[28px] h-[28px] text-white" sw={1.8}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </PH_Svg>
      </div>
    );
  }
  if (id === "play") {
    return (
      <div className={full + " bg-white"}>
        <PH_Svg className="w-[28px] h-[28px]" sw={0}>
          <path d="M4 2.5 14 12 4 21.5z" fill="#00D7FE" />
          <path d="M4 2.5 17.5 9 14 12z" fill="#00F076" />
          <path d="M4 21.5 14 12l3.5 3z" fill="#FF3A44" />
          <path d="M17.5 9 21 11c1 .6 1 1.4 0 2l-3.5 2L14 12z" fill="#FFD400" />
        </PH_Svg>
      </div>
    );
  }
  if (id === "phone") {
    return (
      <div className={full} style={{ background: "linear-gradient(160deg,#3ddc84 0%,#12a150 100%)" }}>
        <PH_Svg className="w-[24px] h-[24px] text-white" fill="currentColor" sw={0}>
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
        </PH_Svg>
      </div>
    );
  }
  if (id === "sms") {
    return (
      <div className={full} style={{ background: "linear-gradient(160deg,#5ec8f5 0%,#2f7fe0 100%)" }}>
        <PH_Svg className="w-[26px] h-[26px] text-white" fill="currentColor" sw={0}>
          <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </PH_Svg>
      </div>
    );
  }
  if (id === "kakao") {
    return (
      <div className={full + " bg-[#FEE500]"}>
        <div className="relative">
          <div className="w-[34px] h-[26px] rounded-[50%] bg-[#3C1E1E] flex items-center justify-center">
            <span className="text-[#FEE500] font-black text-[9px] tracking-[-0.2px]">TALK</span>
          </div>
          <div className="absolute bottom-[-3px] left-[7px] w-0 h-0" style={{ borderLeft: "3px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #3C1E1E" }} />
        </div>
      </div>
    );
  }
  if (id === "internet") {
    return (
      <div className={full} style={{ background: "linear-gradient(160deg,#7b6cf6 0%,#4c3fd1 100%)" }}>
        <PH_Svg className="w-[28px] h-[28px] text-white" sw={1.8}>
          <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />
          <ellipse cx="12" cy="12" rx="10.5" ry="3.8" transform="rotate(-25 12 12)" />
        </PH_Svg>
      </div>
    );
  }
  if (id === "camera") {
    return (
      <div className={full} style={{ background: "linear-gradient(160deg,#9b7bf5 0%,#5b63e6 100%)" }}>
        <PH_Svg className="w-[26px] h-[26px] text-white" sw={1.8}>
          <path d="M14.5 4h-5L7.5 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3.5z" />
          <circle cx="12" cy="13" r="3.5" />
        </PH_Svg>
      </div>
    );
  }
  return <div className={full + " bg-gray-400"} />;
}

/* ══════════════ 카카오톡 ══════════════ */

function PH_KakaoList(p) {
  var rooms = p.rooms;
  var order = [];
  var i;
  for (i = 0; i < rooms.length; i++) if (rooms[i].pinned) order.push(i);
  for (i = 0; i < rooms.length; i++) if (!rooms[i].pinned) order.push(i);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="flex items-center justify-between px-[16px] pt-[8px] pb-[10px]">
        <div className="flex items-center gap-[4px]">
          <PH_Svg className="w-[22px] h-[22px] text-[#222] cursor-pointer -ml-[6px]" onClick={p.onBack}><path d="m15 18-6-6 6-6" /></PH_Svg>
          <span className="text-[20px] font-bold text-[#111]">채팅</span>
        </div>
        <div className="flex items-center gap-[16px] text-[#222]">
          <PH_Svg className="w-[21px] h-[21px]"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></PH_Svg>
          <PH_Svg className="w-[21px] h-[21px]"><path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" /><path d="M18 3v6M15 6h6" /></PH_Svg>
          <PH_Svg className="w-[21px] h-[21px]"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></PH_Svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto ph-scroll">
        {order.map(function(idx) {
          var r = rooms[idx];
          var last = PH_lastMsg(r.messages);
          var authors = PH_authors(r.messages);
          return (
            <div key={idx} onClick={function() { p.onOpen(idx); }} className="flex items-center gap-[12px] px-[16px] py-[8px] cursor-pointer active:bg-black/5">
              <PH_KakaoAvatar name={r.name} authors={authors} group={(r.members || 2) > 2} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[4px]">
                  <span className="text-[14.5px] font-semibold text-[#111] truncate">{r.name}</span>
                  {(r.members || 2) > 2 && <span className="text-[13px] text-[#aaa] shrink-0">{r.members}</span>}
                  {r.pinned && <PH_Svg className="w-[12px] h-[12px] text-[#bbb] shrink-0" fill="currentColor" sw={0}><path d="M16 3 21 8l-3 1-4 4 1 5-2 2-4-4-5 5-1-1 5-5-4-4 2-2 5 1 4-4z" /></PH_Svg>}
                  {r.muted && <PH_Svg className="w-[12px] h-[12px] text-[#bbb] shrink-0" sw={2}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M3 3l18 18" /></PH_Svg>}
                </div>
                <div className="text-[13px] text-[#888] truncate leading-[18px] mt-[1px]">{last ? last.content : ""}</div>
              </div>
              <div className="flex flex-col items-end gap-[4px] shrink-0 self-start pt-[3px]">
                <span className="text-[11px] text-[#aaa]">{r.time || (last ? last.time : "")}</span>
                {r.unread > 0 && (
                  <span className="min-w-[19px] h-[19px] px-[5px] rounded-full bg-[#FF5A3C] text-white text-[11px] font-bold flex items-center justify-center">
                    {r.unread > 300 ? "300+" : r.unread}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* 하단 탭 */}
      <div className="flex justify-around items-center py-[9px] border-t border-black/5 bg-white text-[#aaa]">
        <PH_Svg className="w-[23px] h-[23px]"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></PH_Svg>
        <PH_Svg className="w-[23px] h-[23px] text-[#111]" fill="currentColor" sw={0}><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7L5.5 21l4-2.6c.8.2 1.6.2 2.5.2 5.5 0 10-3.6 10-8s-4.5-7.6-10-7.6z" /></PH_Svg>
        <PH_Svg className="w-[23px] h-[23px]"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7L5.5 21l4-2.6c.8.2 1.6.2 2.5.2 5.5 0 10-3.6 10-8" /><path d="M19 2v6M16 5h6" /></PH_Svg>
        <PH_Svg className="w-[23px] h-[23px]"><path d="M6 7h12l1 14H5z" /><path d="M9 7a3 3 0 0 1 6 0" /></PH_Svg>
        <PH_Svg className="w-[23px] h-[23px]"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></PH_Svg>
      </div>
    </div>
  );
}

function PH_KakaoAvatar(p) {
  if (p.group && p.authors.length >= 2) {
    var list = p.authors.slice(0, 4);
    var pos;
    if (list.length === 2) pos = [[0, 0], [20, 20]];
    else if (list.length === 3) pos = [[12, 0], [2, 22], [23, 22]];
    else pos = [[1, 1], [24, 1], [1, 24], [24, 24]];
    var sz = list.length === 2 ? 26 : 21;
    return (
      <div className="w-[46px] h-[46px] relative shrink-0">
        {list.map(function(a, i) {
          return (
            <div key={i} className="absolute flex items-center justify-center text-white font-bold"
              style={{ left: pos[i][0], top: pos[i][1], width: sz, height: sz, borderRadius: sz * 0.38, fontSize: sz * 0.45, backgroundColor: PH_color(a), boxShadow: "0 0 0 1.5px #fff" }}>
              {a.charAt(0)}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="w-[46px] h-[46px] rounded-[17px] flex items-center justify-center text-white text-[17px] font-bold shrink-0"
      style={{ backgroundColor: PH_color(p.authors[0] || p.name) }}>
      {(p.authors[0] || p.name).charAt(0)}
    </div>
  );
}

function PH_KakaoRoom(p) {
  var r = p.room;
  var messages = r.messages || [];
  var bg = r.bg || "#BACEE0";
  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: bg }}>
      <div className="flex items-center justify-between px-[10px] py-[8px]">
        <div className="flex items-center gap-[4px] min-w-0">
          <PH_Svg className="w-[24px] h-[24px] text-[#333] cursor-pointer shrink-0" onClick={p.onBack}><path d="m15 18-6-6 6-6" /></PH_Svg>
          <span className="font-bold text-[16px] text-[#333] truncate">{r.name}</span>
          {(r.members || 2) > 2 && <span className="text-[14px] text-[#667788] shrink-0">{r.members}</span>}
        </div>
        <div className="flex items-center gap-[16px] text-[#333] shrink-0">
          <PH_Svg className="w-[20px] h-[20px]"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></PH_Svg>
          <PH_Svg className="w-[20px] h-[20px]"><path d="M4 6h16M4 12h16M4 18h16" /></PH_Svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto ph-scroll px-[10px] py-[4px]">
        {messages.map(function(msg, i) {
          if (msg.date) {
            return (
              <div key={i} className="flex justify-center my-[10px]">
                <span className="text-[11px] text-white bg-black/15 px-[12px] py-[3px] rounded-full">{msg.date + " ›"}</span>
              </div>
            );
          }
          if (msg.system) {
            return (
              <div key={i} className="flex justify-center my-[8px]">
                <span className="text-[11px] text-white bg-black/15 px-[12px] py-[3px] rounded-full">{msg.content}</span>
              </div>
            );
          }
          var prev = messages[i - 1];
          var next = messages[i + 1];
          var showProfile = !msg.isMe && (!prev || prev.date || prev.system || prev.author !== msg.author || prev.isMe);
          var showTime = !next || next.date || next.system || next.author !== msg.author || !!next.isMe !== !!msg.isMe || next.time !== msg.time;
          var meta = (
            <div className={"flex flex-col text-[10px] text-[#556677] leading-tight shrink-0 " + (msg.isMe ? "items-end" : "items-start")}>
              {msg.unread > 0 && <span className="text-[#E8B600] font-bold">{msg.unread}</span>}
              {showTime && <span>{msg.time}</span>}
            </div>
          );
          if (msg.isMe) {
            return (
              <div key={i} className="flex justify-end items-end gap-[4px] mb-[4px]">
                {meta}
                <div className={"max-w-[66%] bg-[#FEE500] rounded-[14px] px-[11px] py-[7px] text-[14px] text-[#222] leading-[20px] break-all whitespace-pre-wrap " + (!prev || prev.date || prev.system || !prev.isMe ? "rounded-tr-[4px]" : "")}>
                  {msg.content}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={"flex items-start gap-[7px] mb-[4px] " + (showProfile ? "mt-[6px]" : "")}>
              {showProfile
                ? <div className="w-[38px] h-[38px] rounded-[14px] flex items-center justify-center text-white text-[14px] font-bold shrink-0" style={{ backgroundColor: PH_color(msg.author) }}>{(msg.author || "?").charAt(0)}</div>
                : <div className="w-[38px] shrink-0" />}
              <div className="max-w-[68%]">
                {showProfile && <div className="text-[12px] text-[#4a5566] mb-[3px]">{msg.author}</div>}
                <div className="flex items-end gap-[4px]">
                  <div className={"bg-white rounded-[14px] px-[11px] py-[7px] text-[14px] text-[#222] leading-[20px] break-all whitespace-pre-wrap " + (showProfile ? "rounded-tl-[4px]" : "")}>
                    {msg.content}
                  </div>
                  {meta}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white px-[8px] py-[8px] flex items-center gap-[8px]">
        <PH_Svg className="w-[24px] h-[24px] text-black/40 shrink-0"><path d="M5 12h14M12 5v14" /></PH_Svg>
        <div className="flex-1 bg-[#f4f4f4] rounded-[18px] px-[14px] py-[7px] flex items-center justify-between">
          <span className="text-[14px] text-black/25">메시지 입력</span>
          <PH_Svg className="w-[20px] h-[20px] text-black/30"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" /></PH_Svg>
        </div>
        <PH_Svg className="w-[22px] h-[22px] text-black/35 shrink-0"><path d="M4 9h2M18 9h2M4 15h16M9 5h6" /><rect x="3" y="4" width="18" height="16" rx="2" /></PH_Svg>
      </div>
    </div>
  );
}

/* ══════════════ 메시지 (삼성, 다크) ══════════════ */

function PH_SmsList(p) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black">
      <div className="px-[20px] pt-[40px] pb-[26px]">
        <PH_Svg className="w-[22px] h-[22px] text-white/80 cursor-pointer -ml-[4px] mb-[18px]" onClick={p.onBack}><path d="m15 18-6-6 6-6" /></PH_Svg>
        <div className="text-white text-[30px] font-light">메시지</div>
      </div>
      <div className="flex items-center justify-between px-[20px] pb-[8px] text-white">
        <span className="text-[13px] text-white/60">대화</span>
        <div className="flex gap-[18px]">
          <PH_Svg className="w-[20px] h-[20px]"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></PH_Svg>
          <PH_Svg className="w-[20px] h-[20px]"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></PH_Svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto ph-scroll mx-[10px] rounded-[22px] bg-[#171717]">
        {p.threads.map(function(t, i) {
          var last = PH_lastMsg(t.messages);
          return (
            <div key={i} onClick={function() { p.onOpen(i); }} className={"flex items-center gap-[12px] px-[14px] py-[12px] cursor-pointer active:bg-white/5 " + (i > 0 ? "border-t border-white/5" : "")}>
              <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0" style={{ background: t.avatarColor || "#3a3a3c" }}>
                {t.avatar
                  ? <span className="text-white text-[16px] font-bold">{t.avatar}</span>
                  : <PH_Svg className="w-[24px] h-[24px] text-white/70" fill="currentColor" sw={0}><circle cx="12" cy="8" r="4.5" /><path d="M3 21a9 9 0 0 1 18 0z" /></PH_Svg>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className={"text-[15px] truncate " + (t.unread ? "text-white font-bold" : "text-white/90")}>{t.name}</span>
                  <span className="text-[11px] text-white/45 shrink-0 ml-[6px]">{last ? last.time : ""}</span>
                </div>
                <div className="flex justify-between items-center mt-[2px]">
                  <span className={"text-[13px] truncate " + (t.unread ? "text-white/80" : "text-white/45")}>{last ? last.content : ""}</span>
                  {t.unread > 0 && <span className="ml-[6px] min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#F07B3F] text-white text-[10.5px] font-bold flex items-center justify-center shrink-0">{t.unread}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end px-[22px] py-[12px]">
        <div className="w-[52px] h-[52px] rounded-full bg-[#3a64c8] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <PH_Svg className="w-[22px] h-[22px] text-white"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></PH_Svg>
        </div>
      </div>
    </div>
  );
}

function PH_SmsThread(p) {
  var t = p.thread;
  var messages = t.messages || [];
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black">
      <div className="flex items-center gap-[10px] px-[10px] py-[10px]">
        <PH_Svg className="w-[22px] h-[22px] text-white cursor-pointer" onClick={p.onBack}><path d="m15 18-6-6 6-6" /></PH_Svg>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[16px] font-semibold truncate">{t.name}</div>
          {t.number && <div className="text-white/45 text-[11px]">{t.number}</div>}
        </div>
        <div className="flex gap-[16px] text-white/85">
          <PH_Svg className="w-[20px] h-[20px]"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></PH_Svg>
          <PH_Svg className="w-[20px] h-[20px]"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></PH_Svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto ph-scroll px-[12px] py-[6px]">
        {messages.map(function(m, i) {
          if (m.date) {
            return <div key={i} className="text-center text-[11px] text-white/45 my-[12px]">{m.date}</div>;
          }
          var next = messages[i + 1];
          var showTime = !next || next.date || !!next.isMe !== !!m.isMe || next.time !== m.time;
          return (
            <div key={i} className={"flex flex-col mb-[3px] " + (m.isMe ? "items-end" : "items-start")}>
              <div className={"max-w-[76%] px-[13px] py-[8px] text-[14px] leading-[20px] break-all whitespace-pre-wrap rounded-[20px] " + (m.isMe ? "bg-[#3a64c8] text-white" : "bg-[#2b2b2d] text-[#ececec]")}>
                {m.content}
              </div>
              {showTime && <div className="text-[10px] text-white/40 mt-[3px] mb-[6px] px-[6px]">{m.time}</div>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-[8px] px-[10px] py-[8px]">
        <div className="w-[34px] h-[34px] rounded-full bg-[#2b2b2d] flex items-center justify-center shrink-0">
          <PH_Svg className="w-[18px] h-[18px] text-white/80"><path d="M5 12h14M12 5v14" /></PH_Svg>
        </div>
        <div className="flex-1 h-[38px] rounded-full bg-[#2b2b2d] px-[16px] flex items-center justify-between">
          <span className="text-[14px] text-white/35">메시지 입력</span>
          <PH_Svg className="w-[18px] h-[18px] text-white/45"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" /></PH_Svg>
        </div>
        <div className="w-[34px] h-[34px] rounded-full bg-[#2b2b2d] flex items-center justify-center shrink-0">
          <PH_Svg className="w-[18px] h-[18px] text-white/80"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></PH_Svg>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ 뮤직 플레이어 ══════════════ */

function PH_Music(p) {
  var np = p.np;
  var prog = Math.max(0, Math.min(1, np.progress == null ? 0.38 : np.progress));
  var total = PH_toSec(np.duration || "3:30");
  var elapsed = PH_fmtSec(Math.round(total * prog));
  var queue = np.queue || [];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-[14px] py-[8px] text-white">
        <PH_Svg className="w-[24px] h-[24px] cursor-pointer" onClick={p.onBack}><path d="m6 9 6 6 6-6" /></PH_Svg>
        <div className="flex bg-black/35 rounded-full p-[3px] text-[12px] font-semibold">
          <span className="px-[14px] py-[4px] rounded-full bg-white/20">노래</span>
          <span className="px-[14px] py-[4px] text-white/60">동영상</span>
        </div>
        <PH_Svg className="w-[20px] h-[20px]"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></PH_Svg>
      </div>
      <div className="flex-1 overflow-y-auto ph-scroll px-[24px]">
        <div className="mt-[14px] flex justify-center">
          <PH_Cover np={np} size={270} radius={10} big={true} />
        </div>
        {np.caption && (
          <div className="mt-[18px] inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full bg-white/12 text-white/85 text-[11px]">
            {p.playing && <PH_Eq color="#ff4e45" h={9} />}
            {np.caption}
          </div>
        )}
        <div className="flex items-center justify-between mt-[10px]">
          <div className="min-w-0">
            <div className="text-white text-[20px] font-bold truncate">{np.title}</div>
            <div className="text-white/60 text-[14px] truncate">{np.artist + (np.album ? " · " + np.album : "")}</div>
          </div>
        </div>
        <div className="flex gap-[8px] mt-[12px]">
          <div className="flex items-center gap-[6px] bg-white/12 rounded-full px-[12px] py-[6px] text-white text-[12px]">
            <PH_Svg className="w-[15px] h-[15px]" fill="currentColor" sw={0}><path d="M2 21h4V9H2zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3a1.5 1.5 0 0 0-.4-1L13.1 1 7.6 6.6C7.2 7 7 7.5 7 8v11a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7z" /></PH_Svg>
            {np.likes || "1.2만"}
          </div>
          <div className="flex items-center bg-white/12 rounded-full px-[12px] py-[6px] text-white">
            <PH_Svg className="w-[15px] h-[15px] rotate-180" fill="currentColor" sw={0}><path d="M2 21h4V9H2zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3a1.5 1.5 0 0 0-.4-1L13.1 1 7.6 6.6C7.2 7 7 7.5 7 8v11a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7z" /></PH_Svg>
          </div>
          <div className="flex items-center gap-[6px] bg-white/12 rounded-full px-[12px] py-[6px] text-white text-[12px]">
            <PH_Svg className="w-[15px] h-[15px]"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /></PH_Svg>
            공유
          </div>
        </div>
        {/* 진행바 */}
        <div className="mt-[18px]">
          <div className="h-[3px] rounded-full bg-white/25 relative">
            <div className="h-full rounded-full bg-white" style={{ width: (prog * 100) + "%" }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-white" style={{ left: "calc(" + (prog * 100) + "% - 5px)" }} />
          </div>
          <div className="flex justify-between text-[11px] text-white/55 mt-[6px]">
            <span>{elapsed}</span><span>{np.duration || "3:30"}</span>
          </div>
        </div>
        {/* 컨트롤 */}
        <div className="flex items-center justify-between mt-[8px] text-white px-[4px]">
          <PH_Svg className="w-[22px] h-[22px] text-white/70"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></PH_Svg>
          <PH_Svg className="w-[30px] h-[30px]" fill="currentColor" sw={0}><path d="M6 6h2v12H6zM9.5 12 18 6v12z" /></PH_Svg>
          <div onClick={function() { p.setPlaying(!p.playing); }} className="cursor-pointer w-[64px] h-[64px] rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
            {p.playing
              ? <PH_Svg className="w-[26px] h-[26px]" fill="currentColor" sw={0}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></PH_Svg>
              : <PH_Svg className="w-[26px] h-[26px] ml-[3px]" fill="currentColor" sw={0}><path d="M7 4v16l13-8z" /></PH_Svg>}
          </div>
          <PH_Svg className="w-[30px] h-[30px]" fill="currentColor" sw={0}><path d="M16 6h2v12h-2zM14.5 12 6 18V6z" /></PH_Svg>
          <PH_Svg className="w-[22px] h-[22px] text-white/70"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></PH_Svg>
        </div>
        {/* 다음 트랙 */}
        {queue.length > 0 && (
          <div className="mt-[22px] mb-[14px]">
            <div className="flex gap-[18px] text-[12.5px] font-semibold mb-[10px] border-b border-white/10">
              <span className="text-white pb-[8px] border-b-2 border-white">다음 트랙</span>
              <span className="text-white/45 pb-[8px]">가사</span>
              <span className="text-white/45 pb-[8px]">관련 항목</span>
            </div>
            {queue.map(function(q, i) {
              return (
                <div key={i} className="flex items-center gap-[10px] py-[6px]">
                  <PH_Cover np={q} size={40} radius={4} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] truncate">{q.title}</div>
                    <div className="text-white/50 text-[11.5px] truncate">{q.artist}</div>
                  </div>
                  <span className="text-white/45 text-[11px]">{q.duration || ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PH_Cover(p) {
  var np = p.np;
  var s = p.size;
  if (np.cover) {
    return <img src={np.cover} alt="" style={{ width: s, height: s, borderRadius: p.radius, objectFit: "cover", boxShadow: p.big ? "0 12px 30px rgba(0,0,0,0.5)" : "none" }} />;
  }
  var c1 = PH_color(np.title);
  var c2 = PH_color((np.artist || "") + "x");
  return (
    <div style={{
      width: s, height: s, borderRadius: p.radius, position: "relative", overflow: "hidden", flexShrink: 0,
      background: "linear-gradient(135deg," + c1 + " 0%," + c2 + " 100%)",
      boxShadow: p.big ? "0 12px 30px rgba(0,0,0,0.5)" : "0 1px 2px rgba(0,0,0,0.3)"
    }}>
      <div style={{ position: "absolute", width: s * 0.9, height: s * 0.9, borderRadius: "50%", right: -s * 0.3, bottom: -s * 0.3, background: "radial-gradient(circle,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0) 70%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.18) 0%,rgba(0,0,0,0.25) 100%)" }} />
      {p.big && (
        <div style={{ position: "absolute", left: 18, bottom: 16, right: 18, color: "#fff" }}>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.5, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>{np.title}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{np.artist}</div>
        </div>
      )}
      {!p.big && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: s * 0.38 }}>
          {(np.title || "?").charAt(0)}
        </div>
      )}
    </div>
  );
}

function PH_Eq(p) {
  var h = p.h || 10;
  return (
    <div className="flex items-end gap-[1.5px] shrink-0" style={{ height: h }}>
      {[0, 1, 2].map(function(i) {
        return <div key={i} className="ph-eq w-[2px] rounded-full" style={{ height: h, background: p.color, animationDelay: (i * 0.22) + "s" }} />;
      })}
    </div>
  );
}

/* ══════════════ 캘린더 ══════════════ */

function PH_CalendarApp(p) {
  var t = p.today;
  var mS = useState(t.m); var vm = mS[0]; var setVm = mS[1];
  var yS = useState(t.y); var vy = yS[0]; var setVy = yS[1];
  var dS = useState(t.d); var sel = dS[0]; var setSel = dS[1];

  function prev() { if (vm === 1) { setVm(12); setVy(vy - 1); } else setVm(vm - 1); setSel(1); }
  function next() { if (vm === 12) { setVm(1); setVy(vy + 1); } else setVm(vm + 1); setSel(1); }

  var total = PH_daysIn(vy, vm);
  var start = PH_firstDow(vy, vm);
  var cells = [];
  var k;
  for (k = 0; k < start; k++) cells.push(<div key={"b" + k} className="border-t border-black/5" />);
  for (k = 1; k <= total; k++) {
    var dow = (start + k - 1) % 7;
    var isToday = k === t.d && vm === t.m && vy === t.y;
    var isSel = k === sel;
    var hits = [];
    for (var e = 0; e < p.events.length; e++) if (PH_hit(p.events[e], vm, k)) hits.push(p.events[e]);
    cells.push(
      <div key={k} onClick={(function(d) { return function() { setSel(d); }; })(k)}
        className="border-t border-black/5 pt-[3px] cursor-pointer overflow-hidden" style={{ background: isSel ? "rgba(58,100,200,0.07)" : "transparent" }}>
        <div className="flex justify-center">
          <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11.5px]"
            style={{
              background: isToday ? "#3a64c8" : "transparent",
              color: isToday ? "#fff" : dow === 0 ? "#e5484d" : dow === 6 ? "#3a64c8" : "#222",
              fontWeight: isToday ? 700 : 500
            }}>{k}</div>
        </div>
        {hits.slice(0, 2).map(function(h, hi) {
          return (
            <div key={hi} className="mx-[1px] mt-[1px] px-[2px] rounded-[3px] text-[8px] leading-[12px] text-white truncate" style={{ background: h.color }}>{h.label}</div>
          );
        })}
      </div>
    );
  }
  var trail = (7 - ((start + total) % 7)) % 7;
  for (k = 0; k < trail; k++) cells.push(<div key={"a" + k} className="border-t border-black/5" />);

  var selEvents = p.events.filter(function(ev) { return PH_hit(ev, vm, sel); });
  var selDow = (start + sel - 1) % 7;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="flex items-center justify-between px-[14px] pt-[8px] pb-[6px]">
        <div className="flex items-center gap-[6px]">
          <PH_Svg className="w-[22px] h-[22px] text-[#222] cursor-pointer" onClick={p.onBack}><path d="m15 18-6-6 6-6" /></PH_Svg>
          <span className="text-[22px] font-semibold text-[#111]">{vm + "월"}</span>
          <span className="text-[13px] text-[#999] mt-[4px]">{vy}</span>
        </div>
        <div className="flex items-center gap-[14px] text-[#333]">
          <PH_Svg className="w-[20px] h-[20px] cursor-pointer" onClick={prev}><path d="m15 18-6-6 6-6" /></PH_Svg>
          <PH_Svg className="w-[20px] h-[20px] cursor-pointer" onClick={next}><path d="m9 18 6-6-6-6" /></PH_Svg>
          <div className="w-[22px] h-[22px] rounded-[5px] border-[1.8px] border-[#333] flex items-center justify-center text-[9px] font-bold">{t.d}</div>
        </div>
      </div>
      <div className="grid grid-cols-7 px-[4px]">
        {PH_DOW().map(function(h, i) {
          return <div key={i} className="text-center text-[10.5px] py-[4px] font-medium" style={{ color: i === 0 ? "#e5484d" : i === 6 ? "#3a64c8" : "#888" }}>{h}</div>;
        })}
      </div>
      <div className="grid grid-cols-7 px-[4px] flex-1 min-h-0" style={{ gridAutoRows: "1fr" }}>{cells}</div>
      <div className="bg-[#f5f6f8] rounded-t-[22px] px-[18px] pt-[12px] pb-[10px] min-h-[120px] max-h-[40%] overflow-y-auto ph-scroll">
        <div className="text-[13px] font-semibold text-[#333] mb-[8px]">{vm + "월 " + sel + "일 " + PH_DOW()[selDow] + "요일"}</div>
        {selEvents.length === 0 && <div className="text-[12.5px] text-[#aaa]">일정 없음</div>}
        {selEvents.map(function(ev, i) {
          var ds = ev.sm + "/" + ev.sd + (ev.sm !== ev.em || ev.sd !== ev.ed ? " ~ " + ev.em + "/" + ev.ed : "");
          return (
            <div key={i} className="flex items-center gap-[10px] bg-white rounded-[12px] px-[12px] py-[9px] mb-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="w-[4px] h-[28px] rounded-full" style={{ background: ev.color }} />
              <div className="min-w-0">
                <div className="text-[13.5px] text-[#222] truncate">{ev.label}</div>
                <div className="text-[11px] text-[#999]">{ds === ev.sm + "/" + ev.sd ? "종일" : ds}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ 커뮤니티 ══════════════ */

function PH_CommHeader(p) {
  return (
    <div className="bg-[#3b4890] text-white">
      <div className="flex items-center justify-between px-[10px] py-[9px]">
        <div className="flex items-center gap-[6px] min-w-0">
          <PH_Svg className="w-[22px] h-[22px] cursor-pointer shrink-0" onClick={p.onBack}><path d="m15 18-6-6 6-6" /></PH_Svg>
          <span className="font-bold text-[16px] truncate">{p.title}</span>
        </div>
        <div className="flex items-center gap-[14px] shrink-0">
          <PH_Svg className="w-[19px] h-[19px]"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></PH_Svg>
          <PH_Svg className="w-[19px] h-[19px]"><path d="M4 6h16M4 12h16M4 18h16" /></PH_Svg>
        </div>
      </div>
    </div>
  );
}

function PH_CommList(p) {
  var c = p.comm;
  var tS = useState("all"); var tab = tS[0]; var setTab = tS[1];
  var idx = [];
  for (var i = 0; i < c.posts.length; i++) if (tab === "all" || c.posts[i].hot) idx.push(i);
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <PH_CommHeader title={c.gallery} onBack={p.onBack} />
      <div className="flex border-b border-[#ddd] text-[13px] bg-white">
        <div onClick={function() { setTab("all"); }} className={"flex-1 text-center py-[8px] cursor-pointer " + (tab === "all" ? "text-[#3b4890] font-bold border-b-2 border-[#3b4890]" : "text-[#777]")}>전체글</div>
        <div onClick={function() { setTab("hot"); }} className={"flex-1 text-center py-[8px] cursor-pointer " + (tab === "hot" ? "text-[#3b4890] font-bold border-b-2 border-[#3b4890]" : "text-[#777]")}>개념글</div>
        <div className="flex-1 text-center py-[8px] text-[#777]">공지</div>
      </div>
      <div className="flex-1 overflow-y-auto ph-scroll">
        {idx.map(function(pi) {
          var post = c.posts[pi];
          var cc = (post.comments || []).length;
          return (
            <div key={pi} onClick={function() { p.onOpen(pi); }} className="px-[12px] py-[9px] border-b border-[#eee] cursor-pointer active:bg-[#f5f5f5]">
              <div className="flex items-center gap-[4px] text-[14px] text-[#222] leading-[19px]">
                {post.hot && <span className="shrink-0 text-[10px] font-bold text-white bg-[#d31900] rounded-[3px] px-[3px] leading-[14px]">개념</span>}
                <span className="truncate">{post.title}</span>
                {cc > 0 && <span className="text-[#d31900] text-[12px] font-bold shrink-0">{"[" + cc + "]"}</span>}
              </div>
              <div className="flex items-center gap-[5px] text-[11px] text-[#999] mt-[3px]">
                <span className="text-[#555]">{post.author}</span>
                {post.ip && <span>{"(" + post.ip + ")"}</span>}
                <span className="text-[#ddd]">|</span>
                <span>{PH_shortDate(post.date)}</span>
                <span className="text-[#ddd]">|</span>
                <span>{"조회 " + (post.views || 0)}</span>
                <span className="text-[#ddd]">|</span>
                <span>{"추천 " + (post.recommend || 0)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PH_CommPost(p) {
  var post = p.post;
  var comments = post.comments || [];
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <PH_CommHeader title={p.comm.gallery} onBack={p.onBack} />
      <div className="flex-1 overflow-y-auto ph-scroll">
        <div className="px-[12px] pt-[12px] pb-[10px] border-b border-[#eee]">
          <div className="text-[16px] font-bold text-[#222] leading-[22px]">{post.title}</div>
          <div className="flex justify-between text-[11px] text-[#999] mt-[6px]">
            <span><span className="text-[#555]">{post.author}</span>{post.ip ? " (" + post.ip + ")" : ""}</span>
            <span>{post.date}</span>
          </div>
          <div className="text-[11px] text-[#999] mt-[2px]">{"조회 " + (post.views || 0) + " · 추천 " + (post.recommend || 0) + " · 댓글 " + comments.length}</div>
        </div>
        <div className="px-[12px] py-[14px] text-[14px] text-[#333] leading-[23px] whitespace-pre-wrap break-all">{post.content}</div>
        <div className="flex justify-center gap-[10px] pb-[18px]">
          <div className="w-[72px] h-[64px] rounded-[6px] border border-[#d1d1d1] bg-[#f7f7f7] flex flex-col items-center justify-center shadow-[2px_2px_0_#bbb]">
            <div className="text-[20px] font-bold text-[#3b4890] leading-none">{post.recommend || 0}</div>
            <div className="text-[11px] text-[#555] font-bold mt-[3px]">★ 개념</div>
          </div>
          <div className="w-[72px] h-[64px] rounded-[6px] border border-[#d1d1d1] bg-[#f7f7f7] flex flex-col items-center justify-center shadow-[2px_2px_0_#ccc]">
            <div className="text-[20px] font-bold text-[#888] leading-none">{post.dislike || 0}</div>
            <div className="text-[11px] text-[#888] font-bold mt-[3px]">비추</div>
          </div>
        </div>
        <div className="bg-[#f7f7f7] border-t border-[#e5e5e5]">
          <div className="px-[12px] py-[8px] text-[12px] font-bold text-[#3b4890] border-b border-[#eee]">{"전체 댓글 " + comments.length + "개"}</div>
          {comments.map(function(cm, i) {
            return (
              <div key={i} className={"px-[12px] py-[8px] border-b border-[#eee] text-[12.5px] flex " + (cm.isReply ? "bg-[#f0f0f0]" : "")}>
                {cm.isReply && <span className="mr-[6px] text-[#bbb]">└</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span><span className="font-bold text-[#333]">{cm.author}</span>{cm.ip && <span className="text-[#999] text-[11px]">{" (" + cm.ip + ")"}</span>}</span>
                    <span className="text-[#aaa] text-[10.5px]">{cm.date}</span>
                  </div>
                  <div className="text-[#333] mt-[2px] break-all whitespace-pre-wrap">{cm.content}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-[6px] px-[8px] py-[7px] border-t border-[#ddd] bg-white">
        <div className="flex-1 h-[34px] rounded-[4px] border border-[#ccc] px-[10px] flex items-center text-[12.5px] text-[#aaa]">댓글을 입력하세요</div>
        <div className="h-[34px] px-[14px] rounded-[4px] bg-[#3b4890] text-white text-[12.5px] font-bold flex items-center">등록</div>
      </div>
    </div>
  );
}

/* ══════════════ 상태바 ══════════════ */

function PH_StatusBar(p) {
  var c = p.light ? "#ffffff" : "#111111";
  return (
    <div className="flex justify-between items-center px-[20px] pt-[8px] pb-[4px] text-[12px] font-medium relative z-20" style={{ color: c, background: p.bg }}>
      <div className="flex items-center gap-[5px] h-[14px]">
        {p.kakao && (
          <div className="w-[13px] h-[13px] rounded-[3px] flex items-center justify-center" style={{ background: c }}>
            <span style={{ fontSize: 5, fontWeight: 900, color: p.light ? "#000" : "#fff", letterSpacing: -0.2 }}>TALK</span>
          </div>
        )}
        {p.sms && <PH_Svg className="w-[13px] h-[13px]" fill="currentColor" sw={0}><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></PH_Svg>}
        {p.music && <PH_Svg className="w-[12px] h-[12px]" fill="currentColor" sw={0}><path d="M7 4v16l13-8z" /></PH_Svg>}
        <span className="text-[13px] leading-none tracking-[1px] opacity-80">···</span>
      </div>
      <div className="flex items-center gap-[5px]">
        <PH_Svg className="w-[14px] h-[14px]" sw={2.4}><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M5 12.6a10 10 0 0 1 14 0" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><path d="M12 20h.01" /></PH_Svg>
        <div className="flex items-end gap-[1.5px] h-[11px]">
          <div className="w-[2.5px] h-[30%] rounded-[1px]" style={{ background: c }} />
          <div className="w-[2.5px] h-[55%] rounded-[1px]" style={{ background: c }} />
          <div className="w-[2.5px] h-[78%] rounded-[1px]" style={{ background: c }} />
          <div className="w-[2.5px] h-[100%] rounded-[1px]" style={{ background: c, opacity: 0.4 }} />
        </div>
        <span className="text-[11.5px]">{p.battery + "%"}</span>
        <div className="flex items-center">
          <div className="w-[11px] h-[17px] rounded-[2.5px] border-[1.5px] flex flex-col justify-end p-[1px] rotate-0" style={{ borderColor: c, width: 10, height: 16 }}>
            <div className="w-full rounded-[1px]" style={{ height: Math.max(8, p.battery) + "%", background: p.battery <= 15 ? "#ef4444" : c }} />
          </div>
        </div>
        <span className="ml-[1px]">{p.time}</span>
      </div>
    </div>
  );
}

/* ══════════════ 공통 헬퍼 ══════════════ */

function PH_DOW() { return ["일", "월", "화", "수", "목", "금", "토"]; }

function PH_Svg(p) {
  return (
    <svg className={p.className} style={p.style} onClick={p.onClick} viewBox="0 0 24 24"
      fill={p.fill || "none"} stroke={p.sw === 0 ? "none" : "currentColor"} strokeWidth={p.sw || 2}
      strokeLinecap="round" strokeLinejoin="round">
      {p.children}
    </svg>
  );
}

function PH_GoogleG() {
  return (
    <svg viewBox="0 0 48 48" style={{ width: 18, height: 18 }}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.2C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function PH_css() {
  return "@keyframes phEq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}" +
    ".ph-eq{transform-origin:bottom;animation:phEq .9s ease-in-out infinite}" +
    ".ph-scroll{scrollbar-width:none}.ph-scroll::-webkit-scrollbar{display:none}" +
    ".ph-glass{background:rgba(255,255,255,0.13);-webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,0.18),0 4px 14px rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.08)}";
}

function PH_theme(app, sub) {
  if (app === "kakao" && sub >= 0) return { bg: "#BACEE0", bar: "#BACEE0", nav: "#ffffff", light: false };
  if (app === "kakao") return { bg: "#ffffff", bar: "#ffffff", nav: "#ffffff", light: false };
  if (app === "sms") return { bg: "#000000", bar: "#000000", nav: "#000000", light: true };
  if (app === "music") return { bg: "#121212", bar: "transparent", nav: "#030303", light: true };
  if (app === "calendar") return { bg: "#ffffff", bar: "#ffffff", nav: "#f5f6f8", light: false };
  if (app === "community") return { bg: "#ffffff", bar: "#3b4890", nav: "#ffffff", light: true };
  return { bg: "#000", bar: "transparent", nav: "transparent", light: true };
}

function PH_wallpaper(w) {
  if (!w) {
    return "linear-gradient(118deg,#07080b 0%,#10141b 30%,#232b38 44%,#56647a 50%,#1b212b 56%,#0b0d12 75%,#050506 100%)";
  }
  if (/^(https?:|data:)/.test(w)) return "url(\"" + w + "\") center/cover no-repeat, #000";
  return w;
}

function PH_color(str) {
  var colors = ["#534ab7", "#1d9e75", "#d85a30", "#185fa5", "#993556", "#ba7517", "#3b6d11", "#a32d2d"];
  var h = 0;
  var s = String(str || "익명");
  for (var i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function PH_merge(base, over) {
  var out = {};
  var k;
  for (k in base) out[k] = base[k];
  if (over) for (k in over) if (over[k] !== undefined) out[k] = over[k];
  return out;
}

function PH_lastMsg(list) {
  list = list || [];
  for (var i = list.length - 1; i >= 0; i--) if (!list[i].date) return list[i];
  return null;
}

function PH_authors(list) {
  var seen = {};
  var out = [];
  list = list || [];
  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    if (m.date || m.system || m.isMe || !m.author || seen[m.author]) continue;
    seen[m.author] = 1;
    out.push(m.author);
  }
  return out;
}

function PH_parseDate(str) {
  var m = (str || "").match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  var y = m ? parseInt(m[1], 10) : 2026;
  var mo = m ? parseInt(m[2], 10) : 1;
  var d = m ? parseInt(m[3], 10) : 1;
  return { y: y, m: mo, d: d, dow: new Date(y, mo - 1, d).getDay() };
}

function PH_daysIn(y, m) { return new Date(y, m, 0).getDate(); }
function PH_firstDow(y, m) { return new Date(y, m - 1, 1).getDay(); }

function PH_hit(ev, month, day) {
  if (ev.sm === ev.em) return month === ev.sm && day >= ev.sd && day <= ev.ed;
  return (month === ev.sm && day >= ev.sd) || (month === ev.em && day <= ev.ed) || (month > ev.sm && month < ev.em);
}

function PH_getEvents(props) {
  var palette = ["#3a64c8", "#e5484d", "#1d9e75", "#ba7517", "#8e4ec6", "#d85a30"];
  var raw = [];
  var i;
  if (props.events && props.events.length) {
    for (i = 0; i < props.events.length; i++) raw.push({ text: (props.events[i].date || "") + " " + (props.events[i].label || ""), color: props.events[i].color });
  } else if (props.promise) {
    var parts = props.promise.split(" · ");
    for (i = 0; i < parts.length; i++) raw.push({ text: parts[i].replace(/^평생,\s*/, "") });
  }
  var out = [];
  for (i = 0; i < raw.length; i++) {
    var s = raw[i].text.trim();
    var range = s.match(/^(\d{1,2})\/(\d{1,2})\s*~\s*(\d{1,2})\/(\d{1,2})\s*(.*)$/);
    var single = !range && s.match(/^(\d{1,2})\/(\d{1,2})\s*(.*)$/);
    var ev = null;
    if (range) ev = { sm: +range[1], sd: +range[2], em: +range[3], ed: +range[4], label: range[5] };
    else if (single) ev = { sm: +single[1], sd: +single[2], em: +single[1], ed: +single[2], label: single[3] };
    if (ev) {
      ev.label = ev.label.trim() || "일정";
      ev.color = raw[i].color || palette[out.length % palette.length];
      out.push(ev);
    }
  }
  return out;
}

function PH_upcoming(events, t) {
  var base = new Date(t.y, t.m - 1, t.d).getTime();
  var out = [];
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var endY = ev.em < ev.sm ? t.y + 1 : t.y;
    var end = new Date(endY, ev.em - 1, ev.ed).getTime();
    var st = new Date(t.y, ev.sm - 1, ev.sd).getTime();
    if (end < base) continue;
    var dd = Math.max(0, Math.round((st - base) / 86400000));
    out.push(PH_merge(ev, { dday: dd, _t: st }));
  }
  out.sort(function(a, b) { return a._t - b._t; });
  return out;
}

function PH_toSec(s) {
  var m = String(s).match(/(\d+):(\d{2})/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 210;
}

function PH_fmtSec(n) {
  var s = n % 60;
  return Math.floor(n / 60) + ":" + (s < 10 ? "0" + s : s);
}

function PH_shortDate(d) {
  var m = String(d || "").match(/(\d{2}):(\d{2})/);
  return m ? m[1] + ":" + m[2] : String(d || "");
}

/* ══════════════ 기본 데이터 (props 없을 때) ══════════════ */

function PH_defaultRooms(owner) {
  return [
    {
      name: "가족 단톡방", members: 4, unread: 3, pinned: true,
      messages: [
        { date: "2026년 9월 28일 월요일" },
        { author: "엄마", content: "아들 밥은 먹었니", time: "오전 11:52", isMe: false },
        { author: "엄마", content: "추석 때 올 수 있지?", time: "오전 11:52", isMe: false },
        { author: "아빠", content: "바쁘면 무리하지 말고", time: "오후 12:30", isMe: false },
        { author: "누나", content: "엄마 " + owner + " 또 읽씹 각", time: "오후 1:58", isMe: false }
      ]
    },
    {
      name: "녹티스 아스트라", members: 6, unread: 27, muted: true,
      messages: [
        { author: "리안", content: "오늘 22시 정기 집결", time: "오후 1:40", isMe: false },
        { author: "세르", content: "좌표는 기존과 동일", time: "오후 1:41", isMe: false },
        { author: "리안", content: owner + " 확인 바람", time: "오후 2:03", isMe: false }
      ]
    },
    {
      name: "개노답4형제", members: 4, unread: 58,
      messages: [
        { author: "태식", content: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋ", time: "오후 2:05", isMe: false },
        { author: "민규", content: "야 " + owner + " 어디감", time: "오후 2:06", isMe: false },
        { author: "나", content: "일함", time: "오후 2:07", isMe: true, unread: 0 },
        { author: "재현", content: "구라치네 ㅋㅋ 오늘 술 ㄱ?", time: "오후 2:09", isMe: false }
      ]
    },
    {
      name: "청암증권 리서치팀", members: 12, unread: 1,
      messages: [
        { author: "박 팀장", content: "오후 4시 회의 자료 공유드립니다.", time: "오후 1:15", isMe: false },
        { author: "박 팀장", content: owner + " 대리, 반도체 섹터 정리본 부탁해요.", time: "오후 1:16", isMe: false }
      ]
    }
  ];
}

function PH_defaultSms() {
  return [
    {
      name: "흑야회", number: "비공개 번호", unread: 2, avatar: "黑", avatarColor: "#1a1a1a",
      messages: [
        { date: "2026년 9월 27일 일요일" },
        { content: "물건은 예정대로.", time: "오후 11:48", isMe: false },
        { content: "확인.", time: "오후 11:52", isMe: true },
        { date: "2026년 9월 28일 월요일" },
        { content: "자정. 부두 7번 창고.", time: "오후 2:02", isMe: false },
        { content: "혼자 와라.", time: "오후 2:02", isMe: false }
      ]
    },
    {
      name: "[Web발신]", number: "15881688", unread: 0,
      messages: [
        { content: "[Web발신]\n고객님의 택배가 배송 완료되었습니다.", time: "오전 10:21", isMe: false }
      ]
    }
  ];
}

function PH_defaultNowPlaying(owner) {
  return {
    title: "밤편지",
    artist: "아이유",
    album: "Palette",
    duration: "4:13",
    progress: 0.42,
    caption: owner + "님을 위한 오늘의 추천",
    playing: true,
    queue: [
      { title: "Blue Night", artist: "새벽공방", duration: "3:48" },
      { title: "Moonlight Drive", artist: "Neon Tides", duration: "4:02" },
      { title: "우리의 밤", artist: "소란", duration: "3:35" }
    ]
  };
}

function PH_defaultCommunity() {
  return {
    appName: "디시인사이드",
    iconText: "dc",
    gallery: "주식 갤러리",
    posts: [
      {
        title: "청암증권 리포트 이번엔 좀 맞추냐", author: "ㅇㅇ", ip: "118.235", date: "2026.09.28 13:58:12",
        views: 842, recommend: 31, dislike: 2, hot: true,
        content: "반도체 섹터 정리한 거 봤는데 생각보다 잘 썼더라\n누가 쓴 거임?",
        comments: [
          { author: "ㅇㅇ", ip: "39.7", content: "리서치팀 신입이라던데", date: "14:01" },
          { author: "개미", ip: "211.36", content: "ㄹㅇ 이번엔 믿어봄", date: "14:03", isReply: true }
        ]
      },
      { title: "오늘 장 마감 전망", author: "주린이", ip: "106.101", date: "2026.09.28 13:40:02", views: 211, recommend: 3, content: "횡보 예상함", comments: [] },
      { title: "부두 쪽 창고 매물 나왔던데", author: "ㅇㅇ", ip: "223.38", date: "2026.09.28 12:12:45", views: 97, recommend: 0, content: "누가 샀는지 아는 사람?", comments: [{ author: "ㅇㅇ", ip: "175.223", content: "거기 가지 마라", date: "12:20" }] }
    ]
  };
}

function PH_Demo() {
  return (
    <div className="py-6 bg-gray-100 min-h-screen">
      <Phone
        owner="건우"
        statusTime="오후 2:11"
        battery={90}
        dateTime="2026년 9월 28일"
        promise="9/28 반도체 섹터 보고 · 9/30 녹티스 정기 집결 · 10/3~10/5 추석 본가 · 10/9 개노답 모임"
      />
    </div>
  );
}
