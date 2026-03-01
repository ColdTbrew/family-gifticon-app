# 아키텍처 초안 (Web + Google OAuth)

## 1) 선택한 방향
- 클라이언트: Next.js 기반 PWA
- 인증: Supabase Auth + Google OAuth
- 데이터: Supabase Postgres
- 파일: Supabase Storage (기프티콘 이미지)
- 배포: Vercel

## 2) 사용자 흐름
1. 사용자가 Google 로그인
2. 최초 로그인 시 프로필 생성
3. 가족 그룹 생성 또는 초대 코드로 참여
4. 기프티콘 등록(텍스트 + 이미지)
5. 홈에서 만료 임박 쿠폰부터 확인
6. 캘린더에서 날짜별 만료 예정 확인
7. 사용 처리 및 상태 공유

## 3) 최소 데이터 모델
- `profiles`: `id`, `email`, `name`, `created_at`
- `families`: `id`, `name`, `owner_id`, `created_at`
- `family_members`: `id`, `family_id`, `user_id`, `role`
- `gifticons`: `id`, `family_id`, `title`, `brand`, `barcode`, `expires_at`, `status`
- `gifticon_images`: `id`, `gifticon_id`, `storage_path`
- `gifticon_events`: `id`, `gifticon_id`, `event_type`, `actor_id`, `created_at`

## 4) 권한 정책 (RLS)
- 로그인 사용자만 접근 가능
- `family_members`에 속한 가족의 데이터만 조회/수정 가능
- 이미지 경로도 동일한 가족 권한으로 제한

## 5) 구현 순서 (권장)
1. Supabase 프로젝트 생성 + Google OAuth 연결
2. 인증/세션 처리 (로그인, 로그아웃, 보호 라우트)
3. 가족 그룹 모델 + 초대 코드 플로우
4. 기프티콘 CRUD + 이미지 업로드
5. 만료 임박 우선 홈 섹션 + 정렬 규칙
6. 캘린더 뷰(월간) + 날짜별 만료 목록 연동
7. 만료 임박 알림 로직
8. PWA 설치/아이콘/manifest 정리

## 6) 임박 우선 규칙 (핵심)
- 기본 정렬: `expires_at ASC`
- 홈 우선 노출:
  - `오늘 만료` (D-0)
  - `곧 만료` (D-1 ~ D-3)
  - `주의` (D-4 ~ D-7)
- `status = used` 또는 `status = expired`는 기본 목록 하단 분리
- 서버/클라이언트 모두 동일한 기준일(`local timezone`) 사용
## 7) 초기 성공 지표
- 가족 1개 그룹 생성 성공률
- 첫 기프티콘 등록까지 걸린 시간
- 만료 임박 쿠폰 확인 후 사용 처리율
