// 기본 태그 사전
// 한 줄에 태그 하나: 영어태그|한글 설명|추가 검색어(공백 구분, 생략 가능)
const DEFAULT_CATEGORIES = [
  {
    id: 'people', name: '인원·체형', tags: `
1boy|남자 1명|남자 소년 남성 한명
1girl|여자 1명|여자 소녀 여성 한명
2boys|남자 2명|두명
2girls|여자 2명|두명
multiple boys|남자 여러 명
multiple girls|여자 여러 명
solo|혼자 등장|단독 한명 솔로
solo focus|한 명에 초점
male focus|남성 중심
couple|커플|연인
mature male|성숙한 남성|어른 아저씨
mature female|성숙한 여성|어른
child|어린아이|아이 꼬마
old man|노인 남성|할아버지
old woman|노인 여성|할머니
bishounen|미소년|꽃미남
muscular male|근육질 남성|근육 몸좋은
muscular|근육질|근육
skinny|마른 체형|날씬 슬림
tall|키 큰
petite|아담한 체형|작은
animal ears|동물 귀|수인
cat ears|고양이 귀|수인
fox ears|여우 귀|수인
wolf ears|늑대 귀|수인
pointy ears|뾰족 귀|엘프
elf|엘프
horns|뿔|악마
wings|날개|천사
tail|꼬리|수인
` },
  {
    id: 'eyes', name: '눈', tags: `
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
closed eyes|눈 감음
half-closed eyes|반쯤 감은 눈|나른 졸린
narrowed eyes|가늘게 뜬 눈|째려봄
wide-eyed|눈 크게 뜸|놀람
one eye closed|윙크|한쪽 눈 감음
tsurime|올라간 눈매|날카로운 눈 고양이상
tareme|처진 눈매|순한 강아지상
slit pupils|세로 동공|뱀눈 고양이눈
glowing eyes|빛나는 눈
empty eyes|공허한 눈|하이라이트 없음 동태눈
eyelashes|속눈썹
eyeliner|아이라인|화장
eyepatch|안대
glasses|안경
round eyewear|동그란 안경
semi-rimless eyewear|반무테 안경
sunglasses|선글라스
` },
  {
    id: 'haircolor', name: '머리색', tags: `
black hair|검은 머리|흑발 머리색
brown hair|갈색 머리|머리색
blonde hair|금발|노란 머리 머리색
white hair|흰 머리|백발 머리색
grey hair|회색 머리|은발 머리색
red hair|빨간 머리|적발 머리색
blue hair|파란 머리|머리색
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
    id: 'hairstyle', name: '헤어스타일', tags: `
short hair|짧은 머리|단발 숏컷
very short hair|아주 짧은 머리|스포츠 삭발
medium hair|중간 길이 머리|어깨
long hair|긴 머리|장발
very long hair|아주 긴 머리|장발
bob cut|보브 단발|단발
ponytail|포니테일|묶은 머리
high ponytail|높게 묶은 포니테일|묶은 머리
low ponytail|낮게 묶은 포니테일|묶은 머리
side ponytail|옆으로 묶은 머리|사이드 포니테일
twintails|양갈래 머리|트윈테일 묶은
braid|땋은 머리
twin braids|양갈래 땋은 머리
hair bun|올림머리|똥머리 번
bangs|앞머리
blunt bangs|일자 앞머리|뱅
swept bangs|옆으로 넘긴 앞머리
parted bangs|가르마 앞머리
hair between eyes|눈 사이로 내려온 앞머리
hair over one eye|한쪽 눈 가린 머리
sidelocks|옆머리
ahoge|바보털|더듬이
messy hair|헝클어진 머리|부스스
spiked hair|삐죽 머리|뾰족
slicked back hair|올백 머리|넘긴 머리
undercut|투블럭|언더컷
curly hair|곱슬머리|펌
wavy hair|웨이브 머리|물결
straight hair|생머리|스트레이트
wet hair|젖은 머리
floating hair|흩날리는 머리|바람
hair ornament|머리 장식|헤어 액세서리
hairclip|머리핀|실핀 헤어핀
hair ribbon|머리 리본
hairband|머리띠
hair flower|머리 꽃장식
` },
  {
    id: 'face', name: '표정', tags: `
smile|미소|웃음
light smile|옅은 미소|웃음
grin|활짝 웃음|이 보이는 웃음
smirk|씩 웃음|비웃음
laughing|폭소|웃음
:d|활짝 웃는 입|웃음
open mouth|입 벌림
closed mouth|입 다묾
:o|동그랗게 벌린 입|놀람
expressionless|무표정
serious|진지한 표정
angry|화남|분노
annoyed|짜증
frown|찡그림|인상
pout|뾰로통|삐짐
blush|홍조|볼 빨개짐 부끄러움
embarrassed|부끄러움|당황
surprised|놀람
sad|슬픔
crying|울음
tears|눈물
scared|겁먹음|무서움
sleepy|졸림
tired|피곤
confused|어리둥절|혼란
nervous|긴장
smug|의기양양|잘난척 우쭐
sweat|땀
sweatdrop|땀방울(만화 표현)|당황
tongue out|혀 내밀기|메롱
fang|송곳니|덧니
teeth|이 보임
` },
  {
    id: 'top', name: '상의·전신복', tags: `
shirt|셔츠
white shirt|흰 셔츠
black shirt|검은 셔츠
collared shirt|카라 셔츠|깃
dress shirt|드레스 셔츠|와이셔츠
t-shirt|티셔츠|반팔티
tank top|민소매 티|나시
hoodie|후드티
sweater|스웨터|니트
turtleneck|터틀넥|목폴라
cardigan|가디건
jacket|재킷|자켓
open jacket|앞 열린 재킷|자켓
leather jacket|가죽 재킷|자켓
coat|코트
trench coat|트렌치코트
vest|조끼
suit|정장|수트
formal|정장 차림|포멀
necktie|넥타이
loose necktie|느슨한 넥타이|넥타이 풀린
bowtie|나비넥타이
school uniform|교복
serafuku|세일러 교복|세라복
gakuran|학란(남자 교복)|교복
military uniform|군복
kimono|기모노
chinese clothes|중국풍 옷|치파오
hanbok|한복
apron|앞치마
maid|메이드
armor|갑옷
cape|망토
cloak|로브|망토 클로크
dress|원피스|드레스
sundress|여름 원피스|선드레스
long sleeves|긴 소매|긴팔
short sleeves|짧은 소매|반팔
sleeveless|민소매|나시
sleeve rolled up|소매 걷어올림|팔 걷은 sleeves rolled up
wide sleeves|넓은 소매|펄럭
sleeves past wrists|손 덮는 긴 소매|소매 길게
puffy sleeves|퍼프 소매|볼륨
detached sleeves|분리된 소매
open collar|열린 깃|단추 풀린 카라
partially unbuttoned|단추 일부 풀림
off shoulder|어깨 드러남|오프숄더
midriff|배꼽 노출|크롭
` },
  {
    id: 'bottom', name: '하의·신발', tags: `
pants|바지
black pants|검은 바지
jeans|청바지
shorts|반바지
skirt|치마|스커트
pleated skirt|주름치마|플리츠
miniskirt|미니스커트
long skirt|긴 치마
suspenders|멜빵
belt|벨트
thighhighs|허벅지 스타킹|니삭스
pantyhose|팬티스타킹|스타킹
socks|양말
kneehighs|무릎 양말|니하이
shoes|신발
black footwear|검은 신발|black shoes 구두
sneakers|운동화|스니커즈 신발
boots|부츠|신발
high heels|하이힐|구두 신발
loafers|로퍼|구두 신발
sandals|샌들|신발
barefoot|맨발
` },
  {
    id: 'acc', name: '소품·액세서리', tags: `
gloves|장갑
black gloves|검은 장갑
fingerless gloves|손가락 없는 장갑
hat|모자
baseball cap|야구 모자|캡 모자
beret|베레모|모자
witch hat|마녀 모자
headphones|헤드폰
earrings|귀걸이
necklace|목걸이
choker|초커|목
scarf|목도리|스카프
jewelry|장신구|액세서리
ring|반지
watch|손목시계
bag|가방
backpack|백팩|가방
mouth mask|마스크(입 가리개)
mask|가면
bandages|붕대
sword|검|칼 무기
katana|카타나|일본도 칼 무기
gun|총|무기
umbrella|우산
book|책
cup|컵
phone|휴대폰|핸드폰 스마트폰
cigarette|담배
flower|꽃
` },
  {
    id: 'pose', name: '포즈·동작', tags: `
standing|서 있음
sitting|앉음
kneeling|무릎 꿇음
squatting|쪼그려 앉음
lying|누움
on back|등 대고 누움|누움
on stomach|엎드림|누움
walking|걷기
running|달리기
jumping|점프
leaning forward|앞으로 숙임
leaning back|뒤로 기댐
arms crossed|팔짱
hands in pockets|주머니에 손
hand on hip|한 손 허리에
hands on hips|양손 허리에
hand up|손 올림
arms up|양팔 올림|만세
waving|손 흔들기|인사
v|브이 포즈|피스
thumbs up|엄지척
pointing|가리키기|손가락
hand on own chin|턱 괴기|손
head tilt|고개 갸웃
outstretched arm|팔 뻗기
reaching towards viewer|화면 쪽으로 손 뻗기
crossed legs|다리 꼬기
hugging own legs|무릎 끌어안기
fighting stance|싸움 자세|전투
holding|무언가 들고 있음|손에 든
holding weapon|무기를 듦|손에 든
holding sword|검을 듦|칼 손에 든
holding phone|폰을 듦|핸드폰 손에 든
holding cup|컵을 듦|손에 든
holding book|책을 듦|손에 든
holding umbrella|우산을 듦|손에 든
hug|포옹|안기
holding hands|손잡기
` },
  {
    id: 'view', name: '구도·시선', tags: `
portrait|얼굴 위주 구도|초상화
upper body|상반신
cowboy shot|허벅지까지|카우보이샷
full body|전신
close-up|클로즈업
wide shot|넓은 구도|원경
from above|위에서 본 구도|하이앵글
from below|아래에서 본 구도|로우앵글
from side|옆에서 본 구도|측면
from behind|뒷모습
profile|옆얼굴|프로필
dutch angle|기울어진 구도
pov|1인칭 시점
facing viewer|정면을 향함
looking at viewer|정면 응시|카메라 보기 시선
looking away|시선 피함
looking back|뒤돌아봄|시선
looking down|내려다봄|시선
looking up|올려다봄|시선
looking to the side|옆을 봄|시선
depth of field|피사계 심도|배경 흐림 아웃포커스
blurry background|흐린 배경|아웃포커스
` },
  {
    id: 'bg', name: '배경·장소', tags: `
simple background|단순 배경
white background|흰 배경
black background|검은 배경
gradient background|그라데이션 배경
outdoors|야외
indoors|실내
classroom|교실
bedroom|침실|방
city|도시
street|거리
cityscape|도시 풍경
rooftop|옥상
cafe|카페
library|도서관
train interior|기차 안|지하철
window|창문
forest|숲
beach|해변|바닷가
ocean|바다
mountain|산
grass|풀밭|잔디
flower field|꽃밭
ruins|폐허
castle|성
church|교회|성당
sky|하늘
blue sky|파란 하늘
cloud|구름
night|밤
night sky|밤하늘
starry sky|별하늘|별
sunset|노을|석양
rain|비|날씨
snow|눈 내림|날씨 겨울
cherry blossoms|벚꽃|봄
` },
  {
    id: 'light', name: '조명·분위기', tags: `
sunlight|햇빛
backlighting|역광
dappled sunlight|나뭇잎 사이 햇살
light rays|빛줄기
rim lighting|윤곽광|림라이트
cinematic lighting|영화 같은 조명
dramatic lighting|극적인 조명
neon lights|네온 조명
dark|어두운 분위기
glowing|빛남
lens flare|렌즈 플레어
bokeh|보케|빛망울
sparkle|반짝임
wind|바람
petals|꽃잎 날림
` },
  {
    id: 'quality', name: '화질·화풍', tags: `
masterpiece|걸작|퀄리티
best quality|최고 품질|퀄리티
high quality|고품질|퀄리티
highres|고해상도
absurdres|초고해상도
ultra-detailed|초정밀 묘사|디테일
detailed eyes|섬세한 눈|디테일
official art|공식 일러스트풍
anime coloring|애니 채색
watercolor (medium)|수채화|화풍
sketch|스케치|화풍
monochrome|흑백|화풍
greyscale|그레이스케일|흑백
chibi|치비|SD 꼬마
realistic|실사풍|리얼
` },
  {
    id: 'negative', name: '네거티브', tags: `
lowres|저해상도|네거티브
worst quality|최악 품질|네거티브
low quality|저품질|네거티브
normal quality|보통 품질|네거티브
bad anatomy|잘못된 인체|네거티브
bad hands|망가진 손|네거티브
mutated hands|기형 손|네거티브
extra fingers|손가락 많음|네거티브
missing fingers|손가락 모자람|네거티브
extra limbs|팔다리 추가|네거티브
bad proportions|비율 이상|네거티브
deformed|형태 뭉개짐|네거티브
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
error|오류|네거티브
` },
];

function parseDefaultTags() {
  const out = [];
  for (const cat of DEFAULT_CATEGORIES) {
    for (const line of cat.tags.split('\n')) {
      if (!line.trim()) continue;
      const [en, ko = '', alias = ''] = line.split('|').map(s => s.trim());
      out.push({ en, ko, alias, cat: cat.id });
    }
  }
  return out;
}
