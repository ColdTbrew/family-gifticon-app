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
3. `Auth > URL Configuration` 설정
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`, 배포 URL (`https://<your-domain>/**`)

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
- 기프티콘 CRUD + Storage 업로드 연동

## 6) 참고
- 로그인만 완료한 초기 상태에서는 홈/캘린더에 표시할 기프티콘이 없어 빈 화면 안내가 보일 수 있습니다.
- `gifticons` 데이터는 가족 생성/멤버십 연결 후 표시됩니다.
