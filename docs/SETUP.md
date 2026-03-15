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
4. `Auth > URL Configuration` 설정
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
