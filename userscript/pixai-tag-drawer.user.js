// ==UserScript==
// @name         PixAI 태그 서랍
// @namespace    https://github.com/kkm4244-gif/claude
// @version      0.7.1
// @description  PixAI 프롬프트 태그를 한글로 찾고, 저장하고, 클릭 한 번으로 넣는 패널
// @match        https://pixai.art/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/kkm4244-gif/claude/claude/pixai-tag-storage-db779j/userscript/pixai-tag-drawer.user.js
// @downloadURL  https://raw.githubusercontent.com/kkm4244-gif/claude/claude/pixai-tag-storage-db779j/userscript/pixai-tag-drawer.user.js
// ==/UserScript==

// 이 파일은 tools/build-userscript.mjs 로 만들어져요. 직접 고치지 말고 extension/ 쪽을 고친 뒤 다시 빌드하세요.
(function () {
'use strict';

// 기본 태그 사전
// 한 줄에 태그 하나: 영어태그|한글 설명|추가 검색어(공백 구분, 생략 가능)
// order: 정렬할 때의 위치 (화질 → 인원 → 외형 → 의상·소품 → 표정·포즈 → 구도 → 배경·조명)
const DEFAULT_CATEGORIES = [
  {
    id: 'quality', name: '화질·화풍·분위기', order: 0, tags: `
masterpiece|걸작|퀄리티
best quality|최고 품질|퀄리티
high quality|고품질|퀄리티
very aesthetic|아주 미려함 (일부 모델용)|퀄리티
highres|고해상도
absurdres|초고해상도
ultra-detailed|초정밀 묘사|디테일
detailed eyes|섬세한 눈|디테일
detailed face|섬세한 얼굴|디테일
official art|공식 일러스트풍
anime coloring|애니 채색|화풍
anime screencap|애니 캡처풍|화풍
cel shading|셀 채색|화풍
flat color|단색 평면 채색|화풍
game cg|게임 CG풍|화풍
3d|3D|화풍
realistic|실사풍|리얼 화풍
semi-realistic|반실사풍|화풍
watercolor (medium)|수채화|화풍
oil painting (medium)|유화|화풍
traditional media|아날로그 그림|화풍
sketch|스케치|화풍
lineart|선화|화풍
monochrome|흑백|화풍
greyscale|그레이스케일|흑백
retro artstyle|레트로 화풍|복고 90년대
1990s (style)|90년대 화풍|레트로
pixel art|픽셀 아트|도트
chibi|치비|SD 꼬마
comic|만화 컷|코믹
high-class atmosphere|고급스러운 분위기|럭셔리 상류층
elegant|우아함|분위기 기품
sophisticated|세련됨|분위기 도시적
noir|누아르|분위기 어두운 범죄 영화
` },
  {
    id: 'people', name: '인원', order: 1, tags: `
1boy|남자 1명|남자 소년 남성 한명
2boys|남자 2명|두명
3boys|남자 3명|세명
multiple boys|남자 여러 명
1girl|여자 1명|여자 소녀 여성 한명
2girls|여자 2명|두명
multiple girls|여자 여러 명
solo|혼자 등장|단독 한명 솔로
solo focus|한 명에 초점
male focus|남성 중심
couple|커플|연인
hetero|남녀 커플
brothers|형제
twins|쌍둥이
father and son|아버지와 아들|부자
mature male|성숙한 남성|어른 아저씨 성인
old man|노인 남성|할아버지
bishounen|미소년|꽃미남
bara|바라 (근육질 남성 화풍)|근육 마초
aged up|나이 올림|성인화 어른
` },
  {
    id: 'role', name: '직업·컨셉', order: 1.5, tags: `
salaryman|샐러리맨|회사원 직장인
businessman|비즈니스맨|회사원 직장인
butler|집사
student|학생
teacher|선생님|교사
doctor|의사
police|경찰
soldier|군인
military|군대풍|밀리터리
knight|기사
prince|왕자
king|왕
samurai|사무라이|무사
ninja|닌자
priest|신부|사제 성직자
detective|탐정
chef|요리사|셰프
bartender|바텐더
idol|아이돌
yakuza|야쿠자|조폭 깡패
delinquent|불량배|양아치 일진
mafia|마피아
vampire|뱀파이어|흡혈귀
demon boy|악마 소년|악마
angel|천사
elf|엘프
cyborg|사이보그|기계
android|안드로이드|로봇
monster boy|몬스터 소년|인외
` },
  {
    id: 'haircolor', name: '머리색', order: 2.0, tags: `
black hair|검은 머리|흑발 머리색
brown hair|갈색 머리|머리색
blonde hair|금발|노란 머리 머리색
white hair|흰 머리|백발 머리색
grey hair|회색 머리|은발 머리색
red hair|빨간 머리|적발 머리색
blue hair|파란 머리|머리색
dark blue hair|남색 머리|머리색
pink hair|분홍 머리|머리색
purple hair|보라 머리|머리색
green hair|초록 머리|머리색
orange hair|주황 머리|머리색
aqua hair|청록 머리|민트 머리색
multicolored hair|여러 색 머리|투톤 머리색
two-tone hair|투톤 머리|머리색
streaked hair|브릿지 머리|부분 염색
gradient hair|그라데이션 머리
colored inner hair|속머리 염색|이너컬러
` },
  {
    id: 'hairstyle', name: '헤어스타일', order: 2.1, tags: `
short hair|짧은 머리|단발 숏컷
very short hair|아주 짧은 머리|스포츠
buzz cut|버즈컷|삭발 스포츠
bald|대머리|민머리
medium hair|중간 길이 머리|어깨
long hair|긴 머리|장발
very long hair|아주 긴 머리|장발
bob cut|보브 단발|단발
undercut|투블럭|언더컷
mullet|멀릿|울프컷 뒷머리
slicked back hair|올백 머리|넘긴 머리
hair slicked back|올백 머리(다른 표기)|넘긴 머리
spiked hair|삐죽 머리|뾰족
messy hair|헝클어진 머리|부스스 까치집
curly hair|곱슬머리|펌
wavy hair|웨이브 머리|물결
straight hair|생머리|스트레이트
ponytail|포니테일|묶은 머리
low ponytail|낮게 묶은 포니테일|묶은 머리 꽁지
short ponytail|짧은 포니테일|꽁지머리 묶은
high ponytail|높게 묶은 포니테일|묶은 머리
side ponytail|옆으로 묶은 머리|사이드 포니테일
half updo|반묶음|하프업
hair bun|올림머리|똥머리 번
twintails|양갈래 머리|트윈테일 묶은
braid|땋은 머리
single braid|한 갈래 땋은 머리
twin braids|양갈래 땋은 머리
bangs|앞머리
blunt bangs|일자 앞머리|뱅
swept bangs|옆으로 넘긴 앞머리
parted bangs|가르마 앞머리|5대5 가르마
hair between eyes|눈 사이로 내려온 앞머리
hair over one eye|한쪽 눈 가린 머리|앞머리
hair over eyes|두 눈 가린 앞머리|앞머리
hair behind ear|귀 뒤로 넘긴 머리
sidelocks|옆머리
ahoge|바보털|더듬이
wet hair|젖은 머리
floating hair|흩날리는 머리|바람
hair ornament|머리 장식|헤어 액세서리
hairclip|머리핀|실핀 헤어핀
hair ribbon|머리 리본
hair tie|머리끈
hairband|머리띠
headband|헤어밴드|머리띠
hair flower|머리 꽃장식
curtained hair|커튼 머리|5대5 가르마 커튼펌 앞머리
hair strand|흘러내린 머리 한 가닥|잔머리
forehead|이마 드러냄|이마 깐 머리 까
pomade|포마드 (효과 약함)|올백 광택 머리
` },
  {
    id: 'eyes', name: '눈·안경', order: 2.2, tags: `
black eyes|검은 눈|흑안 눈색
blue eyes|파란 눈|눈색
red eyes|빨간 눈|적안 눈색
green eyes|초록 눈|눈색
brown eyes|갈색 눈|눈색
yellow eyes|노란 눈|금안 금색 눈색
purple eyes|보라 눈|눈색
grey eyes|회색 눈|눈색
pink eyes|분홍 눈|눈색
orange eyes|주황 눈|눈색
aqua eyes|청록 눈|민트 눈색
heterochromia|오드아이|양쪽 눈 색 다름
jitome|게슴츠레한 눈|반쯤 뜬 짜증 지토메 눈매
sanpaku|삼백안|눈매 흰자
tsurime|올라간 눈매|날카로운 눈 고양이상
tareme|처진 눈매|순한 강아지상
sharp eyes|날카로운 눈|눈매
half-closed eyes|반쯤 감은 눈|나른 졸린
narrowed eyes|가늘게 뜬 눈|째려봄 실눈
closed eyes|눈 감음
one eye closed|윙크|한쪽 눈 감음
wide-eyed|눈 크게 뜸|놀람
slit pupils|세로 동공|뱀눈 고양이눈
glowing eyes|빛나는 눈
empty eyes|공허한 눈|하이라이트 없음 동태눈
constricted pupils|수축된 동공|광기 놀람
bags under eyes|다크서클|눈밑 피곤
eyelashes|속눈썹
thick eyebrows|두꺼운 눈썹|눈썹
eyeliner|아이라인|화장
eyepatch|안대
glasses|안경
black-framed eyewear|검은 뿔테 안경|안경
round eyewear|동그란 안경|안경
semi-rimless eyewear|반무테 안경|안경
rimless eyewear|무테 안경|안경
tinted eyewear|색안경|안경
sunglasses|선글라스|안경
aviator sunglasses|보잉 선글라스|안경
monocle|외알 안경|모노클
eyewear on head|머리에 올린 안경|선글라스
straight eyebrows|일자 눈썹|눈썹 straight eyebrow
` },
  {
    id: 'body', name: '체형·얼굴 특징', order: 2.3, tags: `
muscular male|근육질 남성|근육 몸좋은
muscular|근육질|근육
toned male|잔근육 남성|탄탄 근육
abs|복근|근육
pectorals|가슴 근육|흉근 근육
biceps|이두근|팔 근육
broad shoulders|넓은 어깨|어깨깡패 체형
tall male|키 큰 남성|체형
slender|호리호리|날씬 마른 체형
skinny|마른 체형|날씬 슬림
fat man|뚱뚱한 남성|통통 체형
veins|핏줄|힘줄
veiny arms|핏줄 선 팔|팔뚝 힘줄
veiny hands|핏줄 선 손|손등 힘줄
forearms|팔뚝|전완
large hands|큰 손|손
collarbone|쇄골
adam's apple|목젖|목
facial hair|수염 (전반)|턱수염
stubble|까끌한 수염|면도 자국 수염
beard|턱수염|수염
short beard|짧은 턱수염|수염
mustache|콧수염|수염
goatee|염소수염|수염
sideburns|구레나룻|수염
chest hair|가슴털|털
arm hair|팔털|털
scar|흉터
scar on face|얼굴 흉터|흉터
scar across eye|눈을 가로지르는 흉터|흉터
scar on cheek|뺨 흉터|흉터
mole|점
mole under eye|눈밑 점|점
mole under mouth|입가 점|점
freckles|주근깨
dark skin|어두운 피부|피부 흑인
dark-skinned male|피부 까만 남성|피부 구릿빛
tan|태닝 피부|구릿빛 피부
pale skin|창백한 피부|피부 하얀
tattoo|문신|타투
arm tattoo|팔 문신|타투
neck tattoo|목 문신|타투
facial tattoo|얼굴 문신|타투
facial mark|얼굴 문양|마크
piercing|피어싱
ear piercing|귀 피어싱|피어싱
eyebrow piercing|눈썹 피어싱|피어싱
lip piercing|입술 피어싱|피어싱
animal ears|동물 귀|수인
cat ears|고양이 귀|수인
fox ears|여우 귀|수인
wolf ears|늑대 귀|수인
dog ears|개 귀|수인
pointy ears|뾰족 귀|엘프
horns|뿔|악마
wings|날개|천사
tail|꼬리|수인
bandaid on face|얼굴에 반창고|밴드
bandaid on nose|코에 반창고|밴드
bruise|멍|상처
injury|부상|상처
blood on face|얼굴에 피|상처
v-taper|역삼각형 몸매|V자 체형 어깨 허리
large pectorals|큰 가슴 근육|흉근 근육
bright skin|밝은 피부|피부 하얀
glossy skin|윤기 나는 피부|광택 피부
` },
  {
    id: 'top', name: '상의·겉옷', order: 3.0, tags: `
shirt|셔츠
white shirt|흰 셔츠
black shirt|검은 셔츠
blue shirt|파란 셔츠
collared shirt|카라 셔츠|깃
dress shirt|드레스 셔츠|와이셔츠
open shirt|앞 열린 셔츠|단추 풀린
partially unbuttoned|단추 일부 풀림
open collar|열린 깃|단추 풀린 카라
untucked shirt|빼 입은 셔츠|셔츠 밖으로
shirt tucked in|넣어 입은 셔츠
sleeve rolled up|소매 걷어올림|팔 걷은 sleeves rolled up
long sleeves|긴 소매|긴팔
short sleeves|짧은 소매|반팔
sleeveless|민소매|나시
sleeveless shirt|민소매 셔츠|나시
wide sleeves|넓은 소매|펄럭
sleeves past wrists|손 덮는 긴 소매|소매 길게
puffy sleeves|퍼프 소매|볼륨
detached sleeves|분리된 소매
sleeve garter|소매 가터|암밴드
t-shirt|티셔츠|반팔티
print shirt|프린트 티셔츠|그래픽티
polo shirt|폴로 셔츠|카라티
hawaiian shirt|하와이안 셔츠|알로하
tank top|민소매 티|나시
black tank top|검은 민소매 티|나시
hoodie|후드티
hood up|후드 씀|모자
hood down|후드 내림
sweater|스웨터|니트
turtleneck|터틀넥|목폴라
black turtleneck|검은 터틀넥|목폴라
cardigan|가디건
sweater vest|니트 조끼|스웨터 베스트
vest|조끼
black vest|검은 조끼
waistcoat|웨이스트코트|정장 조끼
jacket|재킷|자켓
open jacket|앞 열린 재킷|자켓
black jacket|검은 재킷|자켓
suit jacket|정장 재킷|자켓 수트
blazer|블레이저|자켓 교복
leather jacket|가죽 재킷|라이더 자켓
denim jacket|청자켓|데님 자켓
bomber jacket|항공 점퍼|봄버 자켓
letterman jacket|야구 점퍼|과잠 자켓
track jacket|트랙 재킷|저지 체육복
hooded jacket|후드 재킷|자켓
military jacket|군용 재킷|자켓
jacket on shoulders|어깨에 걸친 재킷|걸침
jacket over shoulder|어깨에 둘러멘 재킷|걸침
coat|코트
long coat|롱코트|코트
trench coat|트렌치코트|코트
coat on shoulders|어깨에 걸친 코트|걸침
lab coat|실험 가운|의사 가운
suit|정장|수트
black suit|검은 정장|수트
formal|정장 차림|포멀
tuxedo|턱시도
tailcoat|연미복
necktie|넥타이
black necktie|검은 넥타이
red necktie|빨간 넥타이
striped necktie|줄무늬 넥타이
loose necktie|느슨한 넥타이|넥타이 풀린
bowtie|나비넥타이
tie clip|넥타이핀
ascot|애스콧 타이|스카프
suspenders|멜빵|서스펜더
shoulder holster|어깨 총집|권총집 홀스터
school uniform|교복
gakuran|학란 (남자 교복)|교복 가쿠란
serafuku|세일러 교복|세라복
military uniform|군복
epaulettes|견장|군복
aiguillette|장식 끈|군복
police uniform|경찰 제복
cassock|사제복|신부 성직자
kimono|기모노
yukata|유카타
haori|하오리|일본 겉옷
hakama|하카마|일본 하의
japanese clothes|일본 전통 의상|와풍
chinese clothes|중국풍 옷|치파오 창산
hanbok|한복
armor|갑옷
pauldrons|어깨 갑옷|견갑
cape|망토
cloak|로브|망토 클로크
hooded cloak|후드 망토|로브
robe|로브|가운
apron|앞치마
shirtless|웃통 벗음|상의 탈의
topless male|상의 탈의 (남성)|웃통 벗음
open clothes|옷 풀어헤침
bandages|붕대
navy necktie|남색 넥타이|넥타이
grey vest|회색 조끼|조끼 베스트
arm garter|팔 가터|암밴드 소매
` },
  {
    id: 'bottom', name: '하의·신발', order: 3.1, tags: `
pants|바지
black pants|검은 바지
white pants|흰 바지
suit pants|정장 바지|슬랙스
jeans|청바지
torn jeans|찢어진 청바지
cargo pants|카고 바지
track pants|트레이닝 바지|츄리닝 체육복
shorts|반바지
belt|벨트
belt buckle|벨트 버클
skirt|치마|스커트
pleated skirt|주름치마|플리츠
socks|양말
shoes|신발
black footwear|검은 신발|black shoes 구두
dress shoes|구두|정장 신발
loafers|로퍼|구두 신발
sneakers|운동화|스니커즈 신발
boots|부츠|신발
combat boots|군화|워커 부츠
knee boots|롱부츠|부츠
sandals|샌들|신발
geta|게타|나막신
slippers|슬리퍼
barefoot|맨발
grey pants|회색 바지
black socks|검은 양말|양말
black shoes|검은 구두|신발
` },
  {
    id: 'acc', name: '소품·액세서리', order: 3.2, tags: `
gloves|장갑
black gloves|검은 장갑
white gloves|흰 장갑
leather gloves|가죽 장갑
fingerless gloves|손가락 없는 장갑
hat|모자
fedora|페도라|중절모 모자
baseball cap|야구 모자|캡 모자
backwards hat|거꾸로 쓴 모자|모자
beanie|비니|모자
bucket hat|버킷햇|벙거지 모자
peaked cap|정모|군모 모자
military hat|군모|모자
police hat|경찰 모자|모자
beret|베레모|모자
crown|왕관
bandana|반다나|두건
headphones|헤드폰
headphones around neck|목에 건 헤드폰|헤드폰
earphones|이어폰
earrings|귀걸이
stud earrings|피어싱형 귀걸이|귀걸이
single earring|한쪽 귀걸이|귀걸이
hoop earrings|링 귀걸이|귀걸이
necklace|목걸이
chain necklace|체인 목걸이|목걸이
cross necklace|십자가 목걸이|목걸이
dog tags|군번줄|목걸이
choker|초커|목
scarf|목도리|스카프
jewelry|장신구|액세서리
ring|반지
wedding ring|결혼반지|반지
bracelet|팔찌
wristwatch|손목시계|시계
lanyard|목걸이 사원증|목줄
id card|사원증|신분증
mouth mask|마스크 (입 가리개)
surgical mask|수술용 마스크|마스크
mask|가면
bag|가방
backpack|백팩|가방
briefcase|서류가방|가방
umbrella|우산
book|책
cup|컵
disposable cup|테이크아웃 컵|커피
cellphone|휴대폰|핸드폰
smartphone|스마트폰|핸드폰
cigarette|담배
lighter|라이터
alcohol|술
sword|검|칼 무기
katana|카타나|일본도 칼 무기
sheath|칼집|무기
knife|나이프|칼 무기
dagger|단검|칼 무기
gun|총|무기
handgun|권총|총 무기
rifle|소총|총 무기
spear|창|무기
staff (weapon)|지팡이|스태프 마법 무기
shield|방패
guitar|기타|악기
microphone|마이크
flower|꽃
rose|장미|꽃
bouquet|꽃다발|꽃
` },
  {
    id: 'face', name: '표정', order: 4.0, tags: `
smile|미소|웃음
light smile|옅은 미소|웃음
grin|활짝 웃음|이 보이는 웃음
smirk|씩 웃음|비웃음
evil smile|사악한 미소|웃음 악역
crazy smile|광기 어린 미소|웃음 얀데레
laughing|폭소|웃음
:d|활짝 웃는 입|웃음
open mouth|입 벌림
closed mouth|입 다묾
parted lips|살짝 벌린 입|입술
:o|동그랗게 벌린 입|놀람
clenched teeth|이 악물기|분노
lip biting|입술 깨물기
expressionless|무표정
serious|진지한 표정
glaring|노려봄|째려봄
frown|찡그림|인상
furrowed brow|미간 찌푸림|인상 눈썹
raised eyebrow|한쪽 눈썹 올림|눈썹 의아
v-shaped eyebrows|V자 눈썹|화남 눈썹
troubled eyebrows|곤란한 눈썹 (안쪽이 올라감)|처진 눈썹 걱정 困り眉 코마리
worried|걱정|불안 근심
angry|화남|분노
annoyed|짜증
disgust|혐오|역겨움
bored|지루함|심드렁
pout|뾰로통|삐짐
blush|홍조|볼 빨개짐 부끄러움
light blush|옅은 홍조|볼 부끄러움
nose blush|코끝 홍조|부끄러움
embarrassed|부끄러움|당황
flustered|허둥댐|당황
surprised|놀람
sad|슬픔
crying|울음
tears|눈물
tearing up|눈물 글썽|울먹
scared|겁먹음|무서움
sleepy|졸림
tired|피곤
confused|어리둥절|혼란
nervous|긴장
smug|의기양양|잘난척 우쭐
shaded face|얼굴에 드리운 그림자|어두운 표정
sweat|땀
sweatdrop|땀방울 (만화 표현)|당황
tongue out|혀 내밀기|메롱
fang|송곳니|덧니
teeth|이 보임
sigh|한숨
dominant|지배적인 분위기|오만 강압 위압감
` },
  {
    id: 'gaze', name: '시선', order: 4.1, tags: `
looking at viewer|정면 응시|카메라 보기 시선
eye contact|눈 맞춤|시선
looking away|시선 피함
looking back|뒤돌아봄|시선
looking down|내려다봄|시선
looking up|올려다봄|시선
looking to the side|옆을 봄|시선
looking at another|다른 사람을 봄|시선
looking over eyewear|안경 너머로 봄|시선 안경
looking at phone|폰을 봄|시선
condescending gaze|깔보는 시선|내려다봄 오만
` },
  {
    id: 'pose', name: '포즈·동작', order: 4.2, tags: `
standing|서 있음
sitting|앉음
sitting on chair|의자에 앉음|앉음
kneeling|무릎 꿇음
on one knee|한쪽 무릎 꿇음|프러포즈
squatting|쪼그려 앉음
lying|누움
on back|등 대고 누움|누움
on stomach|엎드림|누움
walking|걷기
running|달리기
jumping|점프
leaning forward|앞으로 숙임
leaning back|뒤로 기댐
against wall|벽에 기댐|벽
crossed arms|팔짱|arms crossed
hand in pocket|한 손 주머니에|주머니
hands in pockets|양손 주머니에|주머니
hand on hip|한 손 허리에
hands on hips|양손 허리에
arms behind back|뒷짐|팔
arms behind head|깍지 끼고 뒤통수|팔
hand up|손 올림
arms up|양팔 올림|만세
hand on own face|얼굴에 손|손
hand on own chin|턱 괴기|손
hand on own chest|가슴에 손|손
hand in own hair|머리카락에 손|머리 쓸어넘기기 손
covering mouth|입 가리기|손
fist|주먹|손
clenched hand|주먹 쥠|손
waving|손 흔들기|인사
v|브이 포즈|피스
thumbs up|엄지척
pointing|가리키기|손가락
pointing at viewer|화면을 가리킴|손가락
index finger raised|검지 세우기|손가락
shushing|쉿 하기|손가락
salute|경례
bowing|인사 (고개 숙임)|절
head tilt|고개 갸웃
outstretched arm|팔 뻗기
outstretched hand|손 내밂|손
reaching towards viewer|화면 쪽으로 손 뻗기
adjusting eyewear|안경 고쳐 쓰기|안경 올리기
removing eyewear|안경 벗기|안경
adjusting necktie|넥타이 고쳐 매기|넥타이 풀기
glove pull|장갑 당겨 끼기|장갑
crossed legs|다리 꼬기
hugging own legs|무릎 끌어안기
stretching|기지개|스트레칭
yawning|하품
smoking|흡연|담배
drinking|마시기
eating|먹기
reading|독서|책 읽기
sleeping|잠|자는
fighting stance|싸움 자세|전투
punching|펀치|주먹
kicking|발차기
unsheathing|칼 뽑기|발도
aiming at viewer|화면에 총 겨눔|조준
holding|무언가 들고 있음|손에 든
holding weapon|무기를 듦|손에 든
holding sword|검을 듦|칼 손에 든
holding gun|총을 듦|손에 든
holding cigarette|담배를 듦|손에 든
holding phone|폰을 듦|핸드폰 손에 든
holding cup|컵을 듦|손에 든
holding book|책을 듦|손에 든
holding umbrella|우산을 듦|손에 든
holding flower|꽃을 듦|손에 든
carrying over shoulder|어깨에 메고 감|들쳐메기
slouching|구부정한 자세|늘어진 기대앉은
sitting on couch|소파에 앉음|앉음
` },
  {
    id: 'duo', name: '2인 상호작용', order: 4.3, tags: `
hug|포옹|안기
hug from behind|백허그|포옹 뒤에서
holding hands|손잡기
interlocked fingers|깍지 손잡기|손잡기
kabedon|벽쿵
headpat|머리 쓰다듬기
hand on another's head|다른 사람 머리에 손
hand on another's shoulder|다른 사람 어깨에 손
hand on another's face|다른 사람 얼굴에 손|볼 감싸기
hand on another's cheek|다른 사람 뺨에 손|볼 감싸기
arm around shoulder|어깨동무
wrist grab|손목 잡기
grabbing another's chin|턱 잡기|턱선
necktie grab|넥타이 잡기
princess carry|공주님 안기
piggyback|업기|어부바
back-to-back|등 맞대기
forehead-to-forehead|이마 맞대기
face-to-face|마주 보기
imminent kiss|키스 직전
kiss|키스
cheek kiss|볼 뽀뽀
` },
  {
    id: 'view', name: '구도', order: 5, tags: `
portrait|얼굴 위주 구도|초상화
upper body|상반신
cowboy shot|허벅지까지|카우보이샷
full body|전신
lower body|하반신
close-up|클로즈업
wide shot|넓은 구도|원경
from above|위에서 본 구도|하이앵글
from below|아래에서 본 구도|로우앵글
from side|옆에서 본 구도|측면
from behind|뒷모습
straight-on|정면 수평 구도
profile|옆얼굴|프로필
dutch angle|기울어진 구도
pov|1인칭 시점
pov hands|1인칭 손|시점
foreshortening|원근 단축|손 앞으로
fisheye|어안 렌즈
perspective|원근감
facing viewer|정면을 향함
head out of frame|머리 잘린 구도
multiple views|여러 각도|설정화
reference sheet|캐릭터 설정화|레퍼런스
depth of field|피사계 심도|배경 흐림 아웃포커스
blurry background|흐린 배경|아웃포커스
blurry foreground|흐린 전경|아웃포커스
letterboxed|레터박스|영화 비율
side view|옆에서 본 구도|측면
cinematic composition|영화 같은 구도
` },
  {
    id: 'bg', name: '배경·장소', order: 6, tags: `
simple background|단순 배경
white background|흰 배경
black background|검은 배경
grey background|회색 배경
gradient background|그라데이션 배경
two-tone background|투톤 배경
abstract background|추상 배경
outdoors|야외
indoors|실내
office|사무실
classroom|교실
hallway|복도
bedroom|침실|방
living room|거실
kitchen|주방|부엌
bathroom|욕실|화장실
library|도서관
cafe|카페
bar (place)|바 (술집)|술집
restaurant|레스토랑|식당
gym|헬스장|체육관
locker room|탈의실|락커룸
car interior|차 안|자동차
train interior|기차 안|지하철
train station|기차역|역
city|도시
city lights|도시 불빛|야경
cityscape|도시 풍경
skyscraper|고층 빌딩
street|거리
alley|골목
rooftop|옥상
shrine|신사|일본
temple|사원|절
church|교회|성당
castle|성
throne room|왕좌의 방|알현실
ruins|폐허
battlefield|전장|전쟁
forest|숲
beach|해변|바닷가
ocean|바다
mountain|산
grass|풀밭|잔디
flower field|꽃밭
sky|하늘
blue sky|파란 하늘
cloud|구름
day|낮
evening|저녁
sunset|노을|석양
sunrise|일출|해돋이
twilight|황혼|어스름
night|밤
night sky|밤하늘
starry sky|별하늘|별
moon|달
full moon|보름달|달
rain|비|날씨
fog|안개|날씨
snow|눈 내림|날씨 겨울
autumn leaves|단풍|가을
cherry blossoms|벚꽃|봄
summer|여름|계절
winter|겨울|계절
mansion|저택|대저택 부잣집
dining room|식당 (집)|다이닝룸
ballroom|무도회장|연회장 홀
study|서재|책방
hotel|호텔
hotel room|호텔 방|스위트룸
lobby|로비
greenhouse|온실
garden|정원
courtyard|안뜰|중정
balcony|발코니|베란다
veranda|테라스|베란다
wine cellar|와인 저장고|지하실
museum|박물관|미술관 갤러리
casino|카지노
architecture|건축물|건물
gothic architecture|고딕 건축|성당
victorian|빅토리아풍|서양 고풍
scenery|풍경|배경
detailed background|디테일한 배경|배경 묘사
luxurious|호화로운|고급 럭셔리
cozy|아늑한|포근
messy room|어질러진 방|지저분
` },
  {
    id: 'nature', name: '자연', order: 6.03, tags: `
tree|나무
pine tree|소나무|침엽수 나무
palm tree|야자수|나무 여름
bamboo|대나무
bamboo forest|대나무 숲|죽림
tree shade|나무 그늘|그늘
branch|나뭇가지
leaf|나뭇잎|잎
falling leaves|떨어지는 나뭇잎|낙엽
ginkgo leaf|은행잎|가을
maple leaf|단풍잎|가을
foliage|우거진 잎|초록 녹음
tall grass|키 큰 풀|풀숲 수풀
field|들판|벌판
wheat field|밀밭|들판
meadow|초원|풀밭
bush|덤불|수풀
vines|덩굴|넝쿨
ivy|담쟁이|덩굴
moss|이끼
mushroom|버섯
sunflower|해바라기|꽃
hydrangea|수국|꽃
wisteria|등나무 꽃|꽃
lily (flower)|백합|꽃
lavender (flower)|라벤더|꽃 보라
spider lily|꽃무릇|석산 꽃 빨강
falling petals|흩날리는 꽃잎|꽃잎
rock|바위|돌
cliff|절벽
hill|언덕
valley|계곡|골짜기
cave|동굴
river|강
stream|개울|시냇물
lake|호수
pond|연못
waterfall|폭포
water|물
waves|파도
shore|해안|물가
sand|모래
horizon|수평선|지평선
island|섬
underwater|물속|수중 바닷속
reflection|반사|물에 비침
ripples|물결|파문
splashing|물보라|튀는 물
bubble|물방울 거품|기포
ice|얼음
snowing|눈 내림|함박눈
snowflakes|눈송이
desert|사막
spring (season)|봄|계절
autumn|가을|계절
cloudy sky|흐린 하늘|구름
overcast|잔뜩 흐림|먹구름
cumulonimbus cloud|뭉게구름 (적란운)|여름 구름
gradient sky|그라데이션 하늘
orange sky|주황 하늘|노을
purple sky|보라 하늘|노을
rainbow|무지개
lightning|번개
storm|폭풍|태풍
aurora|오로라
milky way|은하수|별
shooting star|별똥별|유성
crescent moon|초승달|달
fireflies|반딧불이
butterfly|나비
dragonfly|잠자리
bird|새
crow|까마귀|새
seagull|갈매기|새 바다
cat|고양이
dog|개|강아지
fish|물고기
` },
  {
    id: 'props', name: '인테리어·소품', order: 6.05, tags: `
curtains|커튼
sheer curtains|얇은 커튼|시스루 레이스
curtains blowing in the wind|바람에 날리는 커튼|커튼
window|창문
open window|열린 창문|창문
large window|큰 창문|통창
window blinds|블라인드|창문
stained glass|스테인드글라스|성당 창문
door|문
doorway|문간|출입구
stairs|계단
spiral staircase|나선 계단|계단
railing|난간
pillar|기둥|대리석
arch|아치
wall|벽
brick wall|벽돌 벽
wooden wall|나무 벽|원목
wooden floor|나무 바닥|마루
marble floor|대리석 바닥
tiled floor|타일 바닥
carpet|카펫|양탄자
rug|러그|양탄자
couch|소파|카우치
leather couch|가죽 소파|소파
armchair|안락의자|1인 소파
chair|의자
table|테이블|탁자
coffee table|커피 테이블|낮은 탁자
round table|원형 테이블|탁자
desk|책상
bookshelf|책장|서재
book stack|쌓인 책|책 더미
bed|침대
canopy bed|캐노피 침대|공주 침대
pillow|베개
cushion|쿠션
blanket|담요|이불
fireplace|벽난로
chandelier|샹들리에|조명
lamp|램프|스탠드
desk lamp|책상 스탠드|램프
candle|초|촛불
candlestand|촛대
mirror|거울
painting (object)|걸린 그림|액자 회화
picture frame|액자
vase|꽃병
potted plant|화분|식물
plant|식물
clock|시계 (벽시계)
piano|피아노
grand piano|그랜드 피아노|피아노
chess piece|체스 말|체스
globe|지구본
television|텔레비전|TV
laptop|노트북
computer|컴퓨터
monitor|모니터
counter|카운터|바 테이블
bar stool|바 의자|스툴
bottle|병
wine bottle|와인병|술병
wine glass|와인잔
drinking glass|유리잔|컵
teacup|찻잔
teapot|찻주전자
mug|머그컵
ashtray|재떨이
` },
  {
    id: 'light', name: '조명·효과', order: 6.1, tags: `
sunlight|햇빛
backlighting|역광
dappled sunlight|나뭇잎 사이 햇살
light rays|빛줄기
moonlight|달빛
candlelight|촛불 조명|촛불
rim lighting|윤곽광|림라이트
cinematic lighting|영화 같은 조명
dramatic lighting|극적인 조명
neon lights|네온 조명
dark|어두운 분위기
shadow|그림자
high contrast|강한 대비|콘트라스트
silhouette|실루엣
glowing|빛남
lens flare|렌즈 플레어
chromatic aberration|색수차
film grain|필름 그레인|노이즈
vignetting|비네팅|가장자리 어둡게
bokeh|보케|빛망울
light particles|빛 입자|반짝임
sparkle|반짝임
sparks|불꽃 튐|스파크
fire|불
smoke|연기
cigarette smoke|담배 연기|연기
motion blur|모션 블러|움직임
motion lines|효과선|움직임
wind|바람
petals|꽃잎 날림
blood|피
dark moody lighting|어둡고 무드 있는 조명|분위기
window shadow|창틀 그림자|창문 빛
sunlight through window|창문으로 드는 햇빛|창가 빛
warm lighting|따뜻한 조명|노란 불빛
dim lighting|어둑한 조명|어두운 방
` },
  {
    id: 'color', name: '색감', order: 6.2, tags: `
muted color|채도 낮춤|톤다운 차분 무채색
desaturated|채도 빠진 색감|톤다운 무채색
pale color|연한 색감|물 빠진 흐린
faded colors|바랜 색감|빈티지 톤다운
sepia|세피아|빈티지 갈색
low contrast|낮은 대비|흐릿 차분 톤다운
limited palette|제한된 색감|팔레트 톤다운
spot color|한 색만 포인트|흑백 포인트 컬러
partially colored|부분 채색|흑백 포인트
vivid colors|쨍한 색감|비비드 채도 높음 원색
saturated|채도 높음|비비드 쨍한
colorful|화려한 색감|컬러풀 비비드
pastel colors|파스텔 색감|연한
cool color palette|차가운 톤|청량 블루 쿨톤
warm color palette|따뜻한 톤|웜톤 노을 주황
aqua theme|청록 톤|청량 민트 테마
white theme|흰 톤|청량 밝은 테마
blue theme|파란 톤|청량 테마
red theme|빨간 톤|테마
black theme|검은 톤|어두운 테마
cinematic color grading|영화 색보정|시네마틱 톤
` },
  {
    id: 'negative', name: '네거티브', order: 7, tags: `
lowres|저해상도|네거티브
worst quality|최악 품질|네거티브
low quality|저품질|네거티브
normal quality|보통 품질|네거티브
bad anatomy|잘못된 인체|네거티브
bad hands|망가진 손|네거티브
mutated hands|기형 손|네거티브
extra fingers|손가락 많음|네거티브
fused fingers|붙은 손가락|네거티브
missing fingers|손가락 모자람|네거티브
bad feet|망가진 발|네거티브
extra arms|팔 추가|네거티브
extra legs|다리 추가|네거티브
extra limbs|팔다리 추가|네거티브
long neck|긴 목|네거티브
bad proportions|비율 이상|네거티브
deformed|형태 뭉개짐|네거티브
disfigured|망가진 외형|네거티브
ugly|못생김|네거티브
poorly drawn face|잘못 그린 얼굴|네거티브
duplicate|중복|네거티브
cropped|잘림|네거티브
out of frame|프레임 밖|네거티브
blurry|흐림|네거티브
jpeg artifacts|JPEG 깨짐|네거티브
text|글자|네거티브
signature|서명|네거티브
watermark|워터마크|네거티브
username|사용자명|네거티브
artist name|작가명|네거티브
logo|로고|네거티브
error|오류|네거티브
` },
];

function parseDefaultTags() {
  const out = [];
  const seen = new Set();
  for (const cat of DEFAULT_CATEGORIES) {
    for (const line of cat.tags.split('\n')) {
      if (!line.trim()) continue;
      const [en, ko = '', alias = ''] = line.split('|').map(s => s.trim());
      if (seen.has(en)) continue; // 먼저 나온 카테고리가 우선
      seen.add(en);
      out.push({ en, ko, alias, cat: cat.id });
    }
  }
  return out;
}

// 기본 표정 레시피: 기본 태그 + 자연어 묘사 + 시선·각도 조합
// 자연어를 잘 알아듣는 모델(예: Tsubaki.3)에서 감정이 더 살아난다.
const PRESET_GROUPS = [
  '웃음', '도발·오만', '분노', '슬픔', '당황·부끄러움', '놀람',
  '냉담·무표정', '피곤·나른', '진지·긴장', '광기', '설렘·애정', '배경', '자연', '색감', '기타',
];

const DEFAULT_PRESETS = [
  // 웃음
  { g: '웃음', name: '환하게 웃는 얼굴', desc: '눈까지 웃는 밝은 웃음 + 홍조',
    text: 'smile, open mouth, :d, blush, happy, bright genuine smile reaching his eyes, eyes slightly narrowed from laughing' },
  { g: '웃음', name: '부드러운 미소', desc: '입 다문 잔잔한 미소',
    text: 'light smile, closed mouth, gentle expression, soft eyes, warm gaze, relaxed eyebrows' },
  { g: '웃음', name: '수줍은 미소', desc: '시선 피하며 살짝 웃음',
    text: 'light smile, blush, looking away, embarrassed, shy smile, lowering his gaze, hand partially covering his mouth' },
  { g: '웃음', name: '장난스러운 웃음', desc: '윙크 + 혀 + 갸웃',
    text: 'grin, one eye closed, tongue out, head tilt, playful expression, mischievous smile' },
  { g: '웃음', name: '폭소', desc: '고개 젖히고 크게 웃음',
    text: 'laughing, open mouth, closed eyes, tears, head thrown back in laughter, hand on own stomach' },
  { g: '웃음', name: '씁쓸한 미소', desc: '곤란한 눈썹 + 슬픈 웃음',
    text: 'light smile, troubled eyebrows, sad smile, bittersweet expression, eyes cast down' },
  { g: '웃음', name: '다정하게 내려다봄', desc: '아래에서 올려다본 구도, 부드러운 눈빛',
    text: 'light smile, half-closed eyes, looking at viewer, from below, tender expression, looking down at the viewer affectionately' },

  // 도발·오만
  { g: '도발·오만', name: '깔보는 비웃음', desc: '턱 들고 한쪽 입꼬리만 올림',
    text: 'smirk, half-closed eyes, condescending gaze, from below, one corner of his mouth raised, chin slightly lifted, looking down at the viewer' },
  { g: '도발·오만', name: '여유로운 도발', desc: '게슴츠레한 눈 + 턱 괴기',
    text: 'smirk, jitome, head tilt, hand on own chin, confident expression, amused gaze, teasing look' },
  { g: '도발·오만', name: '지배적인 시선', desc: '무표정으로 위에서 내려다봄',
    text: 'expressionless, narrowed eyes, looking at viewer, from below, dominant, cold stare looking down at the viewer, chin up' },
  { g: '도발·오만', name: '악역 미소', desc: '얼굴 반쯤 그림자 + 빛나는 눈',
    text: 'evil smile, shaded face, glowing eyes, narrowed eyes, sinister grin, half of his face in shadow' },
  { g: '도발·오만', name: '안경 너머 한심한 눈빛', desc: '안경 내리고 위로 쳐다봄',
    text: 'glasses, looking over eyewear, jitome, raised eyebrow, unimpressed expression, peering over his glasses' },

  // 분노
  { g: '분노', name: '버럭 화냄', desc: '소리치는 얼굴 + 핏줄',
    text: 'angry, v-shaped eyebrows, open mouth, clenched teeth, veins, shouting, furious expression' },
  { g: '분노', name: '짜증에 머리 헝클', desc: '머리 쥐어뜯으며 내려다봄',
    text: 'angry, v-shaped eyebrows, parted lips, glaring, hand in own hair, messy hair, from below, gripping his own hair in frustration, looking down' },
  { g: '분노', name: '조용한 분노', desc: '무표정인데 눈이 차갑게 가라앉음',
    text: 'angry, expressionless, glaring, shaded face, narrowed eyes, suppressed rage, jaw clenched, cold eyes' },
  { g: '분노', name: '째려봄', desc: '옆눈질로 짜증',
    text: 'annoyed, glaring, jitome, frown, furrowed brow, looking at viewer, side glance' },
  { g: '분노', name: '이 악물고 참음', desc: '떨릴 만큼 참는 얼굴',
    text: 'angry, clenched teeth, furrowed brow, sweat, trembling with anger, holding back his rage' },

  // 슬픔
  { g: '슬픔', name: '눈물 글썽', desc: '참으려는데 차오름',
    text: 'sad, tearing up, troubled eyebrows, parted lips, glistening eyes, holding back tears' },
  { g: '슬픔', name: '소리 없이 눈물', desc: '무표정에 눈물 한 줄기',
    text: 'crying, tears, expressionless, closed mouth, empty eyes, a single tear rolling down his cheek' },
  { g: '슬픔', name: '오열', desc: '얼굴 감싸고 흐느낌',
    text: 'crying, tears, open mouth, troubled eyebrows, sobbing, hand covering his face' },
  { g: '슬픔', name: '공허함', desc: '고개 떨군 텅 빈 눈',
    text: 'empty eyes, expressionless, looking down, hollow gaze, head hanging low, exhausted' },

  // 당황·부끄러움
  { g: '당황·부끄러움', name: '얼굴 새빨개짐', desc: '눈 커지고 허둥댐',
    text: 'blush, embarrassed, wide-eyed, open mouth, sweatdrop, flustered, face turning bright red' },
  { g: '당황·부끄러움', name: '부끄러워 입 가림', desc: '손등으로 입 가리고 시선 회피',
    text: 'blush, covering mouth, looking away, embarrassed, avoiding eye contact, back of his hand over his mouth' },
  { g: '당황·부끄러움', name: '츤데레 삐짐', desc: '팔짱 끼고 고개 홱',
    text: 'blush, pout, looking away, annoyed, crossed arms, turning his face away' },
  { g: '당황·부끄러움', name: '난처한 웃음', desc: '볼 긁으며 어색하게',
    text: 'nervous, sweatdrop, troubled eyebrows, light smile, awkward smile, scratching his cheek' },

  // 놀람
  { g: '놀람', name: '깜짝 놀람', desc: '동공 수축 + 입 벌림',
    text: 'surprised, wide-eyed, open mouth, :o, constricted pupils, startled' },
  { g: '놀람', name: '어리둥절', desc: '갸웃하며 멍한 얼굴',
    text: 'confused, head tilt, parted lips, blank stare, puzzled expression' },

  // 냉담·무표정
  { g: '냉담·무표정', name: '무심한 얼굴', desc: '관심 없는 듯 시선 돌림',
    text: 'expressionless, half-closed eyes, bored, closed mouth, looking away, indifferent gaze' },
  { g: '냉담·무표정', name: '차가운 시선', desc: '감정 없이 똑바로 봄',
    text: 'expressionless, narrowed eyes, looking at viewer, cold eyes, sharp gaze, emotionless face' },
  { g: '냉담·무표정', name: '한숨', desc: '이마 짚고 질린 얼굴',
    text: 'sigh, closed eyes, tired, annoyed, hand on own forehead, exhaling in exasperation' },

  // 피곤·나른
  { g: '피곤·나른', name: '졸린 얼굴', desc: '하품 + 눈 비빔',
    text: 'sleepy, half-closed eyes, yawning, messy hair, drowsy expression, rubbing his eye' },
  { g: '피곤·나른', name: '지친 얼굴', desc: '다크서클 + 넥타이 풀림',
    text: 'tired, bags under eyes, half-closed eyes, sweat, loose necktie, exhausted after a long day' },
  { g: '피곤·나른', name: '나른한 매력', desc: '반쯤 뜬 눈 + 기대앉음',
    text: 'half-closed eyes, light smile, parted lips, leaning back, relaxed, languid gaze' },

  // 진지·긴장
  { g: '진지·긴장', name: '결연함', desc: '정면을 강하게 응시',
    text: 'serious, v-shaped eyebrows, closed mouth, looking at viewer, determined expression, intense gaze' },
  { g: '진지·긴장', name: '집중', desc: '아래를 보며 몰두',
    text: 'serious, narrowed eyes, looking down, focused expression, concentrating' },
  { g: '진지·긴장', name: '긴장', desc: '식은땀 + 침 삼킴',
    text: 'nervous, sweat, clenched teeth, troubled eyebrows, anxious expression, swallowing hard' },

  // 광기
  { g: '광기', name: '광기 어린 미소', desc: '동공 수축 + 갸웃',
    text: 'crazy smile, constricted pupils, shaded face, wide-eyed, head tilt, unhinged grin' },
  { g: '광기', name: '집착하는 시선', desc: '텅 빈 눈으로 미소',
    text: 'empty eyes, light smile, head tilt, looking at viewer, shaded face, obsessive gaze' },

  // 설렘·애정
  { g: '설렘·애정', name: '설레는 얼굴', desc: '홍조 + 살짝 벌린 입',
    text: 'blush, light smile, wide-eyed, parted lips, looking at another, flustered, heart pounding' },
  { g: '설렘·애정', name: '애틋한 눈빛', desc: '곤란한 눈썹 + 그리운 눈',
    text: 'troubled eyebrows, light smile, blush, looking at another, longing gaze, tender expression' },

  // 색감 (톤다운)
  { g: '색감', name: '차분한 톤다운', desc: '채도 낮춤 기본형',
    text: '(muted color:1.2), desaturated colors, muted tones, low saturation, subdued color palette' },
  { g: '색감', name: '누아르 무채색', desc: '차가운 회색 톤 + 강한 명암',
    text: 'noir, muted color, high contrast, deep shadows, desaturated cinematic color grading, cold grey tones' },
  { g: '색감', name: '빈티지 필름', desc: '바랜 색 + 필름 질감',
    text: 'film grain, muted color, faded colors, vintage film photography look, soft warm tint' },
  { g: '색감', name: '흑백 + 포인트 컬러', desc: '한 색만 남기기 (red를 원하는 색으로)',
    text: 'monochrome, spot color, black and white image with a single red accent' },
  { g: '색감', name: '파스텔 톤', desc: '연하고 부드러운 색',
    text: 'pale color, pastel colors, soft light, airy and gentle color palette' },
  // 색감 (비비드·청량)
  { g: '색감', name: '쨍한 비비드', desc: '채도·대비 높게',
    text: '(vivid colors:1.2), colorful, saturated, high contrast, bold vibrant color palette' },
  { g: '색감', name: '청량한 여름', desc: '파란 하늘 + 햇살 + 청록',
    text: 'summer, blue sky, sunlight, light rays, aqua theme, crisp cool tones, fresh and clear color palette, refreshing atmosphere' },
  { g: '색감', name: '투명한 청량감', desc: '밝고 맑은 블루·화이트',
    text: 'cool color palette, white theme, soft light, translucent clear colors, light blue and white tones, clean airy atmosphere' },
  { g: '색감', name: '네온 시티팝', desc: '밤거리 + 마젠타·시안',
    text: 'night, city lights, neon lights, vivid colors, synthwave-inspired color palette, magenta and cyan glow' },
  { g: '색감', name: '따뜻한 노을', desc: '골든아워 역광',
    text: 'sunset, backlighting, warm color palette, golden hour lighting, orange and pink tones' },
  // 색감 (네거티브 칸용)
  { g: '색감', name: '[네거티브] 채도 낮추기', desc: '네거티브 칸에 넣으면 톤다운',
    text: 'vivid colors, oversaturated, colorful, saturated' },
  { g: '색감', name: '[네거티브] 색 빠짐 방지', desc: '네거티브 칸에 넣으면 비비드 유지',
    text: 'monochrome, greyscale, desaturated, muted color, dull colors' },

  // 배경 (장면 레시피)
  { g: '배경', name: '저택 거실', desc: '샹들리에 + 벽난로 + 가죽 소파',
    text: 'indoors, mansion, living room, luxurious, chandelier, fireplace, leather couch, coffee table, rug, tall windows with heavy velvet curtains, warm dim lighting, detailed background' },
  { g: '배경', name: '저택 복도', desc: '대리석 바닥 + 걸린 그림',
    text: 'indoors, mansion, hallway, marble floor, chandelier, painting (object), long corridor lined with portraits, grand staircase in the distance, detailed background' },
  { g: '배경', name: '무도회장', desc: '금장식 + 대리석 기둥',
    text: 'indoors, ballroom, chandelier, marble floor, pillar, luxurious, golden ornate decorations, grand hall, detailed background' },
  { g: '배경', name: '서재', desc: '책장 + 스탠드 + 안락의자',
    text: 'indoors, study, bookshelf, desk, desk lamp, armchair, book stack, wooden wall, warm lamplight, cozy atmosphere, detailed background' },
  { g: '배경', name: '창가 아침 햇살', desc: '얇은 커튼이 바람에 날림',
    text: 'indoors, window, sheer curtains, curtains blowing in the wind, sunlight, light rays, morning light streaming through the window, soft shadows' },
  { g: '배경', name: '비 오는 밤 창가', desc: '빗방울 유리 너머 도시 불빛',
    text: 'indoors, night, window, rain, dim lighting, raindrops on the window glass, blurred city lights outside, reflection on the glass' },
  { g: '배경', name: '호텔 스위트 야경', desc: '통창 너머 밤 도시',
    text: 'indoors, hotel room, night, large window, city lights, bed, floor-to-ceiling windows overlooking the night city, modern luxury interior' },
  { g: '배경', name: '침실 (아늑)', desc: '구겨진 시트 + 스탠드',
    text: 'indoors, bedroom, bed, pillow, blanket, lamp, cozy, warm lighting, rumpled sheets, soft morning light' },
  { g: '배경', name: '바 카운터', desc: '호박색 조명 + 술병',
    text: 'indoors, bar (place), counter, bar stool, wine bottle, wine glass, dim lighting, warm amber lights, shelves of liquor bottles, moody atmosphere' },
  { g: '배경', name: '야근 사무실', desc: '스탠드 하나만 켜진 밤',
    text: 'indoors, office, desk, computer, night, window, city lights, desk lamp, empty office late at night, only the desk lamp lit' },
  { g: '배경', name: '카페 창가', desc: '햇살 + 화분 + 커피',
    text: 'indoors, cafe, table, mug, window, sunlight, potted plant, cozy cafe interior, latte on the table' },
  { g: '배경', name: '방과후 교실', desc: '빈 교실 + 노을빛',
    text: 'indoors, classroom, desk, chair, window, sunset, empty classroom after school, orange light through the windows' },
  { g: '배경', name: '온실', desc: '유리 천장 + 초록 식물',
    text: 'indoors, greenhouse, plant, flower, sunlight, dappled sunlight, glass roof, lush green plants' },
  { g: '배경', name: '고딕 성당', desc: '스테인드글라스 빛 + 촛불',
    text: 'indoors, church, stained glass, pillar, candle, light rays, gothic architecture, colorful light pouring through stained glass windows' },
  { g: '배경', name: '옥상 노을', desc: '난간 + 도시 스카이라인',
    text: 'outdoors, rooftop, railing, sunset, cityscape, wind, orange sky over the city skyline' },
  { g: '배경', name: '비 오는 네온 골목', desc: '젖은 바닥에 네온 반사',
    text: 'outdoors, alley, night, rain, neon lights, wet pavement reflecting neon lights, puddles' },

  // 자연 (장면 레시피)
  { g: '자연', name: '햇살 드는 숲', desc: '나뭇잎 사이로 빛줄기',
    text: 'outdoors, forest, tree, foliage, moss, dappled sunlight, light rays, sunbeams filtering through the leaves, lush green atmosphere' },
  { g: '자연', name: '비 내리는 숲길', desc: '안개 + 젖은 잎',
    text: 'outdoors, forest, rain, fog, tree, wet leaves glistening, narrow forest path, misty atmosphere' },
  { g: '자연', name: '대나무 숲', desc: '높이 솟은 대나무 + 빛줄기',
    text: 'outdoors, bamboo forest, bamboo, light rays, tall bamboo stalks towering overhead, quiet path' },
  { g: '자연', name: '벚꽃길', desc: '흩날리는 꽃잎',
    text: 'outdoors, spring (season), cherry blossoms, tree, falling petals, path lined with blooming cherry trees, soft pink atmosphere' },
  { g: '자연', name: '단풍 공원', desc: '떨어지는 낙엽 + 황금빛',
    text: 'outdoors, autumn, autumn leaves, maple leaf, falling leaves, tree, park bench, warm golden foliage' },
  { g: '자연', name: '여름 바다', desc: '파란 하늘 + 뭉게구름 + 파도',
    text: 'outdoors, summer, beach, ocean, waves, sand, blue sky, cumulonimbus cloud, horizon, sparkling sea' },
  { g: '자연', name: '노을 해변', desc: '바다에 비친 주황 하늘',
    text: 'outdoors, beach, sunset, ocean, horizon, reflection, orange sky, orange sky mirrored on the calm sea' },
  { g: '자연', name: '달빛 밤바다', desc: '어두운 파도 위 은빛 달빛',
    text: 'outdoors, night, ocean, waves, moon, moonlight, reflection, silver moonlight shimmering on dark waves' },
  { g: '자연', name: '안개 낀 호숫가', desc: '산이 비치는 잔잔한 호수',
    text: 'outdoors, lake, reflection, mountain, tree, fog, calm water, mist hovering over the lake' },
  { g: '자연', name: '폭포', desc: '이끼 낀 바위 + 물보라',
    text: 'outdoors, waterfall, rock, moss, river, splashing, water spray, lush greenery' },
  { g: '자연', name: '바람 부는 초원', desc: '끝없는 풀밭 + 흘러가는 구름',
    text: 'outdoors, meadow, tall grass, wind, blue sky, cloud, grass swaying in the wind, vast open field' },
  { g: '자연', name: '해바라기밭', desc: '한여름 햇살',
    text: 'outdoors, summer, sunflower, flower field, blue sky, sunlight, cumulonimbus cloud' },
  { g: '자연', name: '눈 덮인 숲', desc: '조용히 내리는 눈',
    text: 'outdoors, winter, snow, snowing, snowflakes, pine tree, snow-covered forest, quiet snowfall' },
  { g: '자연', name: '별이 쏟아지는 밤', desc: '은하수 + 별똥별 + 언덕',
    text: 'outdoors, night, starry sky, milky way, shooting star, hill, grass, vast sky full of stars' },
  { g: '자연', name: '반딧불 여름밤', desc: '풀숲 위를 떠다니는 빛',
    text: 'outdoors, night, summer, fireflies, tall grass, forest, glowing fireflies drifting in the dark' },
  { g: '자연', name: '바닷속', desc: '수면에서 내려오는 빛',
    text: 'underwater, water, bubble, fish, light rays, sunlight filtering down from the surface' },
  { g: '자연', name: '폭풍 치는 절벽', desc: '먹구름 + 거센 파도',
    text: 'outdoors, cliff, ocean, waves, storm, overcast, wind, dramatic sky, waves crashing against the rocks' },
];

// 프롬프트 파싱·가중치 도구 (content script와 사이드 패널이 함께 사용)
const PW = (() => {
  const OPEN = '([{<', CLOSE = ')]}>';

  // 최상위 쉼표(와 줄바꿈)로 나눈 항목들. start/end는 앞뒤 공백을 뺀 위치
  function splitItems(text) {
    const items = [];
    let depth = 0, segStart = 0;
    const push = end => {
      let s = segStart, e = end;
      while (s < e && /\s/.test(text[s])) s++;
      while (e > s && /\s/.test(text[e - 1])) e--;
      if (e > s) items.push({ start: s, end: e, raw: text.slice(s, e) });
    };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '\\') { i++; continue; }
      if (OPEN.includes(c)) depth++;
      else if (CLOSE.includes(c)) depth = Math.max(0, depth - 1);
      else if ((c === ',' || c === '\n') && depth === 0) { push(i); segStart = i + 1; }
    }
    push(text.length);
    return items;
  }

  // 괄호가 처음부터 끝까지 한 쌍으로 감싸고 있는지
  function wrapped(raw, open, close) {
    if (raw[0] !== open || raw[raw.length - 1] !== close) return false;
    let depth = 0;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c === '\\') { i++; continue; }
      if (c === open) depth++;
      else if (c === close && --depth === 0 && i !== raw.length - 1) return false;
    }
    return true;
  }

  // "(tag:1.2)" → {core:'tag', w:1.2}, "((tag))" → 1.21, "[tag]" → 0.91
  function parseWeight(raw) {
    let core = raw.trim(), w = 1;
    for (;;) {
      if (wrapped(core, '(', ')')) {
        const inner = core.slice(1, -1);
        const m = inner.match(/^([\s\S]*[^\s]):\s*(-?\d*\.?\d+)\s*$/);
        if (m) { core = m[1].trim(); w *= parseFloat(m[2]); break; }
        core = inner.trim(); w *= 1.1;
      } else if (wrapped(core, '[', ']')) {
        core = core.slice(1, -1).trim(); w /= 1.1;
      } else break;
    }
    return { core, w: Math.round(w * 100) / 100 };
  }

  function formatWeight(core, w) {
    w = Math.round(w * 100) / 100;
    if (Math.abs(w - 1) < 0.001) return core;
    return `(${core}:${parseFloat(w.toFixed(2))})`;
  }

  function stepWeight(w, delta) {
    return Math.max(0, Math.round((w + delta) * 10) / 10);
  }

  // 태그 비교용: 소문자, 밑줄→공백, 이스케이프 괄호 해제
  function normalize(core) {
    return core.toLowerCase().replace(/_/g, ' ').replace(/\\([()[\]])/g, '$1').replace(/\s+/g, ' ').trim();
  }

  const isLora = raw => /^<[^>]*>$/.test(raw.trim());

  // 커서(또는 선택 범위)에 걸친 항목의 가중치를 delta만큼 조절
  function adjustAt(text, selStart, selEnd, delta) {
    const items = splitItems(text).filter(it => !isLora(it.raw) &&
      (selStart === selEnd ? selStart >= it.start && selStart <= it.end
                           : it.end > selStart && it.start < selEnd));
    if (!items.length) return null;
    let out = text, shift = 0, newStart = 0, newEnd = 0;
    items.forEach((it, idx) => {
      const { core, w } = parseWeight(it.raw);
      const rep = formatWeight(core, stepWeight(w, delta));
      const s = it.start + shift;
      out = out.slice(0, s) + rep + out.slice(it.end + shift);
      if (idx === 0) newStart = s;
      newEnd = s + rep.length;
      shift += rep.length - it.raw.length;
    });
    // 커서만 있었으면 커서를 항목 끝에, 선택이었으면 조절된 범위를 다시 선택
    return selStart === selEnd
      ? { text: out, start: newEnd, end: newEnd }
      : { text: out, start: newStart, end: newEnd };
  }

  return { splitItems, parseWeight, formatWeight, stepWeight, normalize, isLora, adjustAt };
})();

// 프롬프트 태그를 카테고리 순서대로 정렬 (사이드 패널에서 사용)
// 순서: 화질·화풍 → 인원 → 외형 → 의상·소품 → 표정·포즈 → (분류 못한 태그) → 구도 → 배경·조명
const SORT = (() => {
  const UNKNOWN_ORDER = 4.9;
  const LORA_ORDER = 99;

  // 사전에 없는 태그는 단어로 분류를 추측한다 (위에서부터 먼저 맞는 규칙)
  const RULES = [
    [/^\d+\+?(boys?|girls?|others?)$|^(solo|male focus|female focus)$/, 'people'],
    [/quality|masterpiece|aesthetic|res$|detailed|\(style\)|\(medium\)|artstyle/, 'quality'],
    [/^looking |^facing /, 'gaze'],
    [/^holding |^(hand|hands|arm|arms|leg|legs) |sitting|standing|lying|kneeling|leaning|slouch|walking|running|crossed|pose$/, 'pose'],
    [/background$|indoors|outdoors|room$|city|street|sky|forest|beach|ocean|school|office|mansion|hall$|interior|building|architecture/, 'bg'],
    [/tree|grass|flowers?$|leaves|leaf|river|lake|waves?$|waterfall|rock$|field$|petals|moon$|stars?$|clouds?$|snow|season|mist|fog|water$/, 'nature'],
    [/window|curtains?|table$|couch|sofa|chair|shelf|floor$|wall$|lamp$|chandelier|fireplace|bed$|rug$|carpet|glass$|bottle$|cup$/, 'props'],
    [/theme$|colou?rs?$|palette|saturat|tones?$|grading/, 'color'],
    [/lighting$|light$|lights$|shadow|glow/, 'light'],
    [/^(from |upper body|lower body|full body|close-up|portrait)|shot$|view$|angle$/, 'view'],
    [/hair|bangs|ponytail|braids?$|twintails|ahoge/, 'hairstyle'],
    [/eyes?$|pupils|eyebrows?|eyelashes|eyewear|glasses/, 'eyes'],
    [/muscul|abs$|skin|scar|beard|stubble|tattoo|freckles|mole|veins|pectoral|ears$|horns?$|tail$|wings$/, 'body'],
    [/shirts?$|jackets?$|coats?$|dress$|uniform|sweater|hoodie|vest$|suit$|necktie|tie$|sleeves?|collar|cape$|robe$|kimono/, 'top'],
    [/pants$|shorts$|skirt$|jeans$|socks$|thighhighs|boots$|shoes$|footwear|sneakers|heels$/, 'bottom'],
    [/hat$|cap$|gloves$|earrings?$|necklace|mask$|bag$|ring$|bracelet|scarf$|watch$|weapon|sword/, 'acc'],
    [/smile|blush|grin|frown|crying|tears|mouth|angry|sad$|expression/, 'face'],
  ];

  function classify(norm, index, catOrder) {
    const tag = index.get(norm);
    if (tag) return { cat: tag.cat, order: catOrder.get(tag.cat) ?? UNKNOWN_ORDER, known: true };
    for (const [re, cat] of RULES) {
      if (re.test(norm)) return { cat, order: catOrder.get(cat), known: false, guessed: true };
    }
    return { cat: null, order: UNKNOWN_ORDER, known: false };
  }

  // 복수형/단수형이 사전에 있으면 오타 후보로 제안
  function suggest(norm, index) {
    const cands = [norm.replace(/s$/, ''), norm.replace(/es$/, ''), norm + 's'];
    for (const c of cands) if (c !== norm && index.has(c)) return index.get(c).en;
    return null;
  }

  function sortSegment(items, index, catOrder, report, seen) {
    const rows = [];
    items.forEach((it, i) => {
      if (PW.isLora(it.raw)) return rows.push({ raw: it.raw, order: LORA_ORDER, i });
      const { core } = PW.parseWeight(it.raw);
      const norm = PW.normalize(core);
      if (seen.has(norm)) return report.dupes.push(it.raw);
      seen.add(norm);
      const c = classify(norm, index, catOrder);
      if (!c.known) {
        const s = suggest(norm, index);
        if (s) report.suggestions.push({ from: core, to: s });
        if (c.guessed) report.guessed.push({ tag: core, cat: c.cat });
        else report.unknown.push(core);
      }
      rows.push({ raw: it.raw, order: c.order, i });
    });
    return rows.sort((a, b) => a.order - b.order || a.i - b.i).map(r => r.raw);
  }

  // text → { text: 정렬된 프롬프트, dupes, unknown, guessed, suggestions }
  function sortPrompt(text, tags, categories) {
    const index = new Map(tags.map(t => [PW.normalize(t.en), t]));
    const catOrder = new Map(categories.map(c => [c.id, c.order]));
    const report = { dupes: [], unknown: [], guessed: [], suggestions: [] };
    const seen = new Set();

    // BREAK는 구역 나눔으로 보고 구역마다 따로 정렬
    const segments = [[]];
    for (const it of PW.splitItems(text)) {
      if (it.raw.trim() === 'BREAK') segments.push([]);
      else segments[segments.length - 1].push(it);
    }
    const out = segments
      .map(seg => sortSegment(seg, index, catOrder, report, seen).join(', '))
      .filter(Boolean)
      .join(', BREAK, ');
    return { text: out, ...report };
  }

  return { sortPrompt, classify };
})();

// 같이 쓰면 어색하거나 서로 부딪히는 태그 검사 (사이드 패널에서 사용)
// pair: a쪽과 b쪽이 둘 다 있으면 경고. group: 같은 그룹 안에서 서로 다른 종류가 2개 이상이면 경고
// look: 외형 규칙 (여러 명이 나오는 그림이면 건너뜀)
const CONFLICT = (() => {
  const HAPPY = { name: '웃음', tags: ['smile', 'light smile', 'grin', ':d', 'laughing', 'happy'],
    re: /\b(smil(e|es|ing)|laugh(s|ing)?|grin(s|ning)?)\b/,
    not: /\b(evil|crazy|sad|bitter\w*|forced|wry|sinister|unhinged|awkward)\b/ };
  const ANGRY = { name: '화남', tags: ['angry', 'annoyed', 'frown', 'glaring', 'furrowed brow', 'scowl'],
    re: /\b(angry|furious|rage|annoyed|glar(e|es|ing)|scowl(ing)?)\b/ };
  const SAD = { name: '슬픔', tags: ['sad', 'crying', 'tears', 'tearing up'],
    re: /\b(sad|cry(ing)?|sob(s|bing)?|tears?)\b/, not: /smil/ };
  const BORED = { name: '지루함·무표정', tags: ['bored', 'expressionless'],
    re: /\b(bored|expressionless|emotionless|indifferent)\b/ };
  const SURPRISED = { name: '놀람', tags: ['surprised', 'wide-eyed', ':o'], re: /\b(surprised|startled|shocked)\b/ };
  const MULTI = ['2boys', '3boys', 'multiple boys', '2girls', 'multiple girls', 'couple', 'hetero'];

  const kinds = list => list.map(t => ({ k: t, tags: [t] }));

  const RULES = [
    // 표정
    { id: 'happy-angry', a: HAPPY, b: ANGRY, msg: '웃음과 화남이 같이 있어요',
      tip: '비웃음·도발이면 smirk, 억지웃음이면 forced smile + clenched teeth' },
    { id: 'happy-sad', a: HAPPY, b: SAD, except: ['laughing'], msg: '웃음과 슬픔이 같이 있어요',
      tip: '울면서 웃는 거라면 괜찮아요. 씁쓸한 미소는 sad smile, bittersweet expression' },
    { id: 'happy-bored', a: HAPPY, b: BORED, msg: '웃음과 지루함·무표정이 같이 있어요',
      tip: '심드렁한 미소를 원하면 light smile + half-closed eyes' },
    { id: 'surprised-bored', a: SURPRISED, b: BORED, msg: '놀람과 지루함·무표정이 같이 있어요',
      tip: '둘 중 하나만 남기세요' },
    { id: 'mouth', a: { name: '입 벌림', tags: ['open mouth', ':d', ':o'] },
      b: { name: '입 다묾', tags: ['closed mouth'] }, msg: '입을 벌린 태그와 다문 태그가 같이 있어요',
      tip: '살짝 벌린 입은 parted lips' },
    { id: 'eyes-closed', a: { name: '눈 감음', tags: ['closed eyes'] },
      b: { name: '눈 뜬 표현', tags: ['looking at viewer', 'eye contact', 'wide-eyed', 'glaring', 'looking away', 'looking up', 'looking down'] },
      msg: '눈을 감았는데 눈을 뜬 표현이 있어요', tip: '한쪽만 감으려면 one eye closed' },
    { id: 'gaze', a: { name: '정면 응시', tags: ['looking at viewer', 'eye contact'] },
      b: { name: '시선 피함', tags: ['looking away'] }, msg: '정면 응시와 시선 피함이 같이 있어요',
      tip: '곁눈질로 보는 거면 side glance at viewer' },
    // 구도·자세
    { id: 'framing', group: '구도', kinds: kinds(['portrait', 'close-up', 'upper body', 'cowboy shot', 'full body', 'lower body']),
      msg: '구도 태그가 여러 개예요', tip: '구도는 하나만 (주로 upper body / cowboy shot / full body)' },
    { id: 'angle', a: { name: '위에서', tags: ['from above'] }, b: { name: '아래에서', tags: ['from below'] },
      msg: '위·아래 앵글이 같이 있어요', tip: '올려다보는 구도로 내려다보는 시선은 from below + looking down' },
    { id: 'posture', group: '자세', msg: '자세 태그가 여러 개예요', tip: '자세는 하나만 남기세요',
      kinds: ['standing', 'sitting', 'lying', 'kneeling', 'squatting'].map(k => ({ k, tags: [k], re: new RegExp(`\\b${k}\\b`) })) },
    // 외형 (여러 명이면 건너뜀)
    { id: 'hair-length', look: true, group: '머리 길이', msg: '머리 길이 태그가 여러 개예요', tip: '머리 길이는 하나만',
      kinds: kinds(['very short hair', 'short hair', 'medium hair', 'long hair', 'very long hair']) },
    { id: 'hair-color', look: true, group: '머리색', msg: '머리색이 여러 개예요',
      tip: '투톤이면 two-tone hair, 브릿지면 streaked hair를 추가하세요',
      except: ['multicolored hair', 'two-tone hair', 'streaked hair', 'gradient hair', 'colored inner hair'],
      kinds: kinds(['black hair', 'brown hair', 'blonde hair', 'white hair', 'grey hair', 'red hair', 'blue hair',
        'dark blue hair', 'pink hair', 'purple hair', 'green hair', 'orange hair', 'aqua hair']) },
    { id: 'eye-color', look: true, group: '눈 색', msg: '눈 색이 여러 개예요', tip: '양쪽 눈 색이 다르면 heterochromia',
      except: ['heterochromia'],
      kinds: kinds(['black eyes', 'blue eyes', 'red eyes', 'green eyes', 'brown eyes', 'yellow eyes', 'purple eyes',
        'grey eyes', 'pink eyes', 'orange eyes', 'aqua eyes']) },
    { id: 'sleeves', look: true, group: '소매', msg: '소매 길이 태그가 여러 개예요', tip: '소매 길이는 하나만',
      kinds: kinds(['long sleeves', 'short sleeves', 'sleeveless']) },
    // 인원
    { id: 'solo-multi', a: { name: 'solo', tags: ['solo'] }, b: { name: '여러 명', tags: MULTI },
      msg: '혼자(solo)인데 여러 명 태그가 있어요', tip: '둘 중 하나만 남기세요' },
    { id: 'boys', group: '남자 수', msg: '남자 인원 태그가 여러 개예요', tip: '인원 태그는 하나만',
      kinds: kinds(['1boy', '2boys', '3boys', 'multiple boys']) },
    { id: 'girls', group: '여자 수', msg: '여자 인원 태그가 여러 개예요', tip: '인원 태그는 하나만',
      kinds: kinds(['1girl', '2girls', 'multiple girls']) },
    // 시간·장소·색감
    { id: 'day-night', a: { name: '낮', tags: ['day'] }, b: { name: '밤', tags: ['night', 'night sky', 'starry sky'] },
      msg: '낮과 밤이 같이 있어요', tip: '해 질 녘이면 sunset / evening / twilight' },
    { id: 'in-out', a: { name: '실내', tags: ['indoors'] }, b: { name: '야외', tags: ['outdoors'] },
      msg: '실내와 야외가 같이 있어요', tip: '창밖 풍경이면 indoors + window, scenery outside the window' },
    { id: 'color', a: { name: '톤다운', tags: ['muted color', 'desaturated', 'pale color', 'monochrome', 'greyscale', 'faded colors'] },
      b: { name: '비비드', tags: ['vivid colors', 'saturated', 'colorful'] },
      msg: '톤다운과 비비드가 같이 있어요', tip: '한 색만 쨍하게 살리려면 spot color' },
  ];

  function matches(concept, it) {
    if (concept.tags.includes(it.norm)) return true;
    return !!concept.re && concept.re.test(it.norm) && !(concept.not && concept.not.test(it.norm));
  }

  // 한쪽이 전부 약하게(0.8 미만) 걸려 있으면 약한 경고
  const weak = list => list.every(it => it.w < 0.8);

  // text → [{ key, level: 'hard' | 'soft', items: [번호…], label, msg, tip }]
  function check(text, ignored = {}) {
    const items = PW.splitItems(text).map((it, i) => {
      if (PW.isLora(it.raw)) return null;
      const { core, w } = PW.parseWeight(it.raw);
      return { i, core, w, norm: PW.normalize(core) };
    }).filter(Boolean);
    const norms = new Set(items.map(it => it.norm));
    const multi = MULTI.some(t => norms.has(t));
    const out = [];

    for (const r of RULES) {
      if (r.look && multi) continue;
      if (r.except && r.except.some(t => norms.has(t))) continue;
      let sides;
      if (r.group) {
        // 종류별로 모은 뒤, 서로 다른 종류가 2개 이상이면 충돌
        const byKind = new Map();
        for (const it of items) {
          const kind = r.kinds.find(k => k.tags.includes(it.norm) || (k.re && k.re.test(it.norm)));
          if (kind) byKind.set(kind.k, [...(byKind.get(kind.k) || []), it]);
        }
        if (byKind.size < 2) continue;
        sides = [...byKind.values()];
      } else {
        const a = items.filter(it => matches(r.a, it));
        const b = items.filter(it => matches(r.b, it) && !a.includes(it));
        if (!a.length || !b.length) continue;
        sides = [a, b];
      }
      const involved = sides.flat();
      const key = r.id + ':' + [...new Set(involved.map(it => it.norm))].sort().join('|');
      if (ignored[key]) continue;
      // 약하게 걸린 쪽을 빼고도 두 종류 이상 남으면 진짜 충돌
      const strong = sides.filter(s => !weak(s));
      out.push({
        key,
        level: strong.length >= 2 ? 'hard' : 'soft',
        items: involved.map(it => it.i),
        label: sides.map(s => s.map(it => it.core).join(', ')).join(' ↔ '),
        msg: r.msg,
        tip: r.tip,
      });
    }
    return out;
  }

  return { check };
})();

// PixAI 페이지에 주입되어 사이드 패널과 입력칸 사이를 이어준다.
// - 태그 넣기 (마지막으로 쓰던 입력칸의 커서 위치)
// - 프롬프트 전체 읽기/바꾸기 (정렬, 가중치 칩)
// - 입력칸에서 Ctrl+↑/↓ 로 가중치 조절
(() => {
  let lastEl = null;
  let lastRange = null; // contenteditable용 커서 위치

  const isEditable = el =>
    el && (el.tagName === 'TEXTAREA' || el.isContentEditable);
  const isTextarea = el => el.tagName === 'TEXTAREA';

  document.addEventListener('focusin', e => {
    if (isEditable(e.target)) lastEl = e.target;
  }, true);

  document.addEventListener('selectionchange', () => {
    const a = document.activeElement;
    if (!isEditable(a)) return;
    lastEl = a;
    if (a.isContentEditable) {
      const sel = getSelection();
      if (sel.rangeCount) lastRange = sel.getRangeAt(0).cloneRange();
    }
  });

  // 기억해 둔 입력칸이 없으면 화면에 보이는 가장 큰 입력칸을 쓴다 (커서는 맨 끝)
  function findTarget() {
    if (lastEl && lastEl.isConnected) return { el: lastEl, fresh: false };
    const cands = [...document.querySelectorAll('textarea, [contenteditable="true"]')]
      .filter(el => el.offsetParent !== null)
      .sort((a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight);
    return cands[0] ? { el: cands[0], fresh: true } : null;
  }

  // ---------- contenteditable 텍스트 오프셋 ↔ DOM 위치 ----------
  // PixAI 입력칸 안의 LoRA 칩(아이콘·버튼이 달린 인라인 요소)은 프롬프트 글자가 아니다.
  // 칩 안의 글자는 읽지도 쓰지도 않는다.
  function isChip(node, el) {
    for (let p = node.parentElement; p && p !== el; p = p.parentElement) {
      if (p.getAttribute('contenteditable') === 'false') return true;
      if (p.tagName === 'BUTTON' || p.getAttribute('role') === 'button') return true;
      if (p.querySelector('img, svg') && getComputedStyle(p).display.startsWith('inline')) return true;
    }
    return false;
  }

  const isChipEl = e => e?.nodeType === 1 &&
    (e.getAttribute('contenteditable') === 'false' || !!e.querySelector('img, svg'));

  function textNodes(el) {
    const out = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (isChip(n, el)) continue;
      // 칩 사이에 낀 공백 글자도 프롬프트가 아니다
      if (/^[\s\u00a0]*$/.test(n.data) && (isChipEl(n.previousSibling) || isChipEl(n.nextSibling))) continue;
      out.push(n);
    }
    return out;
  }

  const chipCount = el => el.querySelectorAll('img, svg, [contenteditable="false"]').length;

  function editableText(el) {
    return textNodes(el).map(n => n.data).join('');
  }

  // DOM 위치(node, offset) → 칩을 뺀 글자 기준 위치
  function offsetOf(el, node, offset) {
    const point = document.createRange();
    point.setStart(node, offset);
    let acc = 0;
    for (const n of textNodes(el)) {
      if (n === node) return acc + offset;
      if (point.comparePoint(n, n.length) > 0) break; // 이 글자 노드는 커서보다 뒤
      acc += n.length;
    }
    return acc;
  }

  function pointAt(el, offset) {
    const nodes = textNodes(el);
    for (const n of nodes) {
      if (offset <= n.length) return [n, offset];
      offset -= n.length;
    }
    const last = nodes[nodes.length - 1];
    return last ? [last, last.length] : [el, 0];
  }

  function selectEditable(el, start, end) {
    const r = document.createRange();
    r.setStart(...pointAt(el, start));
    r.setEnd(...pointAt(el, end));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  // ---------- 공통 읽기/쓰기 ----------
  function read(el, fresh) {
    if (isTextarea(el)) {
      const len = el.value.length;
      return {
        text: el.value,
        start: fresh ? len : el.selectionStart ?? len,
        end: fresh ? len : el.selectionEnd ?? len,
      };
    }
    const text = editableText(el);
    let range = null;
    const sel = getSelection();
    if (sel.rangeCount && el.contains(sel.getRangeAt(0).startContainer)) range = sel.getRangeAt(0);
    else if (lastRange && el.contains(lastRange.startContainer)) range = lastRange;
    if (fresh || !range) return { text, start: text.length, end: text.length };
    return {
      text,
      start: offsetOf(el, range.startContainer, range.startOffset),
      end: offsetOf(el, range.endContainer, range.endOffset),
    };
  }

  function setNativeValue(el, value) {
    // React가 값 변경을 인식하도록 프로토타입 setter를 호출
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // [start, end) 구간을 insert로 바꾸고 커서를 selStart~selEnd에 둔다 (실행 취소 가능하게 insertText 사용)
  function replaceRange(el, start, end, insert, selStart, selEnd) {
    el.focus();
    if (isTextarea(el)) {
      const expected = el.value.slice(0, start) + insert + el.value.slice(end);
      el.setSelectionRange(start, end);
      let ok = false;
      try { ok = document.execCommand('insertText', false, insert); } catch (_) {}
      if (!ok || el.value !== expected) setNativeValue(el, expected);
      el.setSelectionRange(selStart, selEnd);
    } else {
      const before = editableText(el);
      const chips = chipCount(el);
      selectEditable(el, start, end);
      // 바꿀 범위 안에 LoRA 칩이 끼어 있으면 건드리지 않는다
      const sel = getSelection();
      if (sel.rangeCount && sel.getRangeAt(0).cloneContents().querySelector('img, svg, [contenteditable="false"], button')) {
        throw new Error('chip-in-range');
      }
      if (insert) document.execCommand('insertText', false, insert);
      else document.execCommand('delete');
      // 에디터 라이브러리가 execCommand를 무시하면 beforeinput 이벤트로 한 번 더 시도
      if (editableText(el) === before && insert) {
        selectEditable(el, start, end);
        el.dispatchEvent(new InputEvent('beforeinput', {
          inputType: 'insertText', data: insert, bubbles: true, cancelable: true,
        }));
      }
      // 혹시라도 칩이 사라졌으면 되돌린다
      if (chipCount(el) < chips) {
        document.execCommand('undo');
        throw new Error('chip-lost');
      }
      selectEditable(el, selStart, selEnd);
    }
  }

  // 전체 글자를 next로 바꾸되, 실제로 달라진 부분만 교체한다
  function replaceAll(el, cur, next, selStart, selEnd) {
    let p = 0;
    while (p < cur.length && p < next.length && cur[p] === next[p]) p++;
    let q = 0;
    while (q < cur.length - p && q < next.length - p &&
           cur[cur.length - 1 - q] === next[next.length - 1 - q]) q++;
    replaceRange(el, p, cur.length - q, next.slice(p, next.length - q), selStart, selEnd);
  }

  // 어느 칸에 넣었는지 보이도록 잠깐 테두리 표시
  function flash(el) {
    el.scrollIntoView({ block: 'nearest' });
    const prev = [el.style.outline, el.style.outlineOffset];
    el.style.outline = '3px solid #7c4dff';
    el.style.outlineOffset = '2px';
    setTimeout(() => { [el.style.outline, el.style.outlineOffset] = prev; }, 900);
  }

  function labelOf(el) {
    const s = el.getAttribute('placeholder') || el.getAttribute('aria-label') ||
      el.dataset.placeholder || '';
    return s.trim().slice(0, 30) || '프롬프트';
  }

  // ---------- 태그 넣기 ----------
  const WS = /[ \t ]+$/; // PixAI 입력칸은 끝 공백을 &nbsp;로 바꿔 두기도 한다

  function withSeparators(before, text, after) {
    const b = before.replace(WS, '');
    let pre = '';
    if (b && !/[,(\n]$/.test(b)) pre = ', ';
    else if (b.endsWith(',')) pre = ' ';
    let post;
    if (/^[\s ]*[,)]/.test(after)) post = '';
    else if (after.replace(/[\s ]/g, '') === '') post = ', ';
    else post = /^[  ]/.test(after) ? ',' : ', ';
    return { trimmed: before.length - b.length, text: pre + text + post };
  }

  function insertTag(t, text) {
    const { el, fresh } = t;
    const cur = read(el, fresh);
    const sep = withSeparators(cur.text.slice(0, cur.start), text, cur.text.slice(cur.end));
    const start = cur.start - sep.trimmed; // 끝 공백은 지우고 구분자로 다시 붙인다
    const pos = start + sep.text.length;
    replaceRange(el, start, cur.end, sep.text, pos, pos);
  }

  // ---------- 입력칸에서 Ctrl+↑/↓ 가중치 ----------
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const el = e.target;
    if (!isEditable(el)) return;
    const cur = read(el, false);
    const res = PW.adjustAt(cur.text, cur.start, cur.end, e.key === 'ArrowUp' ? 0.1 : -0.1);
    if (!res) return;
    e.preventDefault();
    e.stopPropagation();
    try { replaceAll(el, cur.text, res.text, res.start, res.end); } catch (_) { /* LoRA 칩 보호 */ }
  }, true);

  // ---------- 사이드 패널 메시지 ----------
  // 탬퍼몽키 버전은 같은 페이지 안의 패널에서 바로 호출한다
  globalThis.PTD_PAGE = msg => new Promise(resolve => {
    try { handle(msg, resolve); } catch (e) { resolve({ ok: false, reason: String(e.message || e) }); }
  });
  if (!globalThis.chrome?.runtime?.onMessage) return;

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    try {
      handle(msg, reply);
    } catch (e) {
      reply({ ok: false, reason: String(e.message || e) });
    }
  });

  function handle(msg, reply) {
    const t = findTarget();
    if (!t) return reply({ ok: false });
    if (msg.type === 'pixai-insert') {
      const before = read(t.el, true).text;
      insertTag(t, msg.text);
      // 실제로 글자가 바뀌었는지 확인해서, 안 바뀌었으면 실패로 알려준다 (패널이 클립보드로 복사)
      if (read(t.el, true).text === before) return reply({ ok: false, reason: 'unchanged' });
      flash(t.el);
      reply({ ok: true, label: labelOf(t.el) });
    } else if (msg.type === 'pixai-get') {
      reply({ ok: true, text: read(t.el, true).text });
    } else if (msg.type === 'pixai-set') {
      const cur = read(t.el, true).text;
      replaceAll(t.el, cur, msg.text, msg.text.length, msg.text.length);
      reply({ ok: true });
    }
  }
})();


const PANEL_HTML = "<nav class=\"tabs\">\n    <button data-tab=\"tags\" class=\"active\">태그</button>\n    <button data-tab=\"prompt\">프롬프트</button>\n    <button data-tab=\"presets\">프리셋</button>\n    <button data-tab=\"settings\">내 태그·백업</button>\n  </nav>\n\n  <section id=\"tab-tags\" class=\"panel active\">\n    <input id=\"search\" type=\"search\" placeholder=\"검색: 소매, 검은 머리, ㅅㅁ, sleeve…  (가중치: Shift+휠 / 길게 누르기)\" autocomplete=\"off\">\n    <div id=\"cats\" class=\"chips\"></div>\n    <div id=\"count\" class=\"muted\"></div>\n    <ul id=\"list\" class=\"list\"></ul>\n  </section>\n\n  <section id=\"tab-prompt\" class=\"panel\">\n    <div class=\"row between\">\n      <span class=\"muted\">PixAI에서 마지막으로 클릭한 입력칸</span>\n      <button id=\"p-refresh\">새로고침</button>\n    </div>\n    <div id=\"p-conflicts\"></div>\n    <div id=\"p-chips\" class=\"pchips\"></div>\n    <p class=\"muted\">태그 위에서 <b>Shift + 휠</b> 또는 <b>길게 누르기</b>로 가중치 조절 · 색은 정렬 그룹</p>\n    <button id=\"p-sort\" class=\"primary wide\">정렬 미리보기</button>\n    <div id=\"p-preview\" class=\"card\" hidden>\n      <h3>정렬 결과</h3>\n      <div id=\"p-preview-text\" class=\"preview\"></div>\n      <ul id=\"p-notes\" class=\"notes\"></ul>\n      <div class=\"row\">\n        <button id=\"p-cancel\">취소</button>\n        <button id=\"p-apply\" class=\"primary\">적용</button>\n      </div>\n    </div>\n  </section>\n\n  <section id=\"tab-presets\" class=\"panel\">\n    <input id=\"preset-search\" type=\"search\" placeholder=\"검색: 웃음, 분노, 부끄, smirk…\" autocomplete=\"off\">\n    <div id=\"preset-groups\" class=\"chips\"></div>\n    <ul id=\"preset-list\" class=\"list\"></ul>\n    <form id=\"preset-form\" class=\"card\">\n      <h3>내 프리셋 만들기 · 수정</h3>\n      <input id=\"preset-name\" placeholder=\"프리셋 이름 (예: 내 캐릭터 A, 짜증 섞인 웃음)\" required>\n      <select id=\"preset-group\"></select>\n      <input id=\"preset-desc\" placeholder=\"한 줄 설명 (선택)\">\n      <textarea id=\"preset-text\" rows=\"4\" placeholder=\"1boy, black hair, black eyes, white shirt, sleeve rolled up\" required></textarea>\n      <div class=\"row\">\n        <button type=\"button\" id=\"preset-grab\">PixAI 입력칸에서 가져오기</button>\n        <button type=\"submit\" class=\"primary\">저장</button>\n      </div>\n    </form>\n  </section>\n\n  <section id=\"tab-settings\" class=\"panel\">\n    <form id=\"custom-form\" class=\"card\">\n      <h3>내 태그 추가</h3>\n      <input id=\"c-en\" placeholder=\"영어 태그 (예: sleeve rolled up)\" required>\n      <input id=\"c-ko\" placeholder=\"한글 설명 (예: 소매 걷어올림)\">\n      <input id=\"c-alias\" placeholder=\"추가 검색어 (공백 구분, 선택)\">\n      <select id=\"c-cat\"></select>\n      <button type=\"submit\" class=\"primary\">추가</button>\n    </form>\n    <div class=\"card\">\n      <h3>백업</h3>\n      <p class=\"muted\">내 태그·즐겨찾기·프리셋·사용 횟수를 JSON 파일로 저장하거나 불러와요.</p>\n      <div class=\"row\">\n        <button id=\"export\">내보내기</button>\n        <button id=\"import\">가져오기</button>\n        <input id=\"import-file\" type=\"file\" accept=\"application/json\" hidden>\n      </div>\n    </div>\n  </section>\n\n  <div id=\"wbar\" class=\"wbar\" hidden>\n    <span id=\"wbar-label\" class=\"wbar-label\"></span>\n    <button id=\"wbar-minus\" title=\"약하게\">−</button>\n    <b id=\"wbar-val\">1.0</b>\n    <button id=\"wbar-plus\" title=\"강하게\">+</button>\n    <button id=\"wbar-reset\" title=\"1.0으로\">초기화</button>\n    <button id=\"wbar-close\" title=\"닫기\">✕</button>\n  </div>\n  <div id=\"toast\" class=\"toast\"></div>";
const PANEL_CSS = ":host {\n  --bg: #ffffff;\n  --fg: #1d1d20;\n  --muted: #74747c;\n  --line: #e4e4e8;\n  --card: #f6f6f8;\n  --accent: #7c4dff;\n  --accent-fg: #ffffff;\n  --star: #f5a524;\n  color-scheme: light;\n}\n@media (prefers-color-scheme: dark) {\n  :host {\n    --bg: #18181b;\n    --fg: #ececf0;\n    --muted: #9a9aa3;\n    --line: #2e2e33;\n    --card: #222226;\n    --accent: #9d7bff;\n    --star: #f5b54a;\n    color-scheme: dark;\n  }\n}\n* { box-sizing: border-box; }\n.ptd-body {\n  margin: 0;\n  background: var(--bg);\n  color: var(--fg);\n  font: 14px/1.4 system-ui, -apple-system, \"Malgun Gothic\", sans-serif;\n}\nbutton, input, select, textarea { font: inherit; color: inherit; }\ninput, select, textarea {\n  width: 100%;\n  padding: 8px 10px;\n  border: 1px solid var(--line);\n  border-radius: 8px;\n  background: var(--bg);\n}\ninput:focus, textarea:focus, select:focus { outline: 2px solid var(--accent); outline-offset: -1px; }\nbutton {\n  padding: 6px 10px;\n  border: 1px solid var(--line);\n  border-radius: 8px;\n  background: var(--card);\n  cursor: pointer;\n}\nbutton.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }\n.muted { color: var(--muted); font-size: 12px; }\n\n.tabs {\n  position: sticky; top: 0; z-index: 2;\n  display: flex; background: var(--bg); border-bottom: 1px solid var(--line);\n}\n.tabs button {\n  flex: 1; border: 0; border-radius: 0; background: none;\n  padding: 10px 4px; color: var(--muted);\n}\n.tabs button.active { color: var(--fg); box-shadow: inset 0 -2px var(--accent); font-weight: 600; }\n\n.panel { display: none; padding: 10px; }\n.panel.active { display: block; }\n\n.chips { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }\n.chips button { padding: 3px 9px; border-radius: 999px; font-size: 12px; }\n.chips button.active { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }\n\n.list { list-style: none; margin: 6px 0 0; padding: 0; }\n.list li {\n  display: flex; align-items: center; gap: 4px;\n  border-bottom: 1px solid var(--line);\n}\n.list .main {\n  flex: 1; min-width: 0; text-align: left;\n  border: 0; background: none; border-radius: 6px; padding: 7px 6px;\n}\n.list .main:hover { background: var(--card); }\n.list .en { display: block; font-weight: 600; overflow-wrap: anywhere; }\n.list .ko { display: block; color: var(--muted); font-size: 12px; }\n.list .icon { border: 0; background: none; padding: 4px 6px; color: var(--muted); }\n.list .icon.on { color: var(--star); }\n.list .uses { font-size: 11px; color: var(--muted); }\n\n.card {\n  display: flex; flex-direction: column; gap: 8px;\n  background: var(--card); border-radius: 10px; padding: 10px; margin-bottom: 12px;\n}\n.card h3 { margin: 0; font-size: 14px; }\n.card p { margin: 0; }\n.row { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }\n.preset .main .ko { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n\n.toast {\n  position: fixed; left: 10px; right: 10px; bottom: 10px;\n  padding: 8px 12px; border-radius: 8px;\n  background: var(--fg); color: var(--bg);\n  opacity: 0; transform: translateY(8px); transition: .2s; pointer-events: none;\n}\n.toast.show { opacity: 1; transform: none; }\n\n.row.between { justify-content: space-between; align-items: center; }\nbutton.wide { width: 100%; margin-top: 8px; }\n.w-up { color: var(--accent); font-weight: 600; }\n.w-down { color: #3b82c4; font-weight: 600; }\n.w-high { color: #e5484d; font-weight: 700; }\n\n/* 프롬프트 칩: 왼쪽 색 띠 = 정렬 그룹 */\n.pchips { display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0 6px; min-height: 30px; }\n.pchip {\n  display: inline-flex; align-items: center; gap: 4px;\n  padding: 3px 4px 3px 8px; border: 1px solid var(--line); border-left: 4px solid var(--g, var(--line));\n  border-radius: 6px; background: var(--card); font-size: 13px; user-select: none;\n}\n.pchip .x { border: 0; background: none; padding: 0 4px; color: var(--muted); font-size: 12px; }\n.pchip.lora { font-style: italic; }\n.g0 { --g: #a78bfa; } .g1 { --g: #f472b6; } .g2 { --g: #fb923c; } .g3 { --g: #facc15; }\n.g4 { --g: #4ade80; } .g5 { --g: #22d3ee; } .g6 { --g: #60a5fa; } .g7 { --g: #9ca3af; } .gx { --g: var(--line); }\n\n.preview {\n  padding: 8px; border-radius: 8px; background: var(--bg); border: 1px solid var(--line);\n  overflow-wrap: anywhere; user-select: text;\n}\n.notes { margin: 0; padding-left: 18px; font-size: 12px; color: var(--muted); }\n.notes b { color: var(--fg); }\n[hidden] { display: none !important; }\n.ptag {\n  font-size: 11px; font-weight: 400; color: var(--muted);\n  border: 1px solid var(--line); border-radius: 999px; padding: 0 6px; margin-left: 2px;\n}\n.ptext {\n  display: block; font-size: 11px; color: var(--muted); opacity: .8;\n  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n}\n#preset-form { margin-top: 14px; }\n\n/* 충돌 경고 */\n#p-conflicts:empty { display: none; }\n#p-conflicts { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }\n.cf-head { font-weight: 600; color: #e5484d; font-size: 13px; }\n.cf {\n  display: flex; gap: 6px; align-items: flex-start;\n  padding: 7px 8px; border-radius: 8px; font-size: 12px;\n  background: color-mix(in srgb, #e5484d 10%, var(--bg)); border: 1px solid color-mix(in srgb, #e5484d 35%, var(--bg));\n}\n.cf.soft {\n  background: color-mix(in srgb, #f5a524 10%, var(--bg)); border-color: color-mix(in srgb, #f5a524 40%, var(--bg));\n}\n.cf-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }\n.cf-main b { overflow-wrap: anywhere; }\n.cf-tip { color: var(--muted); }\n.cf button { padding: 2px 8px; font-size: 12px; flex: none; }\n.pchip.cf-hard { border-color: #e5484d; box-shadow: 0 0 0 1px #e5484d; }\n.pchip.cf-soft { border-color: #f5a524; box-shadow: 0 0 0 1px #f5a524; }\n\n/* 가중치 바 (길게 누르기) */\n.wbar {\n  position: fixed; left: 10px; right: 10px; bottom: 58px; z-index: 5;\n  display: flex; align-items: center; gap: 6px;\n  padding: 8px 10px; border-radius: 10px;\n  background: var(--card); border: 1px solid var(--line); box-shadow: 0 4px 16px rgba(0, 0, 0, .18);\n}\n.wbar-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }\n.wbar b { min-width: 2.2em; text-align: center; }\n.wbar button { min-width: 36px; }\n.list li, .pchip { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }\n\n/* 터치 기기: 누르기 쉽게 크게 */\n@media (pointer: coarse) {\n  body, .ptd-body { font-size: 15px; }\n  button, input, select, textarea { min-height: 40px; }\n  .list .main { padding: 10px 8px; }\n  .list .icon { padding: 8px 12px; min-height: 44px; }\n  .chips button { padding: 7px 12px; font-size: 13px; min-height: 34px; }\n  .pchips { gap: 8px; }\n  .pchip { padding: 7px 6px 7px 10px; font-size: 14px; }\n  .pchip .x { padding: 4px 8px; min-height: 0; }\n  .tabs button { min-height: 44px; }\n  .wbar button { min-width: 48px; min-height: 44px; font-size: 18px; }\n  .wbar #wbar-reset { font-size: 13px; }\n}\n";
const SHELL_CSS = "\n:host { all: initial; }\n.ptd-wrap {\n  position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 100vw;\n  transform: translateZ(0); /* 안쪽 position:fixed(토스트)가 패널 기준으로 붙도록 */\n  overflow-y: auto; border-left: 1px solid var(--line);\n  box-shadow: -6px 0 24px rgba(0, 0, 0, .18);\n}\n.ptd-wrap.closed { display: none; }\n.ptd-close {\n  position: absolute; top: 6px; right: 6px; z-index: 3;\n  border: 0; background: none; font-size: 16px; color: var(--muted); cursor: pointer;\n}\n.ptd-toggle {\n  position: fixed; right: 0; top: 45%; z-index: 1;\n  writing-mode: vertical-rl; padding: 10px 5px; border-radius: 8px 0 0 8px;\n  border: 0; background: #7c4dff; color: #fff; cursor: pointer;\n  font: 600 12px/1 system-ui, -apple-system, \"Malgun Gothic\", sans-serif;\n  box-shadow: -2px 2px 8px rgba(0, 0, 0, .2);\n}\n.ptd-wrap:not(.closed) ~ .ptd-toggle { right: 380px; }\n.tabs { padding-right: 32px; }\n.tabs button { white-space: nowrap; padding-left: 2px; padding-right: 2px; }\n/* 폰처럼 좁은 화면: 패널을 전체 폭으로 */\n@media (max-width: 600px) {\n  .ptd-wrap { width: 100vw; border-left: 0; }\n  .ptd-wrap:not(.closed) ~ .ptd-toggle { display: none; }\n}\n";

// 저장소: 탬퍼몽키 저장 공간 (크롬 확장과는 따로 저장돼요. 옮길 때는 백업 JSON 사용)
const gmStorage = {
  get: async keys => Object.fromEntries(keys.map(k => [k, GM_getValue(k)])),
  set: async obj => { for (const [k, v] of Object.entries(obj)) GM_setValue(k, v); },
};

function mountPanel() {
  const host = document.createElement('div');
  host.id = 'pixai-tag-drawer';
  host.style.cssText = 'position:fixed;top:0;right:0;z-index:2147483000;';
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = PANEL_CSS + SHELL_CSS;
  const wrap = document.createElement('div');
  wrap.className = 'ptd-wrap ptd-body';
  wrap.innerHTML = PANEL_HTML;
  const close = document.createElement('button');
  close.className = 'ptd-close'; close.textContent = '✕'; close.title = '접기';
  wrap.prepend(close);
  const toggle = document.createElement('button');
  toggle.className = 'ptd-toggle'; toggle.textContent = '🏷 태그 서랍';
  shadow.append(style, wrap, toggle);

  const setOpen = open => {
    wrap.classList.toggle('closed', !open);
    GM_setValue('ptdOpen', open);
  };
  setOpen(GM_getValue('ptdOpen', true));
  toggle.onclick = () => setOpen(wrap.classList.contains('closed'));
  close.onclick = () => setOpen(false);

  globalThis.PTD_HOST = {
    root: shadow,
    storage: gmStorage,
    send: msg => globalThis.PTD_PAGE(msg),
    copy: async text => GM_setClipboard(text, 'text'),
    autofocus: false,
  };
  runPanel();
}

function runPanel() {
const DEFAULT_TAGS = parseDefaultTags();
const MAX_ROWS = 200;

const state = {
  custom: [],   // [{en, ko, alias, cat}]
  favs: {},     // {en: true}
  uses: {},     // {en: count}
  presets: [],  // [{id, name, text, g(그룹), desc}]
  ignored: {},  // 무시한 충돌 경고 {key: true}
  cat: 'all',
  query: '',
  rowW: {},     // 태그 목록에서 Shift+휠·길게 누르기로 정해 둔 가중치 {en: w} (넣으면 초기화)
  prompt: '',   // PixAI 입력칸에서 읽어 온 프롬프트
  sorted: null, // 정렬 미리보기 결과
};

// 실행 환경: 크롬 사이드 패널이 기본. 탬퍼몽키 버전은 PTD_HOST로 저장소·페이지 통신·패널 루트를 넘겨준다
const HOST = globalThis.PTD_HOST || {
  root: document,
  storage: {
    get: keys => chrome.storage.local.get(keys),
    set: obj => chrome.storage.local.set(obj),
  },
  async send(msg) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return chrome.tabs.sendMessage(tab.id, msg);
  },
  copy: text => navigator.clipboard.writeText(text),
  autofocus: true,
};
const ROOT = HOST.root;
const $ = id => ROOT.getElementById(id);

// ---------- 저장소 ----------
async function load() {
  const d = await HOST.storage.get(['custom', 'favs', 'uses', 'presets', 'ignored']);
  state.custom = d.custom || [];
  state.favs = d.favs || {};
  state.uses = d.uses || {};
  state.presets = d.presets || [];
  state.ignored = d.ignored || {};
}
const save = (...keys) =>
  HOST.storage.set(Object.fromEntries(keys.map(k => [k, state[k]])));

function allTags() {
  const map = new Map();
  for (const t of DEFAULT_TAGS) map.set(t.en.toLowerCase(), t);
  for (const t of state.custom) map.set(t.en.toLowerCase(), { ...t, custom: true });
  return [...map.values()];
}

// ---------- 검색 ----------
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function chosung(str) {
  let out = '';
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    out += c >= 0xac00 && c <= 0xd7a3 ? CHO[Math.floor((c - 0xac00) / 588)] : ch;
  }
  return out;
}

function tokenScore(t, q) {
  const en = t.en.toLowerCase(), ko = t.ko.toLowerCase(), alias = (t.alias || '').toLowerCase();
  if (en === q || ko === q) return 100;
  if (en.startsWith(q) || ko.startsWith(q)) return 60;
  if (en.includes(q) || ko.includes(q)) return 40;
  if (alias.includes(q)) return 30;
  if (/^[ㄱ-ㅎ]+$/.test(q) && chosung(ko + ' ' + alias).includes(q)) return 20;
  return -1;
}

function search(tags, query) {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const scored = [];
  for (const t of tags) {
    let s = 0;
    if (tokens.length) {
      // 전체 문구가 그대로 맞으면 우선, 아니면 모든 단어가 맞아야 함
      const whole = tokenScore(t, tokens.join(' '));
      if (whole >= 0) s = whole + 10;
      else {
        for (const tok of tokens) {
          const ts = tokenScore(t, tok);
          if (ts < 0) { s = -1; break; }
          s += ts / tokens.length;
        }
      }
      if (s < 0) continue;
    }
    if (state.favs[t.en]) s += 15;
    s += Math.min(state.uses[t.en] || 0, 20);
    scored.push([s, t]);
  }
  // 검색어가 없을 때는 카테고리 원래 순서를 유지 (즐겨찾기만 위로)
  if (!tokens.length) return scored.sort((a, b) => !!state.favs[b[1].en] - !!state.favs[a[1].en]).map(x => x[1]);
  return scored.sort((a, b) => b[0] - a[0]).map(x => x[1]);
}

// ---------- PixAI 탭과 통신 ----------
async function sendToPage(msg) {
  try {
    return await HOST.send(msg);
  } catch (_) {
    return null; // PixAI 탭이 아니거나 새로고침 전
  }
}

// ---------- 넣기 ----------
async function insert(text, usageKeys = []) {
  const res = await sendToPage({ type: 'pixai-insert', text });
  const ok = !!res?.ok;
  for (const k of usageKeys) state.uses[k] = (state.uses[k] || 0) + 1;
  if (usageKeys.length) save('uses');
  if (ok) return toast(`'${res.label}' 칸에 넣었어요: ${text}`);
  await HOST.copy(text);
  toast(res?.reason === 'unchanged'
    ? '입력칸에 글자가 안 들어가서 클립보드에 복사했어요 (Ctrl+V로 붙여넣기)'
    : 'PixAI 입력칸을 못 찾아서 클립보드에 복사했어요');
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// ---------- 태그 탭 ----------
function catList() {
  return [
    { id: 'all', name: '전체' },
    { id: 'fav', name: '★ 즐겨찾기' },
    { id: 'mine', name: '내 태그' },
    ...DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: c.name })),
  ];
}

function renderCats() {
  const box = $('cats');
  box.replaceChildren(...catList().map(c => {
    const b = document.createElement('button');
    b.textContent = c.name;
    b.classList.toggle('active', state.cat === c.id);
    b.onclick = () => { state.cat = c.id; renderCats(); renderList(); };
    return b;
  }));
}

function renderList() {
  let tags = allTags();
  if (state.cat === 'fav') tags = tags.filter(t => state.favs[t.en]);
  else if (state.cat === 'mine') tags = tags.filter(t => t.custom);
  else if (state.cat !== 'all') tags = tags.filter(t => t.cat === state.cat);
  const found = search(tags, state.query);

  $('count').textContent = found.length > MAX_ROWS
    ? `${found.length}개 중 ${MAX_ROWS}개 표시`
    : `${found.length}개`;

  $('list').replaceChildren(...found.slice(0, MAX_ROWS).map(t => {
    const li = document.createElement('li');

    const main = document.createElement('button');
    main.className = 'main';
    main.title = '클릭하면 PixAI 입력칸에 넣어요';
    const w = state.rowW[t.en] ?? 1;
    li.dataset.weightKey = t.en;
    const en = document.createElement('span'); en.className = 'en'; en.textContent = PW.formatWeight(t.en, w);
    if (w !== 1) en.classList.add(weightClass(w));
    const ko = document.createElement('span'); ko.className = 'ko'; ko.textContent = t.ko;
    main.append(en, ko);
    main.onclick = () => {
      if (barTarget?.key === t.en) { barTarget = null; renderWeightBar(); }
      insert(PW.formatWeight(t.en, state.rowW[t.en] ?? 1), [t.en]);
      if (t.en in state.rowW) { delete state.rowW[t.en]; renderList(); }
    };
    li.append(main);

    if (state.uses[t.en]) {
      const u = document.createElement('span');
      u.className = 'uses'; u.textContent = `${state.uses[t.en]}회`;
      li.append(u);
    }

    const star = document.createElement('button');
    star.className = 'icon' + (state.favs[t.en] ? ' on' : '');
    star.textContent = state.favs[t.en] ? '★' : '☆';
    star.title = '즐겨찾기';
    star.onclick = () => {
      if (state.favs[t.en]) delete state.favs[t.en]; else state.favs[t.en] = true;
      save('favs'); renderList();
    };
    li.append(star);

    if (t.custom) {
      const del = document.createElement('button');
      del.className = 'icon'; del.textContent = '✕'; del.title = '내 태그 삭제';
      del.onclick = () => {
        if (!confirm(`'${t.en}' 태그를 삭제할까요?`)) return;
        state.custom = state.custom.filter(c => c.en !== t.en);
        save('custom'); renderList();
      };
      li.append(del);
    }
    return li;
  }));
}

$('search').addEventListener('input', e => { state.query = e.target.value; renderList(); });

// ---------- 가중치 (Shift + 휠, 길게 누르기) ----------
const weightClass = w => (w > 1.5 ? 'w-high' : w > 1 ? 'w-up' : 'w-down');

// 대상: {key} = 태그 목록의 한 줄, {item} = 프롬프트 칩 번호
const targetOf = el => (el.dataset.weightKey ? { key: el.dataset.weightKey } : { item: +el.dataset.item });

function weightOf(t) {
  if (t.key) return state.rowW[t.key] ?? 1;
  const it = PW.splitItems(state.prompt)[t.item];
  return it ? PW.parseWeight(it.raw).w : 1;
}

async function setWeight(t, fn) {
  if (t.key) {
    state.rowW[t.key] = fn(state.rowW[t.key] ?? 1);
    if (state.rowW[t.key] === 1) delete state.rowW[t.key];
    renderList();
  } else {
    await changeItem(t.item, raw => {
      const { core, w } = PW.parseWeight(raw);
      return PW.formatWeight(core, fn(w));
    });
  }
  renderWeightBar();
}

let wheelAcc = 0;
// Shift + 휠: Ctrl + 휠(화면 확대)은 브라우저에 그대로 둔다.
// 크롬은 Shift + 휠을 가로 스크롤(deltaX)로 바꿔 보내서 deltaX도 같이 본다.
window.addEventListener('wheel', e => {
  if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
  const path = e.composedPath();
  if (!path.includes(ROOT)) return;
  const row = path.find(el => el.dataset && ('weightKey' in el.dataset || 'item' in el.dataset));
  if (!row) return;
  e.preventDefault();
  wheelAcc += e.deltaY || e.deltaX;
  if (Math.abs(wheelAcc) < 40) return; // 트랙패드처럼 잘게 오는 휠은 모아서 한 칸
  const delta = wheelAcc < 0 ? 0.1 : -0.1;
  wheelAcc = 0;
  setWeight(targetOf(row), w => PW.stepWeight(w, delta));
}, { passive: false });

// 터치: 길게 누르면 아래에 가중치 바가 뜬다 (마우스로 꾹 눌러도 동작)
let barTarget = null;
let pressTimer = null, pressStart = null, longPressed = false;

function labelOf(t) {
  if (t.key) return t.key;
  const it = PW.splitItems(state.prompt)[t.item];
  return it ? PW.parseWeight(it.raw).core : '';
}

function renderWeightBar() {
  const bar = $('wbar');
  if (!barTarget) { bar.hidden = true; return; }
  const w = weightOf(barTarget);
  $('wbar-label').textContent = labelOf(barTarget);
  $('wbar-val').textContent = w.toFixed(1);
  $('wbar-val').className = w === 1 ? '' : weightClass(w);
  bar.hidden = false;
}

function openWeightBar(el) {
  barTarget = targetOf(el);
  renderWeightBar();
  navigator.vibrate?.(15);
}

ROOT.addEventListener('pointerdown', e => {
  const row = e.target.closest('[data-weight-key], [data-item]');
  if (!row || e.target.closest('.icon, .x')) return;
  pressStart = [e.clientX, e.clientY];
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => { longPressed = true; openWeightBar(row); }, 450);
});
ROOT.addEventListener('pointermove', e => {
  if (pressStart && Math.hypot(e.clientX - pressStart[0], e.clientY - pressStart[1]) > 10) clearTimeout(pressTimer);
});
for (const type of ['pointerup', 'pointercancel']) {
  ROOT.addEventListener(type, () => { clearTimeout(pressTimer); pressStart = null; });
}
// 길게 누른 뒤 손을 떼도 태그가 들어가지 않게
ROOT.addEventListener('click', e => {
  if (!longPressed) return;
  longPressed = false;
  e.preventDefault();
  e.stopPropagation();
}, true);
ROOT.addEventListener('contextmenu', e => {
  if (e.target.closest('[data-weight-key], [data-item]')) e.preventDefault();
});

$('wbar-minus').onclick = () => barTarget && setWeight(barTarget, w => PW.stepWeight(w, -0.1));
$('wbar-plus').onclick = () => barTarget && setWeight(barTarget, w => PW.stepWeight(w, 0.1));
$('wbar-reset').onclick = () => barTarget && setWeight(barTarget, () => 1);
$('wbar-close').onclick = () => { barTarget = null; renderWeightBar(); };

// ---------- 프롬프트 탭 ----------
const catOrder = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c.order]));
const catName = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c.name]));
let tagIndex = null;
let lastLocalEdit = 0;

// 정렬 그룹 번호 (칩 색): 0 화질 1 인원 2 외형 3 의상 4 표정·포즈 5 구도 6 배경·조명 7 네거티브
function groupOf(raw) {
  if (PW.isLora(raw)) return 'x';
  const norm = PW.normalize(PW.parseWeight(raw).core);
  const c = SORT.classify(norm, tagIndex, catOrder);
  return { cat: c.cat, g: c.cat ? Math.floor(c.order) : 'x' };
}

async function loadPrompt(quiet) {
  const res = await sendToPage({ type: 'pixai-get' });
  if (!res?.ok) {
    if (!quiet) toast('PixAI 생성 페이지에서 입력칸을 한 번 클릭해 주세요');
    return;
  }
  if (res.text !== state.prompt) { state.prompt = res.text; renderPrompt(); }
}

async function writePrompt(text) {
  state.prompt = text;
  lastLocalEdit = Date.now();
  renderPrompt();
  const res = await sendToPage({ type: 'pixai-set', text });
  if (!res?.ok) {
    toast(/chip/.test(res?.reason || '')
      ? 'LoRA 칩을 건드릴 수 있어서 멈췄어요. 입력칸은 그대로예요'
      : 'PixAI 입력칸에 쓰지 못했어요');
    loadPrompt(true);
  }
}

// i번째 항목을 fn(raw)로 바꾼다. fn이 null을 돌려주면 항목 삭제
function changeItem(i, fn) {
  const text = state.prompt;
  const items = PW.splitItems(text);
  const it = items[i];
  if (!it) return;
  const rep = fn(it.raw);
  if (rep !== null) return writePrompt(text.slice(0, it.start) + rep + text.slice(it.end));
  // 삭제: 뒤 항목까지의 구분자도 함께 지운다 (마지막이면 앞 구분자)
  const next = items[i + 1], prev = items[i - 1];
  const [s, e] = next ? [it.start, next.start] : prev ? [prev.end, it.end] : [it.start, it.end];
  writePrompt(text.slice(0, s) + text.slice(e));
}

// 같이 쓰면 부딪히는 태그 경고
function renderConflicts(conflicts) {
  const box = $('p-conflicts');
  if (!conflicts.length) return box.replaceChildren();
  const head = document.createElement('div');
  head.className = 'cf-head';
  head.textContent = `⚠ 충돌 가능 ${conflicts.length}건`;
  box.replaceChildren(head, ...conflicts.map(c => {
    const row = document.createElement('div');
    row.className = 'cf ' + c.level;
    const main = document.createElement('div');
    main.className = 'cf-main';
    const label = document.createElement('b'); label.textContent = c.label;
    const msg = document.createElement('span'); msg.textContent = c.msg;
    const tip = document.createElement('span'); tip.className = 'cf-tip'; tip.textContent = '💡 ' + c.tip;
    main.append(label, msg, tip);
    const ig = document.createElement('button');
    ig.textContent = '무시'; ig.title = '이 조합은 의도한 거예요 (다시 경고 안 함)';
    ig.onclick = () => { state.ignored[c.key] = true; save('ignored'); renderPrompt(); };
    row.append(main, ig);
    return row;
  }));
}

function renderPrompt() {
  tagIndex = new Map(allTags().map(t => [PW.normalize(t.en), t]));
  const conflicts = CONFLICT.check(state.prompt, state.ignored);
  const flagged = new Map();
  for (const c of conflicts) for (const i of c.items) {
    if (flagged.get(i) !== 'hard') flagged.set(i, c.level);
  }
  renderConflicts(conflicts);
  const items = PW.splitItems(state.prompt);
  const box = $('p-chips');
  if (!items.length) {
    const p = document.createElement('span');
    p.className = 'muted';
    p.textContent = '프롬프트가 비어 있어요.';
    return box.replaceChildren(p);
  }
  box.replaceChildren(...items.map((it, i) => {
    const chip = document.createElement('span');
    chip.dataset.item = i;
    if (PW.isLora(it.raw)) {
      chip.className = 'pchip lora gx';
      chip.textContent = it.raw;
      return chip;
    }
    const { core, w } = PW.parseWeight(it.raw);
    const { cat, g } = groupOf(it.raw);
    chip.className = `pchip g${g}` + (flagged.has(i) ? ` cf-${flagged.get(i)}` : '');
    chip.title = cat ? catName.get(cat) : '분류 못함';
    const label = document.createElement('span');
    label.textContent = core;
    chip.append(label);
    if (w !== 1) {
      const b = document.createElement('span');
      b.className = weightClass(w);
      b.textContent = w;
      chip.append(b);
    }
    const x = document.createElement('button');
    x.className = 'x'; x.textContent = '✕'; x.title = '삭제';
    x.onclick = () => changeItem(i, () => null);
    chip.append(x);
    return chip;
  }));
}

function hidePreview() {
  state.sorted = null;
  $('p-preview').hidden = true;
}

$('p-refresh').addEventListener('click', () => loadPrompt(false));

$('p-sort').addEventListener('click', async () => {
  await loadPrompt(false);
  if (!state.prompt.trim()) return;
  const r = SORT.sortPrompt(state.prompt, allTags(), DEFAULT_CATEGORIES);
  state.sorted = r.text;
  $('p-preview-text').textContent = r.text;
  const notes = [];
  const note = (label, text) => {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = label;
    li.append(b, ' ' + text);
    notes.push(li);
  };
  if (r.dupes.length) note('중복 제거:', r.dupes.join(', '));
  for (const s of r.suggestions) note('오타?', `${s.from} → ${s.to}`);
  if (r.guessed.length) note('추측 분류:', r.guessed.map(g => `${g.tag}(${catName.get(g.cat)})`).join(', '));
  if (r.unknown.length) note('분류 못함 (인물 묘사 뒤에 둠):', r.unknown.join(', '));
  if (r.text === state.prompt.trim().replace(/,\s*$/, '') && !notes.length) note('', '이미 정렬되어 있어요.');
  $('p-notes').replaceChildren(...notes);
  $('p-preview').hidden = false;
});

$('p-cancel').addEventListener('click', hidePreview);
$('p-apply').addEventListener('click', async () => {
  if (state.sorted === null) return;
  await writePrompt(state.sorted);
  hidePreview();
  toast('정렬했어요 (PixAI 입력칸에서 Ctrl+Z로 되돌릴 수 있어요)');
});

// 프롬프트 탭이 열려 있는 동안 PixAI 입력칸 변화를 따라간다
setInterval(() => {
  if (!$('tab-prompt').classList.contains('active') || document.hidden) return;
  if (Date.now() - lastLocalEdit < 1500) return;
  loadPrompt(true);
}, 1500);

// ---------- 프리셋 탭 ----------
// 기본 표정 레시피(DEFAULT_PRESETS)와 내 프리셋을 함께 보여준다
let presetGroup = 'all';
let presetQuery = '';

function allPresets() {
  const mine = state.presets.map(p => ({ ...p, g: p.g || '기타', mine: true }));
  const defaults = DEFAULT_PRESETS.map((p, i) => ({ ...p, id: 'd' + i }));
  return [...mine, ...defaults];
}

function renderPresetGroups() {
  const groups = [['all', '전체'], ['mine', '내 프리셋'], ...PRESET_GROUPS.map(g => [g, g])];
  $('preset-groups').replaceChildren(...groups.map(([id, name]) => {
    const b = document.createElement('button');
    b.textContent = name;
    b.classList.toggle('active', presetGroup === id);
    b.onclick = () => { presetGroup = id; renderPresetGroups(); renderPresets(); };
    return b;
  }));
}

function renderPresets() {
  const q = presetQuery.toLowerCase().trim();
  const list = allPresets().filter(p =>
    (presetGroup === 'all' || (presetGroup === 'mine' ? p.mine : p.g === presetGroup)) &&
    (!q || [p.name, p.desc, p.text, p.g].join(' ').toLowerCase().includes(q)));

  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'muted'; li.style.padding = '8px 0';
    li.textContent = presetGroup === 'mine'
      ? '아직 내 프리셋이 없어요. 아래에서 저장하거나, 기본 레시피의 ✎로 고쳐 저장해 보세요.'
      : '맞는 프리셋이 없어요.';
    return $('preset-list').replaceChildren(li);
  }

  $('preset-list').replaceChildren(...list.map(p => {
    const li = document.createElement('li');
    li.className = 'preset';
    const main = document.createElement('button');
    main.className = 'main'; main.title = p.text;
    const n = document.createElement('span'); n.className = 'en';
    n.textContent = p.name;
    const tag = document.createElement('span'); tag.className = 'ptag';
    tag.textContent = p.mine ? `내 · ${p.g}` : p.g;
    n.append(' ', tag);
    main.append(n);
    if (p.desc) {
      const d = document.createElement('span'); d.className = 'ko'; d.textContent = p.desc;
      main.append(d);
    }
    const tx = document.createElement('span'); tx.className = 'ptext'; tx.textContent = p.text;
    main.append(tx);
    main.onclick = () => insert(p.text);

    const edit = document.createElement('button');
    edit.className = 'icon'; edit.textContent = '✎';
    edit.title = p.mine ? '폼으로 불러와 수정' : '내 버전으로 고쳐 저장';
    edit.onclick = () => {
      $('preset-name').value = p.mine ? p.name : `${p.name} (내 버전)`;
      $('preset-group').value = p.g;
      $('preset-desc').value = p.desc || '';
      $('preset-text').value = p.text;
      $('preset-form').scrollIntoView({ behavior: 'smooth' });
      $('preset-text').focus();
    };
    li.append(main, edit);

    if (p.mine) {
      const del = document.createElement('button');
      del.className = 'icon'; del.textContent = '✕'; del.title = '삭제';
      del.onclick = () => {
        if (!confirm(`'${p.name}' 프리셋을 삭제할까요?`)) return;
        state.presets = state.presets.filter(x => x.id !== p.id);
        save('presets'); renderPresets();
      };
      li.append(del);
    }
    return li;
  }));
}

$('preset-group').replaceChildren(...PRESET_GROUPS.map(g => {
  const o = document.createElement('option');
  o.value = g; o.textContent = g;
  return o;
}));
$('preset-group').value = '기타';

$('preset-search').addEventListener('input', e => { presetQuery = e.target.value; renderPresets(); });

$('preset-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('preset-name').value.trim();
  const text = $('preset-text').value.trim().replace(/,\s*$/, '');
  if (!name || !text) return;
  const data = { name, text, g: $('preset-group').value, desc: $('preset-desc').value.trim() };
  const existing = state.presets.find(p => p.name === name);
  if (existing) Object.assign(existing, data);
  else state.presets.unshift({ id: Date.now().toString(36), ...data });
  save('presets'); renderPresets();
  e.target.reset();
  $('preset-group').value = '기타';
  toast(existing ? '프리셋을 수정했어요' : '내 프리셋에 저장했어요');
});

$('preset-grab').addEventListener('click', async () => {
  const res = await sendToPage({ type: 'pixai-get' });
  if (res?.ok) { $('preset-text').value = res.text; return; }
  toast('PixAI 생성 페이지에서 입력칸을 한 번 클릭한 뒤 다시 눌러 주세요');
});

// ---------- 내 태그·백업 탭 ----------
$('c-cat').replaceChildren(...DEFAULT_CATEGORIES.map(c => {
  const o = document.createElement('option');
  o.value = c.id; o.textContent = c.name;
  return o;
}));

$('custom-form').addEventListener('submit', e => {
  e.preventDefault();
  const en = $('c-en').value.trim();
  if (!en) return;
  const tag = { en, ko: $('c-ko').value.trim(), alias: $('c-alias').value.trim(), cat: $('c-cat').value };
  state.custom = state.custom.filter(c => c.en.toLowerCase() !== en.toLowerCase());
  state.custom.push(tag);
  save('custom'); renderList();
  e.target.reset();
  toast(`'${en}' 태그를 추가했어요`);
});

$('export').addEventListener('click', () => {
  const data = { version: 1, custom: state.custom, favs: state.favs, uses: state.uses, presets: state.presets, ignored: state.ignored };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = `pixai-tag-drawer-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$('import').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!confirm('지금 데이터를 백업 파일 내용으로 덮어쓸까요?')) return;
    state.custom = d.custom || [];
    state.favs = d.favs || {};
    state.uses = d.uses || {};
    state.presets = d.presets || [];
    state.ignored = d.ignored || {};
    await save('custom', 'favs', 'uses', 'presets', 'ignored');
    renderList(); renderPresets();
    toast('백업을 불러왔어요');
  } catch (_) {
    toast('백업 파일을 읽지 못했어요');
  }
});

// ---------- 탭 전환 ----------
ROOT.querySelectorAll('.tabs button').forEach(b => {
  b.onclick = () => {
    ROOT.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
    ROOT.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + b.dataset.tab));
    barTarget = null; renderWeightBar();
    if (b.dataset.tab === 'prompt') loadPrompt(true);
  };
});

load().then(() => {
  renderCats();
  renderList();
  renderPresetGroups();
  renderPresets();
  if (HOST.autofocus) $('search').focus();
});

}

mountPanel();

})();
