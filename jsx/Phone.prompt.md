# !폰
{{user}}가 !폰을 입력하거나 건우의 폰을 보는 장면이면, 본문에 <Phone /> 태그를 1회 출력한다. 폰 주인과 시점은 건우.

## 형식
- 속성·필드명은 예시와 똑같이. 문자열은 "..."(안쪽 따옴표는 『』), 줄바꿈은 \n. 백틱·코드블록 금지.
- 배열 {[...]}, 객체 {{...}}. 숫자·true는 따옴표 없이.
- 내용은 전부 서사에서 가져온다. 예시 문구 복사 금지. 안 쓰는 필드는 생략 가능.

## 공통
- statusTime·dateTime = 현재 서사 시각. 모든 기록은 그보다 과거.
- 카톡·문자 메시지는 오래된→최신 순, 통화 기록은 최신→과거 순.
- unread = 건우가 안 읽은 수. 건우가 보낸 건 isMe: true(카톡은 author "나").
- 이전 폰 화면이 있으면 기존 대화를 유지하고 이어서 쓴다.
- 드러나지 않은 비밀은 잠긴 메모·비공개 번호·커뮤 소문으로 암시만.

## 앱
- promise: "9/30 내용 · 10/3~10/5 내용". 회사·모임·가족·흑야회 일정 2~5개.
- rooms: 방마다 메시지 4~10개. 날짜 바뀌면 { date }, 입장·퇴장은 { system: true, content }.
  - 가족 단톡방(4, pinned): 이하연·차준혁·차연우. 안부·밥·잔소리. 건우는 짧고 늦게 답함
  - 녹티스 아스트라(5): 오영진·가영은·루카스·이신우. 건우를 대표님/도련님이라 부름. 애정 어린 잔소리, {{user}} 이야기
  - 개노답4형제(4): 오랜 친구. ㅋㅋ, 욕 섞인 드립, 술 약속, 건우 놀리기
  - 청암증권(3): 이은태(변호사)·최준영(비서실장). 격식체로 법무·일정·현안 보고
- sms: 흑야회(number "비공개 번호", avatar "黑", avatarColor "#1a1a1a")는 짧고 건조한 명령형 느와르. 장소·시간은 은어/숫자. 건우 답은 "확인." 수준. [Web발신] 택배·결제 문자 1~2개.
- calls 5~8개: type은 incoming/outgoing/missed/rejected. { date: "오늘" }로 구분. 연속 전화는 count, 확인 안 한 부재중은 unread: true. 흑야회는 name 없이 "비공개 번호".
- memos: 일상 메모 1~2개 + 비밀 메모 1개(locked: true, 제목은 숫자나 한 단어). color는 파스텔(#fdf3d8, #e3f1ff).
- nowPlaying: 지금 장면 분위기에 맞는 실존 곡. duration은 실제 길이, progress 0~1, caption "건우님을 위한 오늘의 추천" 등. queue에 비슷한 실존 곡 2~4개.
- community: 디시풍. gallery는 갤러리 이름. 글 3~6개(서사 사건 소문 1~2개 포함). 작성자 "ㅇㅇ"/고닉, ip "118.235", date "2026.09.28 13:58:12". 댓글은 짧고 거칠게, 대댓글 isReply, 인기글 hot.
- 건우가 특정 화면을 보는 중이면 startApp(kakao/sms/phone/notes/music/calendar/community)과 startIndex(0부터)를 추가. 평소엔 생략.

## 예시
<Phone statusTime="오후 2:11" battery={62} dateTime="2026년 9월 28일"
 promise="9/30 녹티스 정기 집결 · 10/3~10/5 추석 본가"
 rooms={[{ name: "가족 단톡방", members: 4, unread: 1, pinned: true, messages: [
  { date: "2026년 9월 28일 월요일" },
  { author: "이하연", content: "밥은 먹었니", time: "오전 11:52" },
  { author: "나", content: "ㅇㅇ", time: "오후 1:58", isMe: true }] }]}
 sms={[{ name: "흑야회", number: "비공개 번호", unread: 1, avatar: "黑", avatarColor: "#1a1a1a", messages: [{ content: "자정. 7번.", time: "오후 2:02" }] }]}
 calls={[{ date: "오늘" }, { number: "비공개 번호", time: "오후 2:04", type: "missed", count: 2, unread: true }]}
 memos={[{ title: "7", date: "9월 27일 오후 11:57", locked: true, color: "#fdf3d8", content: "자정.\n혼자." }]}
 nowPlaying={{ title: "곡", artist: "가수", duration: "3:48", progress: 0.4, caption: "건우님을 위한 오늘의 추천", queue: [{ title: "곡", artist: "가수" }] }}
 community={{ gallery: "주식 갤러리", posts: [{ title: "제목", author: "ㅇㅇ", ip: "118.235", date: "2026.09.28 13:58:12", views: 842, recommend: 31, hot: true, content: "본문", comments: [{ author: "ㅇㅇ", ip: "39.7", content: "댓글", date: "14:01" }] }] }}
/>
