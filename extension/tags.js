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
teenage|10대|청소년
child|어린아이|아이 꼬마
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
stairs|계단
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
couch|소파
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
