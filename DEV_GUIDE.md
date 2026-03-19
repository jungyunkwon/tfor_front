tfor/front 개발 가이드 (v1.0)

0) 기본 원칙
- src/ 구조는 아래 표준을 고정으로 따른다(불필요한 구조 변경 금지).
- 페이지는 pages/에만 만든다.
- 재사용 UI는 components/에만 만든다.
- API 호출은 services/에서만 한다(페이지/컴포넌트에서 직접 fetch 금지).
- 전역 상태는 stores(Pinia)에서만 관리한다.
- enum/상수는 enums/에만 둔다.
- 공통 유틸은 utils/에만 둔다.
- 전역 스타일은 css/에서만 관리한다.
- 파일 생성/수정은 “명시된 범위” 내에서만 한다(추측 구현 금지).

1) 폴더 구조(고정)
src/
├── assets/              # 정적 파일 (이미지, 폰트 등)
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/          # 공통 컴포넌트 (버튼, 모달, 카드 등)
│   └── layout/          # 레이아웃 컴포넌트 (헤더, 푸터, 네비 등)
├── css/                 # 전역 스타일 (app.sass, variables.sass 등)
├── layouts/             # 페이지 레이아웃
├── pages/               # 페이지 컴포넌트
├── router/              # 라우터 설정
├── enums/               # enum 정의
├── services/            # API 서비스(HTTP/Supabase SDK 래핑)
├── stores/              # Pinia 스토어(세션/유저/다이아/도메인 상태)
├── utils/               # 유틸리티 함수(순수 함수 중심)
└── App.vue              # 루트 앱 컴포넌트

2) 네이밍 규칙

2-1) 파일/폴더
- 폴더: kebab-case (예: user-profile, content-detail)  ※ 단, 현재 명시 구조는 유지
- Vue 컴포넌트 파일: PascalCase.vue
  예) BaseButton.vue, MatchingPage.vue
- Pinia 스토어: <domain>.store.ts 또는 use<Domain>Store.ts 중 1개로 통일
  표준: stores/<domain>.store.ts (예: auth.store.ts, profile.store.ts)
- 서비스(API 래퍼): <domain>.service.ts
  예) profile.service.ts, likes.service.ts
- enum: <Domain>.enum.ts 또는 <domain>.enum.ts 중 1개로 통일
  표준: enums/<domain>.enum.ts (예: like.enum.ts)

2-2) 코드
- 변수/함수: camelCase
- 컴포넌트/타입/인터페이스: PascalCase
- 상수: SCREAMING_SNAKE_CASE
- boolean: is/has/can prefix (isLoggedIn, hasProfile)
- 이벤트 핸들러: onXxx (onClickSendLike)
- API 함수명: 동사+명사 (getMeProfile, updateMeProfile, sendLike)

2-3) 에러/코드
- 화면 표시용 에러 메시지: 사용자 친화 문구
- 내부 에러 코드(프론트): E_<DOMAIN>_<DETAIL>
  예) E_AUTH_REQUIRED, E_PROFILE_INVALID, E_LIKE_ALREADY_SENT

3) 환경변수(.env) 사용 규칙
- Vite 기준: import.meta.env.VITE_*
- 접근은 utils/env.ts 같은 단일 파일에서만 래핑(직접 여기저기서 접근 금지)
- 예시 키(필요 시):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_API_BASE_URL (Edge Functions base)

4) 라우팅/레이아웃 규칙

4-1) pages는 “화면 단위”
- pages/*Page.vue 는 라우터 엔트리다.
- 레이아웃 선택은 layouts/로만 한다.

4-2) 레이아웃 종류(고정)
- DefaultLayout.vue: 하단 네비 포함(메인 영역)
- AuthLayout.vue: 로그인/온보딩 전용
- ChatLayout.vue: 채팅 전용(하단 네비 숨김)
- ProfileEditLayout.vue: 프로필 수정 전용

4-3) 라우터 가드(권장 규칙)
- 로그인 필요 페이지: auth guard로 차단
- 프로필 완료 필요 페이지(매칭/호감/채팅 등): profileComplete guard로 차단
- 관리자 페이지: role guard로 차단

5) 상태관리(Pinia) 규칙
- stores는 “도메인 단위”로 쪼갠다.
- UI 토스트/모달 같은 전역 UI 상태도 store로 관리 가능(예: ui.store.ts).
- store에서만:
  - 세션(user, access token) 상태
  - 다이아(보석) 잔액/변경
  - 현재 매칭 상태/채팅방 id
- 페이지 컴포넌트는 store의 action만 호출하고, 로직은 store/service로 내린다.

6) services(API) 규칙
- services는 “HTTP 호출/응답 변환/에러 매핑”만 담당한다.
- 페이지/컴포넌트에서 직접 fetch/axios 금지.
- 인증 토큰 주입은 service 레벨에서 일괄 처리한다.
- 응답 포맷 표준:
  - 성공: { data: ... }
  - 실패: { error: { code, message, details? } }
- 프론트에서는 error.code 기준으로 분기(문구는 매핑 테이블로 관리).

7) 공통 컴포넌트 사용 규칙
- Base* 컴포넌트는 “스타일/접근성/상태(loading/disabled)” 표준을 제공한다.
- 화면 구현 시 Base 컴포넌트를 우선 사용하고, 화면 전용 UI는 pages 내부에서만 만든다(가능하면 components로 올리지 않음).

8) 파일 목록 및 설명(고정)

8-1) components/common
- BaseButton.vue            : 전역 버튼(variant, size, disabled, loading)
- BaseIconButton.vue        : 아이콘 버튼
- BaseModal.vue             : 공통 모달 컨테이너
- BaseConfirmDialog.vue     : 확인/취소 다이얼로그
- BaseToast.vue             : 전역 토스트
- BaseInput.vue             : 텍스트 입력
- BaseNumberInput.vue       : 숫자 입력
- BaseSelect.vue            : 드롭다운
- BaseRadioGroup.vue        : 라디오 그룹
- BaseTextarea.vue          : 멀티라인 입력
- BaseCard.vue              : 카드 UI
- BaseBadge.vue             : 상태 배지
- BasePhotoViewer.vue       : 사진 뷰어(확대 불가, 블러/마스킹)
- BasePhotoUploader.vue     : 이미지 업로드
- DiamondChip.vue           : 보석 잔액 표시

8-2) components/layout
- AppHeader.vue             : 상단 헤더(뒤로가기/타이틀/액션)
- BottomNavigation.vue      : 하단 네비
- PageContainer.vue         : 페이지 공통 래퍼

8-3) layouts
- DefaultLayout.vue         : 하단 네비 포함 기본 레이아웃
- AuthLayout.vue            : 로그인/온보딩 전용
- ChatLayout.vue            : 채팅 전용(하단 네비 숨김)
- ProfileEditLayout.vue     : 프로필 수정 전용

8-4) pages
- LoginPage.vue             : 로그인(카카오 로그인 + 약관 동의 진입)
- ProfileSetupPage.vue      : 최초 프로필 + 설문 + 사진 업로드 흐름(단계형)
- ProfilePage.vue           : 프로필 미리보기
- ProfileEditPage.vue       : 프로필 수정(저장 disabled/토스트)
- MatchingPage.vue          : 추천 프로필 1명 노출 + 호감 보내기 + 스킵
- LikeHistoryPage.vue       : 보낸/받은 호감 탭(받은 탭 상단 1명 규칙)
- ChatPage.vue              : 채팅 + 연락처 공개(상호동의) + 신고 + 종료
- EvaluationPage.vue        : 평가 제출 완료 전까지 다음 매칭 잠금 + 보석 2개 지급
- PaymentPage.vue           : 보석 구매(10/30/50/80)
- ContentListPage.vue       : 컨텐츠 리스트
- ContentDetailPage.vue     : 컨텐츠 상세
- InquiryPage.vue           : 문의 작성 + 문의 내역/상태
- AdminDashboardPage.vue    : 관리자 메인
- AdminUserManagePage.vue   : 사용자 관리
- AdminReportManagePage.vue : 신고 처리
- AdminContentManagePage.vue: 컨텐츠 관리

9) 페이지 템플릿(표준 패턴)
- 모든 Page는 아래 순서로 구성한다:
  1) route params/query 파싱
  2) store 상태 조회(computed)
  3) onMounted에서 초기 로드(action 호출)
  4) 사용자 액션 핸들러는 onXxx로 정의

(예)
- pages/MatchingPage.vue:
  - onMounted: matchingStore.loadState(); matchingStore.loadRecommendation();
  - onClickSendLike: likesStore.sendLike(targetUserId)
  - onClickSkip: matchingStore.skip(targetUserId)

10) 테스트/검증 규칙(프론트)
- code_guide.md에 정의된 테스트 케이스가 있으면 그것을 “최우선”으로 따른다.
- 네트워크 실패/권한 실패/검증 실패는 토스트로 안내하고 UI 상태를 복구(disabled 해제 등).

11) 금지 사항
- pages에서 직접 fetch/axios 호출 금지
- services에서 UI 토스트/라우팅 처리 금지(서비스는 순수하게 데이터/에러만 반환)
- stores에서 DOM 접근 금지
- 임의 폴더 추가/구조 변경 금지(명시 없으면 생성하지 않음)