# 개발 셋업 가이드 (Next.js + Supabase + Google OAuth)

## 1) 로컬 실행
```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## 2) Supabase 초기화
1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/20260301150000_init.sql` 실행
3. SQL Editor에서 `supabase/migrations/20260315194000_gifticon_storage.sql` 실행
4. SQL Editor에서 `supabase/migrations/20260315195500_create_family_rpc.sql` 실행
5. 이후 날짜순으로 나머지 마이그레이션을 실행
5. `Auth > URL Configuration` 설정
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`, `http://localhost:3001/**`, 배포 URL (`https://<your-domain>/**`)

`next dev` 실행 중 `3000` 포트가 이미 사용 중이면 Next.js가 자동으로 `3001` 같은 다른 포트로 올라갑니다. 이 경우 현재 실행 중인 로컬 포트도 Supabase Redirect URLs에 반드시 추가해야 Google OAuth 콜백이 차단되지 않습니다.

## 3) Google OAuth 연결
1. Google Cloud Console에서 OAuth Client(웹 애플리케이션) 생성
2. Authorized redirect URI 추가:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
3. 생성된 Client ID/Secret을 Supabase `Auth > Providers > Google`에 입력 후 활성화

## 4) 우선순위 규칙 확인
- 홈 섹션 기준:
  - `오늘 만료`: D-0
  - `곧 만료`: D-1 ~ D-3
  - `주의`: D-4 ~ D-7
- 기본 목록 정렬: `expires_at ASC`

## 5) 다음 구현 포인트
- 로그인 후 가족 미가입 사용자 온보딩 (가족 생성/초대 선택 화면)
- 가족 생성/초대 코드 API
- 사용 완료 처리 + 바코드/이미지 상세 보기

## 6) 참고
- 로그인만 완료한 초기 상태에서는 홈/캘린더에 표시할 기프티콘이 없어 빈 화면 안내가 보일 수 있습니다.
- `gifticons` 데이터는 가족 생성/멤버십 연결 후 표시됩니다.
- 이미지 업로드를 쓰려면 `gifticon-images` Storage 버킷과 정책이 필요하며, 위의 스토리지 마이그레이션이 이를 생성합니다.

## 7) 가족 이메일 사전 등록 (Google 계정)
- 목적: 가족의 Google 이메일을 미리 등록해두고, 해당 계정으로 로그인하면 자동으로 가족 멤버에 합류
- 먼저 `supabase/migrations/20260301173000_family_email_allowlist.sql`을 실행하세요.
- 아래 SQL 예시에서 `family_id`, `invited_by`(가족 owner 프로필 id), `email`만 바꿔서 등록:

```sql
insert into public.family_email_allowlist (family_id, email, role, invited_by)
values
  ('<family-uuid>', 'mom@gmail.com', 'member', '<owner-profile-uuid>'),
  ('<family-uuid>', 'dad@gmail.com', 'member', '<owner-profile-uuid>'),
  ('<family-uuid>', 'sibling@gmail.com', 'admin', '<owner-profile-uuid>');
```

- 이후 해당 이메일 사용자가 Google 로그인하면 `claim_family_memberships()` 함수가 실행되어 `family_members`에 자동 추가됩니다.

## 8) 웹 푸시 만료 알림 설정

### 8-1. 데이터베이스 마이그레이션
Supabase SQL Editor 또는 CLI에서 아래 마이그레이션을 적용합니다.

```text
supabase/migrations/20260712090000_web_push_notifications.sql
```

이 마이그레이션은 기기별 구독을 저장하는 `push_subscriptions`와 중복 발송을 막는
`notification_deliveries`를 생성합니다.

### 8-2. VAPID 키 생성

프로젝트에서 한 번만 실행합니다. 키 값은 화면에 출력하지 않고 `.env.local`에 저장합니다.

```bash
npm run setup:push
```

생성된 public/private key 쌍은 함께 유지해야 합니다. 운영 중 키를 바꾸면 기존 사용자가
다시 알림을 신청해야 할 수 있으므로, 스크립트는 이미 설정된 키를 덮어쓰지 않습니다.

### 8-3. 서버 및 Vercel 환경 변수

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
VAPID_SUBJECT=mailto:<관리자 이메일>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
CRON_SECRET=<16자 이상의 임의 문자열>
```

- `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`은 절대로 `NEXT_PUBLIC_` 접두사를 붙이거나 클라이언트에 노출하지 않습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 Supabase 프로젝트 API 설정에서 확인합니다.
- `vercel.json`은 `/api/cron/expiry-notifications`를 매일 `00:00 UTC`에 호출합니다. 한국 시간으로 오전 9시입니다.
- Vercel은 `CRON_SECRET`이 설정되어 있으면 cron 요청에 `Authorization: Bearer <CRON_SECRET>` 헤더를 추가합니다.

### 8-4. 기기 설정

- Android: 로그인 후 홈에서 `알림 받기`를 누르고 브라우저 권한을 허용합니다.
- iPhone/iPad: 홈 화면에 추가한 앱 아이콘으로 연 다음 `알림 받기`를 누릅니다.
- 기존 홈 화면 아이콘이 일반 Safari 탭으로 열린다면 아이콘을 제거하고 배포된 앱을 다시 홈 화면에 추가합니다.

### 8-5. 로컬 발송 확인

1. 로컬 HTTPS 또는 지원되는 로컬 브라우저 환경에서 알림을 구독합니다.
2. 테스트 기프티콘의 `expires_at`을 오늘 기준 1일, 3일 또는 7일 뒤로 설정합니다.
3. 개발 서버 실행 후 보호된 cron API를 호출합니다.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/expiry-notifications
```

응답의 `sent`가 증가하고 `notification_deliveries.status`가 `sent`인지 확인합니다. 동일한
기프티콘·기기·D-day 조합으로 다시 호출하면 `skipped`가 증가하며 중복 발송되지 않아야 합니다.
